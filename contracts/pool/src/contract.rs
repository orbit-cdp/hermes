use sep_40_oracle::{Asset, PriceFeedClient};
use soroban_sdk::{contract, contractclient, Address, Env, contractimpl, token, panic_with_error, Symbol, Vec, Val, IntoVal, vec, log};
use soroban_sdk::auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation};
use soroban_sdk::unwrap::UnwrapOptimized;
use crate::constants::SCALAR_7;
use crate::errors::PoolError;
use crate::{oracle, storage};
use crate::storage::TokenInfo;
use soroban_fixed_point_math::SorobanFixedPoint;
use sep_41_token::StellarAssetClient;

#[contract]
pub struct PoolContract;

#[contractclient(name = "PoolClient")]
pub trait Pool {
    /// Initializes the pool contract
    ///
    /// # Arguments
    /// * `admin` - The admin address
    /// * `oracle` - The oracle contract address
    /// * `position_manager` - The position manager contract address
    /// * `spl` - The SLP token contract address
    /// * `token_a` - The address of token A
    /// * `token_b` - The address of token B
    ///
    /// # Panics
    /// * If the contract is already initialized
    /// * If the initial token supplies are not zero
    /// * If the target ratios of token A and token B do not sum to SCALAR_7
    fn initialize(e: Env, admin: Address, oracle: Address, position_manager: Address, spl: Address, token_a: TokenInfo, token_b: TokenInfo);

    /// Deposits liquidity into the pool
    ///
    /// # Arguments
    /// * `user` - The address of the user depositing
    /// * `token_a_amount` - The amount of token A to deposit
    /// * `token_b_amount` - The amount of token B to deposit
    ///
    /// # Returns
    /// The amount of SLP tokens minted to the user
    ///
    /// # Panics
    /// * If the deposit does not improve the token ratio towards the target ratio
    fn deposit(e: Env, user: Address, token_a_amount: i128, token_b_amount: i128) -> i128;

    /// Withdraws liquidity from the pool
    ///
    /// # Arguments
    /// * `user` - The address of the user withdrawing
    /// * `slp_amount` - The amount of SLP tokens to burn
    ///
    /// # Returns
    /// A tuple containing the amounts of token A and token B withdrawn
    ///
    /// # Panics
    /// * If there are insufficient funds in the pool for the withdrawal
    fn withdraw(e: Env, user: Address, slp_amount: i128) -> (i128, i128);

    /// Borrows assets from the pool (only callable by Position Manager)
    ///
    /// # Arguments
    /// * `token` - The address of the token to borrow
    /// * `amount` - The amount of the token to borrow
    /// * `fee` - The fee to pay for borrowing
    ///
    /// # Panics
    /// * If called by an address other than the position manager
    /// * If the token address is invalid
    /// * If there's insufficient liquidity in the pool
    /// * If borrowing would leave less than 10% of the total supply in the pool
    fn borrow(e: Env, token: Address, amount: i128, fee: i128);

    /// Repays borrowed assets to the pool (only callable by Position Manager)
    ///
    /// # Arguments
    /// * `token` - The address of the token to repay
    /// * `amount` - The amount of the token to repay
    /// * `fee` - The fee to pay for repayment
    ///
    /// # Panics
    /// * If called by an address other than the position manager
    /// * If the token address is invalid
    fn repay(e: Env, token: Address, amount: i128, fee: i128);

    /// Retrieves the oracle address
    ///
    /// # Returns
    /// The address of the oracle contract
    fn get_oracle(e: Env) -> Address;

    /// Retrieves the current SLP supply
    ///
    /// # Returns
    /// The current total supply of SLP tokens
    fn get_slp_supply(e: Env) -> i128;

    /// Retrieves the TokenInfo for a given token address
    ///
    /// # Arguments
    /// * `token` - The address of the token
    ///
    /// # Returns
    /// The TokenInfo for the given token
    ///
    /// # Panics
    /// * If the token address is invalid
    fn get_token_info(e: Env, token: Address) -> TokenInfo;
}

#[contractimpl]
impl Pool for PoolContract {
    fn initialize(e: Env, admin: Address, oracle: Address, position_manager: Address, spl: Address, token_a: TokenInfo, token_b: TokenInfo) {
        storage::extend_instance(&e);

        if storage::is_init(&e) {
            panic_with_error!(&e, PoolError::AlreadyInitialized);
        }

        storage::set_slp_token(&e, &spl);
        storage::set_slp_supply(&e, 0);

        if token_a.total_supply != 0 || token_b.total_supply != 0 {
            panic_with_error!(&e, PoolError::InvalidTokenSupply);
        }

        if token_a.target_ratio.checked_add(token_b.target_ratio).unwrap_optimized() != SCALAR_7 as u32 {
            panic_with_error!(&e, PoolError::InvalidTargetRatio);
        }

        storage::set_token_a_info(&e, &token_a);
        storage::set_token_b_info(&e, &token_b);

        storage::set_position_manager(&e, &position_manager);
        storage::set_oracle(&e, &oracle);
        storage::set_admin(&e, &admin);
    }

    fn deposit(e: Env, user: Address, token_a_amount: i128, token_b_amount: i128) -> i128 {
        storage::extend_instance(&e);
        user.require_auth();

        if !storage::is_init(&e) {
            panic_with_error!(&e, PoolError::NotInitialized);
        }

        let mut token_a_info = storage::get_token_a_info(&e);
        let mut token_b_info = storage::get_token_b_info(&e);

        let oracle = storage::get_oracle(&e);
        let token_a_price = oracle::load_price(&e, oracle.clone(), token_a_info.address.clone());
        let token_b_price = oracle::load_price(&e, oracle.clone(), token_b_info.address.clone());

        log!(&e, "a_price: {} b_price{}", token_a_price, token_b_price);

        // Calculate current pool value
        let a_value = token_a_info.total_supply.fixed_mul_floor(&e, &token_a_price, &SCALAR_7);
        let b_value = token_b_info.total_supply.fixed_mul_floor(&e, &token_b_price, &SCALAR_7);
        let total_value = a_value + b_value;

        log!(&e, "a_value: {} b_value: {} total: {}", a_value, b_value, total_value);

        // Calculate deposit value divide by SCALAR_7 since both are scaled by SCALAR_7
        let deposit_a_value = token_a_amount.fixed_mul_floor(&e, &token_a_price, &SCALAR_7);
        let deposit_b_value = token_b_amount.fixed_mul_floor(&e, &token_b_price, &SCALAR_7);
        let deposit_total_value = deposit_a_value + deposit_b_value;

        log!(&e, "deposit_a_value: {} deposit_b_value: {} deposit_total_value: {}", deposit_a_value, deposit_b_value, deposit_total_value);

        let (a_ratio, b_ratio) = if total_value == 0 {
            // First deposit, use the deposit amounts to calculate initial ratios
            let a_ratio = deposit_a_value.fixed_div_floor(&e, &deposit_total_value, &SCALAR_7);
            (a_ratio, SCALAR_7 - a_ratio)
        } else {
            let a_ratio = a_value.fixed_div_floor(&e, &total_value, &SCALAR_7);
            (a_ratio, SCALAR_7 - a_ratio)
        };

        log!(&e, "a_ratio: {} b_ratio", a_ratio, b_ratio);

        let new_total_value = total_value + deposit_total_value;

        // Calculate new ratios after deposit
        let (new_a_ratio, new_b_ratio) = if total_value == 0 {
            // First deposit, new ratios are the same as current (initial) ratios
            (a_ratio, b_ratio)
        } else {
            let new_a_value = a_value + deposit_a_value;
            let new_a_ratio = new_a_value.fixed_div_floor(&e, &new_total_value, &SCALAR_7);
            (new_a_ratio, SCALAR_7 - new_a_ratio)
        };

        log!(&e, "new_a_ratio: {} new_b_ratio: {}", new_a_ratio, new_b_ratio);

        // Check if deposit improves the target ratio
        if total_value != 0 {
            let target_a_ratio = token_a_info.target_ratio as i128;
            let target_b_ratio = token_b_info.target_ratio as i128;

            let a_diff = (a_ratio - target_a_ratio).abs();
            let new_a_diff = (new_a_ratio - target_a_ratio).abs();
            let b_diff = (b_ratio - target_b_ratio).abs();
            let new_b_diff = (new_b_ratio - target_b_ratio).abs();

            log!(&e, "current_a_diff: {} new_a_diff: {}", a_diff, new_a_diff);
            log!(&e, "current_b_diff: {} new_b_diff: {}", b_diff, new_b_diff);

            if new_a_diff > a_diff || new_b_diff > b_diff {
                panic_with_error!(&e, PoolError::DepositDoesNotImproveRatio);
            }
        } else {
            if a_ratio != token_a_info.target_ratio as i128 || b_ratio != token_b_info.target_ratio as i128 {
                panic_with_error!(&e, PoolError::DepositDoesNotImproveRatio);
            }
        }

        // Deposit improves the ratio, proceed with the deposit
        token_a_info.total_supply = token_a_info.total_supply + token_a_amount;
        token_b_info.total_supply = token_b_info.total_supply + token_b_amount;

        // Update storage
        storage::set_token_a_info(&e, &token_a_info);
        storage::set_token_b_info(&e, &token_b_info);

        // Transfer tokens from user to the contract
        let token_a_client = token::Client::new(&e, &token_a_info.address.clone());
        let token_b_client = token::Client::new(&e, &token_b_info.address.clone());
        token_a_client.transfer(&user, &e.current_contract_address(), &token_a_amount);
        token_b_client.transfer(&user, &e.current_contract_address(), &token_b_amount);

        // Mint SLP tokens
        let current_slp_supply = storage::get_slp_supply(&e);
        let slp_to_mint = if current_slp_supply == 0 {
            // If it's the first deposit, mint deposit_total_value of SLP
            deposit_total_value
        } else {
            // Calculate proportional amount of SLP to mint
            deposit_total_value.fixed_mul_floor(&e, &current_slp_supply, &SCALAR_7).fixed_div_floor(&e, &total_value, &SCALAR_7)
        };

        let new_slp_supply = current_slp_supply + slp_to_mint;
        storage::set_slp_supply(&e, new_slp_supply);

        // Mint SLP tokens to the user
        let slp_token = storage::get_slp_token(&e);
        let slp_client = StellarAssetClient::new(&e, &slp_token);
        slp_client.mint(&user, &slp_to_mint);

        log!(&e, "slp_to_mint: {}", slp_to_mint);

        slp_to_mint
    }

    fn withdraw(e: Env, user: Address, slp_amount: i128) -> (i128, i128) {
        storage::extend_instance(&e);
        user.require_auth();

        if !storage::is_init(&e) {
            panic_with_error!(&e, PoolError::NotInitialized);
        }

        let mut token_a_info = storage::get_token_a_info(&e);
        let mut token_b_info = storage::get_token_b_info(&e);

        let oracle = storage::get_oracle(&e);
        let token_a_price = oracle::load_price(&e, oracle.clone(), token_a_info.address.clone());
        let token_b_price = oracle::load_price(&e, oracle.clone(), token_b_info.address.clone());

        // Calculate current pool value
        let a_value = token_a_info.total_supply.fixed_mul_floor(&e, &token_a_price, &SCALAR_7);
        let b_value = token_b_info.total_supply.fixed_mul_floor(&e, &token_b_price, &SCALAR_7);
        let total_value = a_value + b_value;

        log!(&e, "a_value: {} b_value: {} total_value: {}", a_value, b_value, total_value);

        // Calculate USD value to withdraw
        let current_slp_supply = storage::get_slp_supply(&e);
        let withdraw_ratio = slp_amount.fixed_div_floor(&e, &current_slp_supply, &SCALAR_7);
        let withdraw_value = total_value.fixed_mul_floor(&e, &withdraw_ratio, &SCALAR_7);
        log!(&e, "withdraw_ratio: {} withdraw_value: {}", withdraw_ratio, withdraw_value);

        if withdraw_value == 0 || withdraw_value > total_value {
            panic_with_error!(&e, PoolError::InsufficientFundsForWithdrawal);
        }

        let a_ratio = a_value.fixed_div_floor(&e, &total_value, &SCALAR_7);
        let b_ratio = SCALAR_7 - a_ratio;

        log!(&e, "a_ratio: {} b_ratio: {}", a_ratio, b_ratio);

        // Calculate the USD value to withdraw for each token
        let (withdraw_a_value, withdraw_b_value) = if a_ratio == token_a_info.target_ratio as i128 {
            // If the pool is already at the target ratio, withdraw the same amount of each token
            let withdraw_a_value = withdraw_value.fixed_mul_floor(&e, &a_ratio, &SCALAR_7);
            (withdraw_a_value, withdraw_value - withdraw_a_value)
        } else if a_ratio > token_a_info.target_ratio as i128 {
            // If the pool is above the target ratio, withdraw more of token A
            let excess_a_ratio = a_ratio - token_a_info.target_ratio as i128;
            let adjust_factor = excess_a_ratio.fixed_div_floor(&e, &a_ratio, &SCALAR_7);
            let withdraw_a = withdraw_value.fixed_mul_floor(&e, &a_ratio, &SCALAR_7).fixed_mul_floor(&e, &(SCALAR_7 + adjust_factor), &SCALAR_7);
            log!(&e, "excess_a_ratio: {} adjust_factor: {} withdraw_a: {}", excess_a_ratio, adjust_factor, withdraw_a);
            (withdraw_a, withdraw_value - withdraw_a)
        } else {
            // If the pool is below the target ratio, withdraw more of token B
            let excess_b_ratio = token_a_info.target_ratio as i128 - a_ratio;
            let adjust_factor = excess_b_ratio.fixed_div_floor(&e, &b_ratio, &SCALAR_7);
            let withdraw_b = withdraw_value.fixed_mul_floor(&e, &b_ratio, &SCALAR_7).fixed_mul_floor(&e, &(SCALAR_7 + adjust_factor), &SCALAR_7);
            log!(&e, "excess_b_ratio: {} adjust_factor: {} withdraw_b: {}", excess_b_ratio, adjust_factor, withdraw_b);
            (withdraw_value - withdraw_b, withdraw_b)
        };

        log!(&e, "withdraw_a_value: {} withdraw_b_value: {}", withdraw_a_value, withdraw_b_value);

        let withdraw_a_amount = withdraw_a_value.fixed_div_floor(&e, &token_a_price, &SCALAR_7);
        let withdraw_b_amount = withdraw_b_value.fixed_div_floor(&e, &token_b_price, &SCALAR_7);

        log!(&e, "withdraw_a_amount: {} withdraw_b_amount: {}", withdraw_a_amount, withdraw_b_amount);

        // Check if there are sufficient funds for withdrawal
        let token_a_client = token::Client::new(&e, &token_a_info.address);
        let token_b_client = token::Client::new(&e, &token_b_info.address);
        let available_a = token_a_client.balance(&e.current_contract_address());
        let available_b = token_b_client.balance(&e.current_contract_address());

        if withdraw_a_amount > available_a || withdraw_b_amount > available_b {
            panic_with_error!(&e, PoolError::InsufficientFundsForWithdrawal);
        }

        // Update token supplies
        token_a_info.total_supply = token_a_info.total_supply - withdraw_a_amount;
        token_b_info.total_supply = token_b_info.total_supply - withdraw_b_amount;
        storage::set_token_a_info(&e, &token_a_info);
        storage::set_token_b_info(&e, &token_b_info);

        // Burn SLP tokens
        let new_slp_supply = current_slp_supply - slp_amount;
        storage::set_slp_supply(&e, new_slp_supply);

        let slp_token = storage::get_slp_token(&e);
        let slp_token_client = token::Client::new(&e, &slp_token);
        slp_token_client.burn(&user, &slp_amount);

        // Transfer tokens to the user
        token_a_client.transfer(&e.current_contract_address(), &user, &withdraw_a_amount);
        token_b_client.transfer(&e.current_contract_address(), &user, &withdraw_b_amount);

        (withdraw_a_amount, withdraw_b_amount)
    }

    fn borrow(e: Env, token: Address, amount: i128, fee: i128) {
        storage::extend_instance(&e);

        let position_manager = storage::get_position_manager(&e);
        position_manager.require_auth();
        position_manager.require_auth_for_args(vec![&e, token.clone().into_val(&e)]);

        //TODO: This seems stupid
        let token_a_info = storage::get_token_a_info(&e);
        let mut token_info = token_a_info.clone();
        if token != token_a_info.address {
            token_info = storage::get_token_b_info(&e);
            if token != token_info.address {
                panic_with_error!(&e, PoolError::InvalidTokenAddress);
            }
        }

        let token_client = token::Client::new(&e, &token);
        let current_balance = token_client.balance(&e.current_contract_address());

        // Check if there's enough liquidity to borrow
        if amount > current_balance {
            panic_with_error!(&e, PoolError::InsufficientLiquidity);
        }

        // Check if borrowing would leave less than 10% of total supply
        let min_required_balance = token_info.total_supply / 10; //TODO: This does not require fixed point math?
        if current_balance - amount < min_required_balance {
            panic_with_error!(&e, PoolError::ExcessiveBorrowing);
        }

        // Transfer the borrowed amount to the position manager
        token_client.transfer(&e.current_contract_address(), &position_manager, &amount);

        //TODO: Fix this with authorization for now fee is 0 so it's not needed
        // Transfer the fee from the position manager to the pool
        //token_client.transfer(&position_manager, &e.current_contract_address(), &fee);

        // Update the token supply with the fee
        token_info.total_supply = token_info.total_supply + fee;

        // Update storage
        if token == token_a_info.address {
            storage::set_token_a_info(&e, &token_info);
        } else {
            storage::set_token_b_info(&e, &token_info);
        }
    }

    fn repay(e: Env, token: Address, amount: i128, fee: i128) {
        storage::extend_instance(&e);

        let position_manager = storage::get_position_manager(&e);
        position_manager.require_auth();

        let token_a_info = storage::get_token_a_info(&e);
        let mut token_info = token_a_info.clone();

        if token != token_a_info.address {
            token_info = storage::get_token_b_info(&e);
            if token != token_info.address {
                panic_with_error!(&e, PoolError::InvalidTokenAddress);
            }
        }

        let token_client = token::Client::new(&e, &token);

        // Transfer the repaid amount from the position manager to the pool
        token_client.transfer(&position_manager, &e.current_contract_address(), &(amount + fee));

        // Update the token supply with the fee
        token_info.total_supply = token_info.total_supply + fee;

        // Update storage
        if token == token_a_info.address {
            storage::set_token_a_info(&e, &token_info);
        } else {
            storage::set_token_b_info(&e, &token_info);
        }
    }

    fn get_oracle(e: Env) -> Address {
        storage::extend_instance(&e);
        storage::get_oracle(&e)
    }

    fn get_slp_supply(e: Env) -> i128 {
        storage::extend_instance(&e);
        storage::get_slp_supply(&e)
    }

    fn get_token_info(e: Env, token: Address) -> TokenInfo {
        storage::extend_instance(&e);
        let token_a_info = storage::get_token_a_info(&e);
        if token == token_a_info.address {
            return token_a_info;
        }

        let token_b_info = storage::get_token_b_info(&e);
        if token == token_b_info.address {
            return token_b_info;
        }

        panic_with_error!(&e, PoolError::InvalidTokenAddress);
    }
}

