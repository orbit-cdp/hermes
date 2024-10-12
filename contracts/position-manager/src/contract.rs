use sep_40_oracle::{Asset, PriceFeedClient};
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, contractclient, panic_with_error, IntoVal, vec, Vec, Val};
use soroban_sdk::token::TokenClient;
use soroban_sdk::unwrap::UnwrapOptimized;
use crate::constants::SCALAR_7;
use crate::{oracle, storage};
use crate::storage::Position;
use crate::dependencies::pool::Client as PoolClient;
use crate::errors::PositionManagerError;
use soroban_fixed_point_math::SorobanFixedPoint;
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
    fn open_position(env: Env, user: Address, collateral: i128, size: u32, token: Address);

    /// Closes an existing position for a user
    ///
    /// # Arguments
    /// * `user` - The address of the user closing the position
    fn close_position(env: Env, user: Address);

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

    fn open_position(env: Env, user: Address, input: i128, size: u32, token: Address) {
        storage::extend_instance(&env);

        //User must authenticate the opening of a position
        user.require_auth();

        // Only 1 position per user
        if storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::PositionAlreadyExists);
        }

        // Calculate fee and remaining collateral
        let fee =  input.fixed_mul_ceil(&env, &10000, &SCALAR_7); // 0.1% fee
        let collateral = input - fee; // multiply to get the actual value minus opening fee

        // Create the position
        let oracle = storage::get_oracle(&env);

        let token_a = storage::get_token_a(&env);
        let token_b = storage::get_token_b(&env);
        let other_token = if token == token_a { token_b } else { token_a };
        let token_price = oracle::load_price(&env, oracle.clone(), token.clone());
        let other_token_price = oracle::load_price(&env, oracle.clone(), other_token.clone());
        let entry_price = token_price.fixed_div_floor(&env, &other_token_price, &SCALAR_7);


        let to_borrow = collateral.fixed_mul_floor(&env, &(size as i128), &SCALAR_7);
        let position = Position {
            token: token.clone(),
            entry_price,
            borrowed: to_borrow,
            collateral,
            timestamp: env.ledger().timestamp(),
        };

        // Transfer the collateral to the position manager
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&user, &env.current_contract_address(), &input);

        // Borrow the token from the pool
        let pool_contract = storage::get_pool_contract(&env);
        let pool_client = PoolClient::new(&env, &pool_contract);

        //token_client.approve(&env.current_contract_address(), &pool_contract, &fee, &(env.ledger().sequence() + 1));
        pool_client.borrow(&token, &to_borrow, &fee);

        // Save the users position
        storage::set_position(&env, &user, &position);
    }

    fn close_position(env: Env, user: Address) {
        storage::extend_instance(&env);

        //User must authenticate the closing of a position
        user.require_auth();

        // Check if the user has a position
        if !storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::NoPositionExists);
        }

        let position = storage::get_position(&env, &user);

        // Calculate the amount to repay
        let total_position = position.borrowed + position.collateral;
        let borrowed_value = position.borrowed.fixed_mul_floor(&env, &position.entry_price, &SCALAR_7);

        let token_a = storage::get_token_a(&env);
        let token_b = storage::get_token_b(&env);
        let token = position.token.clone();
        let other_token = if token == token_a { token_b } else { token_a };
        let oracle = storage::get_oracle(&env);


        let token_price = oracle::load_price(&env, oracle.clone(), token.clone());
        let other_token_price = oracle::load_price(&env, oracle.clone(), other_token.clone());
        let current_price = token_price.fixed_div_floor(&env, &other_token_price, &SCALAR_7);

        let mut to_repay = borrowed_value.fixed_div_floor(&env, &current_price, &SCALAR_7);

        let mut to_repay_user = total_position - to_repay;
        let fee = to_repay_user.fixed_mul_ceil(&env, &10000, &SCALAR_7);
        to_repay_user -= fee;
        to_repay += fee;
        //TODO: Check if position is not negative

        // Repay the borrowed amount
        let pool_contract = storage::get_pool_contract(&env);
        let pool_client = PoolClient::new(&env, &pool_contract);
        let token_client = TokenClient::new(&env, &position.token);

        let args: Vec<Val> = vec![
            &env,
            (env.current_contract_address()).into_val(&env),
            pool_contract.into_val(&env),
            to_repay.into_val(&env),
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
        pool_client.repay(&position.token, &to_repay, &0);

        //

        // Transfer rest of position back
        token_client.transfer(&env.current_contract_address(), &user, &to_repay_user);

        storage::remove_position(&env, &user);
    }

    fn liquidate(env: Env, user: Address, liquidator: Address) {
        storage::extend_instance(&env);

        if !storage::has_position(&env, &user) {
            panic_with_error!(&env, PositionManagerError::NoPositionExists);
        }

        let position = storage::get_position(&env, &user);

        //TODO: Calculate fee based on timestamp and substract from collateral

        let total_position = position.borrowed + position.collateral;
        let margin_ratio = position.borrowed.fixed_div_floor(&env, &total_position, &SCALAR_7);
        let one_minus_margin_ratio = SCALAR_7.checked_sub(margin_ratio).unwrap_optimized();
        let liquidation_price = position.entry_price.fixed_mul_floor(&env, &one_minus_margin_ratio, &SCALAR_7);

        // Actual liquidation price is 1% higher than the liquidation price
        let actual_liquidation_price = liquidation_price.checked_mul(1_010_0000).unwrap_optimized();

        let oracle = storage::get_oracle(&env);
        let token_a = storage::get_token_a(&env);
        let token_b = storage::get_token_b(&env);
        let token = position.token.clone();
        let other_token = if token == token_a { token_b } else { token_a };

        let token_price = oracle::load_price(&env, oracle.clone(), token.clone());
        let other_token_price = oracle::load_price(&env, oracle.clone(), other_token.clone());
        let current_price = token_price.fixed_div_floor(&env, &other_token_price, &SCALAR_7);

        // Liquidation login
        if current_price <= actual_liquidation_price {
            let borrowed_value = position.borrowed.fixed_mul_floor(&env, &position.entry_price, &SCALAR_7);
            let to_repay = borrowed_value.fixed_div_floor(&env, &current_price, &SCALAR_7);
            let liquidation_fee = total_position - to_repay;

            // Liquidate the position
            let pool_contract = storage::get_pool_contract(&env);
            let pool_client = PoolClient::new(&env, &pool_contract);
            let token_client = TokenClient::new(&env, &position.token);

            let args: Vec<Val> = vec![
                &env,
                (env.current_contract_address()).into_val(&env),
                pool_contract.into_val(&env),
                to_repay.into_val(&env),
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
            pool_client.repay(&position.token, &to_repay, &0);

            // Transfer the liquidation fee to the liquidator
            token_client.transfer(&env.current_contract_address(), &liquidator, &liquidation_fee);

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