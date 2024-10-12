use core::iter::TakeWhile;
use soroban_sdk::{contracttype, Address, Env};
use soroban_sdk::unwrap::UnwrapOptimized;

const ONE_DAY_LEDGERS: u32 = 17280; // assumes 5s a ledger

const LEDGER_THRESHOLD_INSTANCE: u32 = ONE_DAY_LEDGERS * 30; // ~ 30 days
const LEDGER_BUMP_INSTANCE: u32 = LEDGER_THRESHOLD_INSTANCE + ONE_DAY_LEDGERS; // ~ 31 days

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Oracle,
    PoolContract,
    TokenA,
    TokenB,
    Position(Address), // User's address as the key
}

#[derive(Clone)]
#[contracttype]
pub struct Position {
    pub filled: bool,
    pub token: Address,
    pub entry_price: i128,
    pub stop_loss: i128,
    pub take_profit: i128,
    pub borrowed: i128,
    pub collateral: i128,
    pub leverage: u32,
    pub timestamp: u64,
}

/// Bump the instance rent for the contract
pub fn extend_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(LEDGER_THRESHOLD_INSTANCE, LEDGER_BUMP_INSTANCE);
}

/// Check if the contract has been initialized
pub fn is_init(e: &Env) -> bool {
    e.storage().instance().has(&DataKey::PoolContract)
}

/// Fetch the current oracle Address
pub fn get_oracle(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::Oracle).unwrap_optimized()
}

/// Set a new oracle
///
/// ### Arguments
/// * `address` - The Address for the oracle
pub fn set_oracle(env: &Env, address: &Address) {
    env.storage().instance().set(&DataKey::Oracle, address);
}

/// Fetch the current pool contract Address
pub fn get_pool_contract(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::PoolContract).unwrap_optimized()
}

/// Set a new pool contract
///
/// ### Arguments
/// * `address` - The Address for the pool contract
pub fn set_pool_contract(env: &Env, address: &Address) {
    env.storage().instance().set(&DataKey::PoolContract, address);
}

/// Fetch a user's position
///
/// ### Arguments
/// * `user` - The Address of the user
pub fn get_position(env: &Env, user: &Address) -> Position {
    env.storage().instance().get(&DataKey::Position(user.clone())).unwrap_optimized()
}

pub fn has_position(env: &Env, user: &Address) -> bool {
    env.storage().instance().has(&DataKey::Position(user.clone()))
}

/// Set a user's position
///
/// ### Arguments
/// * `user` - The Address of the user
/// * `position` - The Position to set
pub fn set_position(env: &Env, user: &Address, position: &Position) {
    env.storage().instance().set(&DataKey::Position(user.clone()), position);
}

/// Remove a user's position
///
/// ### Arguments
/// * `user` - The Address of the user
pub fn remove_position(env: &Env, user: &Address) {
    env.storage().instance().remove(&DataKey::Position(user.clone()));
}

/// Fetch the current token A Address
pub fn get_token_a(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::TokenA).unwrap_optimized()
}

/// Set a new token A
///
/// ### Arguments
/// * `address` - The Address for token A
pub fn set_token_a(env: &Env, address: &Address) {
    env.storage().instance().set(&DataKey::TokenA, address);
}

/// Fetch the current token B Address
pub fn get_token_b(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::TokenB).unwrap_optimized()
}

/// Set a new token B
///
/// ### Arguments
/// * `address` - The Address for token B
pub fn set_token_b(env: &Env, address: &Address) {
    env.storage().instance().set(&DataKey::TokenB, address);
}