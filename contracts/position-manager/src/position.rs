use soroban_fixed_point_math::SorobanFixedPoint;
use soroban_sdk::{Address, Env, IntoVal, Symbol, Val, Vec, vec};
use soroban_sdk::auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation};
use soroban_sdk::token::TokenClient;
use crate::constants::{BASE_FEE, HOURLY_BASE_FEE, IMPACT_FEE_SCALAR, SCALAR_7};
use crate::storage;
use crate::storage::Position;

pub(crate) fn repay(env: &Env, token: Address, user: Address, to_repay_user: i128, to_repay: i128, fee: i128) {
    let pool_contract = storage::get_pool_contract(env);
    let pool_client = crate::dependencies::pool::Client::new(env, &pool_contract);
    let token_client = TokenClient::new(env, &token);

    let args: Vec<Val> = vec![
        env,
        (env.current_contract_address()).into_val(env),
        pool_contract.into_val(env),
        (to_repay + fee).into_val(env),
    ];
    env.authorize_as_current_contract(vec![
        env,
        InvokerContractAuthEntry::Contract(SubContractInvocation {
            context: ContractContext {
                contract: token.clone(),
                fn_name: Symbol::new(env, "transfer"),
                args: args.clone(),
            },
            sub_invocations: vec![env],
        }),
    ]);
    pool_client.repay(&token, &to_repay, &0);

    // Transfer rest of position back
    token_client.transfer(&env.current_contract_address(), &user, &to_repay_user);

    storage::remove_position(env, &user);
}

pub(crate) fn calculate_impact_fee(env: &Env, borrow_size: i128, current_price: i128) -> i128 {
    let trade_notional_size = borrow_size.fixed_mul_ceil(&env, &current_price, &SCALAR_7);
    let trading_coefficient = trade_notional_size.fixed_div_ceil(&env, &IMPACT_FEE_SCALAR, &SCALAR_7);
    BASE_FEE + trading_coefficient
}

pub(crate) fn calculate_repay_and_fee(env: &Env, position: Position) -> (i128, i128) {
    let oracle = storage::get_oracle(&env);
    let current_price = crate::oracle::load_relative_price(&env, oracle, position.token.clone());
    let borrowed_value = position.borrowed.fixed_mul_floor(&env, &position.entry_price, &SCALAR_7);
    let mut to_repay = borrowed_value.fixed_div_floor(&env, &current_price, &SCALAR_7);

    // Hourly fee
    let pool_contract = storage::get_pool_contract(&env);
    let pool_client = crate::dependencies::pool::Client::new(&env, &pool_contract);
    let token_client = TokenClient::new(&env, &position.token.clone());

    let token_info = pool_client.get_token_info(&position.token.clone());
    let pool_balance = token_client.balance(&pool_contract);

    let token_util = token_info.total_supply.fixed_div_ceil(&env, &pool_balance, &SCALAR_7);
    let temp_calc = token_util.fixed_mul_ceil(&env, &position.borrowed, &SCALAR_7);
    let hourly_fee = temp_calc.fixed_mul_ceil(&env, &HOURLY_BASE_FEE, &SCALAR_7);

    let seconds_elapsed = env.ledger().timestamp() - position.timestamp;
    let hours_elapsed = (seconds_elapsed as i128 * SCALAR_7).fixed_div_ceil(&env, &(3600 * SCALAR_7), &SCALAR_7);

    let mut fee = hourly_fee.fixed_mul_ceil(&env, &hours_elapsed, &SCALAR_7);
    fee += calculate_impact_fee(&env, position.borrowed, current_price);
    fee = fee.fixed_mul_ceil(&env, &position.borrowed, &SCALAR_7);

    (to_repay, fee)
}