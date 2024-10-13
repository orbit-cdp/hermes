use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, contractclient, panic_with_error, IntoVal, vec, Vec, Val};
use soroban_sdk::token::TokenClient;
use soroban_sdk::unwrap::UnwrapOptimized;
use crate::constants::{MAX_LEVERAGE, SCALAR_7};
use crate::{oracle, position, storage};
use crate::storage::Position;
use crate::dependencies::pool::Client as PoolClient;
use crate::errors::PositionManagerError;
use soroban_fixed_point_math::{SorobanFixedPoint};
use soroban_sdk::auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation};

#[contract]
pub struct PositionManagerContract;

#[contractclient(name = "PositionManagerClient")]
pub trait PositionManager {
    /// Initializes the position manager contract
    ///
    /// # Arguments
    /// * `pool_contract` - The pool contract address (also serves as admin)
    /// * `oracle` - The oracle contract address
    fn initialize(env: Env, pool_contract: Address, oracle: Address, token_a: Address, token_b: Address);

    /// Opens a new position for a user
    ///
    /// # Arguments
    /// * `user` - The address of the user opening the position
    /// * `collateral` - The amount of collateral to deposit
    /// * `size` - The size of the position
    /// * `token` - The address of the token to borrow
    fn open_position(env: Env, user: Address, collateral: i128, size: u32, token: Address) -> i128;

    /// Open a new limit position for a user
    ///
    /// # Arguments
    /// * `user` - The address of the user opening the position
    /// * `collateral` - The amount of collateral to deposit
    /// * `size` - The size of the position
    /// * `token` - The address of the token to borrow
    /// * `entry_price` - The price at which the position should be opened
    fn open_limit_position(env: Env, user: Address, collateral: i128, size: u32, token: Address, entry_price: i128) -> i128;

    fn fill_position(env: Env, user: Address, fee_taker: Address);

    fn add_stop_loss(env: Env, user: Address, stop_loss: i128);

    fn add_take_profit(env: Env, user: Address, take_profit: i128);

    /// Closes an existing position for a user
    ///
    /// # Arguments
    /// * `user` - The address of the user closing the position
    fn close_position(env: Env, user: Address) -> (i128, i128);

    /// Liquidates a user's position if it meets liquidation criteria
    ///
    /// # Arguments
    /// * `user` - The address of the user whose position is being liquidated
    /// * `liquidator` - The address of the account performing the liquidation //Not needed for MVP
    fn liquidate(env: Env, user: Address, liquidator: Address);

    /// Retrieves the current position for a user
    ///
    /// # Arguments
    /// * `user` - The address of the user
    ///
    /// # Returns
    /// The user's current position
    ///
    /// # Panics
    /// If the user has no open position
    fn get_position(env: Env, user: Address) -> Position;
}

#[contractimpl]
impl PositionManager for PositionManagerContract {
    fn initialize(env: Env, pool_contract: Address, oracle: Address, token_a: Address, token_b: Address) {
        storage::extend_instance(&env);

        if storage::is_init(&env) {
            panic_with_error!(&env, PositionManagerError::AlreadyInitialized);
        }

        storage::set_oracle(&env, &oracle);
        storage::set_token_a(&env, &token_a);
        storage::set_token_b(&env, &token_b);
        storage::set_pool_contract(&env, &pool_contract);
    }

    fn open_position(env: Env, user: Address, input: i128, size: u32, token: Address) -> i128 {
        storage::extend_instance(&env);

        //User must authenticate the opening of a position
        user.require_auth();

        // Only 1 position per user
        if storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::PositionAlreadyExists);
        }

        // Create the position
        let oracle = storage::get_oracle(&env);
        let entry_price = oracle::load_relative_price(&env, oracle.clone(), token.clone());

        let to_borrow = input.fixed_mul_floor(&env, &(size as i128), &SCALAR_7);
        let fee = position::calculate_impact_fee(&env, to_borrow, entry_price);
        let position = Position {
            filled: true,
            token: token.clone(),
            stop_loss: 0,
            take_profit: 0,
            entry_price,
            borrowed: to_borrow,
            leverage: size,
            collateral: input,
            timestamp: env.ledger().timestamp(),
        };

        // Transfer the collateral to the position manager
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&user, &env.current_contract_address(), &(input + fee));

        // Borrow the token from the pool
        let pool_contract = storage::get_pool_contract(&env);
        let pool_client = PoolClient::new(&env, &pool_contract);

        let args: Vec<Val> = vec![
            &env,
            (env.current_contract_address()).into_val(&env),
            pool_contract.into_val(&env),
            fee.into_val(&env),
        ];
        env.authorize_as_current_contract(vec![
            &env,
            InvokerContractAuthEntry::Contract(SubContractInvocation {
                context: ContractContext {
                    contract: token.clone(),
                    fn_name: Symbol::new(&env, "transfer"),
                    args: args.clone(),
                },
                sub_invocations: vec![&env],
            }),
        ]);
        pool_client.borrow(&token, &to_borrow, &fee);

        storage::set_position(&env, &user, &position);
        fee
    }

    fn open_limit_position(env: Env, user: Address, input: i128, size: u32, token: Address, entry_price: i128) -> i128 {
        storage::extend_instance(&env);

        //User must authenticate the opening of a position
        user.require_auth();

        // Only 1 position per user
        if storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::PositionAlreadyExists);
        }

        let position = Position {
            filled: false,
            token: token.clone(),
            stop_loss: 0,
            take_profit: 0,
            entry_price,
            borrowed: 0,
            leverage: size,
            collateral: input,
            timestamp: env.ledger().timestamp(),
        };

        let to_borrow = input.fixed_mul_floor(&env, &(size as i128), &SCALAR_7);
        let fee = position::calculate_impact_fee(&env, to_borrow, entry_price);
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&user, &env.current_contract_address(), &(input + fee));

        storage::set_position(&env, &user, &position);
        fee
    }

    fn add_stop_loss(env: Env, user: Address, stop_loss: i128) {
        storage::extend_instance(&env);

        user.require_auth();

        if !storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::NoPositionExists);
        }

        let mut position = storage::get_position(&env, &user);
        position.stop_loss = stop_loss;

        storage::set_position(&env, &user, &position);
    }

    fn add_take_profit(env: Env, user: Address, take_profit: i128) {
        storage::extend_instance(&env);

        user.require_auth();

        if !storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::NoPositionExists);
        }

        let mut position = storage::get_position(&env, &user);
        position.take_profit = take_profit;

        storage::set_position(&env, &user, &position);
    }

    fn fill_position(env: Env, user: Address, fee_taker: Address) {
        //TODO: Reward user calling part of the fee
        storage::extend_instance(&env);

        if !storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::NoPositionExists);
        }

        let position = storage::get_position(&env, &user);
        let token = position.token.clone();
        let oracle = storage::get_oracle(&env);
        let current_price = oracle::load_relative_price(&env, oracle.clone(), token.clone());

        if position.filled {
            if (position.take_profit != 0 && current_price >= position.take_profit) || (position.stop_loss != 0 && current_price <= position.stop_loss) {
                let total_position = position.borrowed + position.collateral;
                let (to_repay, fee) = position::calculate_repay_and_fee(&env, position.clone());
                let to_repay_user = total_position - to_repay - fee;

                position::repay(&env, token, user, to_repay_user, to_repay, fee);
            }
        } else {
            if position.entry_price < current_price {
                panic_with_error!(&env, PositionManagerError::PositionNotFilled);
            }

            let to_borrow = position.collateral.fixed_mul_floor(&env, &(position.leverage as i128), &SCALAR_7);
            let fee = position::calculate_impact_fee(&env, to_borrow, position.entry_price);
            let new_position = Position {
                filled: true,
                token: position.token.clone(),
                stop_loss: position.stop_loss,
                take_profit: position.take_profit,
                entry_price: current_price,
                borrowed: to_borrow,
                leverage: position.leverage,
                collateral: position.collateral,
                timestamp: env.ledger().timestamp(),
            };

            let pool_contract = storage::get_pool_contract(&env);
            let pool_client = PoolClient::new(&env, &pool_contract);

            let args: Vec<Val> = vec![
                &env,
                (env.current_contract_address()).into_val(&env),
                pool_contract.into_val(&env),
                fee.into_val(&env),
            ];
            env.authorize_as_current_contract(vec![
                &env,
                InvokerContractAuthEntry::Contract(SubContractInvocation {
                    context: ContractContext {
                        contract: token.clone(),
                        fn_name: Symbol::new(&env, "transfer"),
                        args: args.clone(),
                    },
                    sub_invocations: vec![&env],
                }),
            ]);
            pool_client.borrow(&token, &to_borrow, &fee);

            storage::set_position(&env, &user, &new_position);
        }
    }

    fn close_position(env: Env, user: Address) -> (i128, i128) {
        storage::extend_instance(&env);

        user.require_auth();

        if !storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::NoPositionExists);
        }

        let position = storage::get_position(&env, &user);

        let total_position = position.borrowed + position.collateral;
        let (to_repay, fee) = position::calculate_repay_and_fee(&env, position.clone());
        let to_repay_user = total_position - to_repay - fee;

        position::repay(&env, position.token.clone(), user, to_repay_user, to_repay, fee);
        (to_repay_user, fee)
    }

    fn liquidate(env: Env, user: Address, liquidator: Address) {
        storage::extend_instance(&env);

        if !storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::NoPositionExists);
        }

        let position = storage::get_position(&env, &user);

        let current_price = oracle::load_relative_price(&env, storage::get_oracle(&env), position.token.clone());
        let borrowed_value = position.borrowed.fixed_mul_floor(&env, &current_price, &SCALAR_7);
        let collateral_value = position.collateral.fixed_mul_floor(&env, &current_price, &SCALAR_7);
        let (to_repay, fee) = position::calculate_repay_and_fee(&env, position.clone());

        let size_ratio = borrowed_value.fixed_div_floor(&env, &MAX_LEVERAGE, &SCALAR_7);
        let mut liquidation_premium = collateral_value - fee - size_ratio;
        liquidation_premium = liquidation_premium.fixed_mul_floor(&env, &current_price, &SCALAR_7);
        liquidation_premium = liquidation_premium.fixed_div_floor(&env, &position.borrowed, &SCALAR_7);

        let liquidation_price = position.entry_price + liquidation_premium;

        if current_price <= liquidation_price {
            let borrowed_value = position.borrowed.fixed_mul_floor(&env, &position.entry_price, &SCALAR_7);
            let to_repay = borrowed_value.fixed_div_floor(&env, &current_price, &SCALAR_7);
            let liquidation_fee = position.borrowed + position.collateral - to_repay;

            // Liquidate the position
            let pool_contract = storage::get_pool_contract(&env);
            let pool_client = PoolClient::new(&env, &pool_contract);
            let token_client = TokenClient::new(&env, &position.token);

            let args: Vec<Val> = vec![
                &env,
                (env.current_contract_address()).into_val(&env),
                pool_contract.into_val(&env),
                (to_repay + liquidation_fee).into_val(&env),
            ];
            env.authorize_as_current_contract(vec![
                &env,
                InvokerContractAuthEntry::Contract(SubContractInvocation {
                    context: ContractContext {
                        contract: position.token.clone(),
                        fn_name: Symbol::new(&env, "transfer"),
                        args: args.clone(),
                    },
                    sub_invocations: vec![&env],
                }),
            ]);
            pool_client.repay(&position.token, &to_repay, &liquidation_fee);

            // Remove the position
            storage::remove_position(&env, &user);
        } else {
            panic_with_error!(env, PositionManagerError::PositionNotLiquidatable);
        }
    }

    fn get_position(env: Env, user: Address) -> Position {
        storage::extend_instance(&env);

        if !storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::NoPositionExists);
        }

        storage::get_position(&env, &user)
    }
}