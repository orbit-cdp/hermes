use sep_40_oracle::{Asset, PriceFeedClient};
use soroban_fixed_point_math::SorobanFixedPoint;
use soroban_sdk::{Address, Env, panic_with_error};
use soroban_sdk::unwrap::UnwrapOptimized;
use crate::errors::PositionManagerError;
use crate::{storage};
use crate::constants::SCALAR_7;

/// Load a price from the Pool's oracle without caching.
///
/// ### Arguments
/// * e - The environment
/// * oracle - The address of the oracle contract
/// * asset - The address of the underlying asset
///
/// ### Panics
/// If the price is stale
pub(crate) fn load_price(e: &Env, oracle: Address, asset: Address) -> i128 {
    let oracle_client = PriceFeedClient::new(e, &oracle);
    let oracle_asset = Asset::Stellar(asset.clone());
    let price_data = oracle_client.lastprice(&oracle_asset).unwrap_optimized();
    if price_data.timestamp + 24 * 60 * 60 < e.ledger().timestamp() {
        panic_with_error!(e, PositionManagerError::StalePriceData);
    }
    price_data.price
}

pub(crate) fn load_relative_price(env: &Env, oracle: Address, token: Address) -> i128 {
    let token_a = storage::get_token_a(env);
    let token_b = storage::get_token_b(env);
    let other_token = if token == token_a { token_b } else { token_a };
    let token_price = load_price(&env, oracle.clone(), token.clone());
    let other_token_price = load_price(&env, oracle.clone(), other_token.clone());
    return token_price.fixed_div_floor(env, &other_token_price, &SCALAR_7);
}