use soroban_sdk::{contracttype, Address, Env};
use soroban_sdk::unwrap::UnwrapOptimized;

const ONE_DAY_LEDGERS: u32 = 17280; // assumes 5s a ledger

const LEDGER_THRESHOLD_INSTANCE: u32 = ONE_DAY_LEDGERS * 30; // ~ 30 days
const LEDGER_BUMP_INSTANCE: u32 = LEDGER_THRESHOLD_INSTANCE + ONE_DAY_LEDGERS; // ~ 31 days

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Oracle,
    PositionManager,
    SlpToken,
    SlpSupply,
    TokenA,
    TokenB,
}

#[derive(Clone)]
#[contracttype]
pub struct TokenInfo {
    pub address: Address,
    pub total_supply: i128,
    pub target_ratio: u32,
}

/// Bump the instance rent for the contract
pub fn extend_instance(env: &Env) {
    env.storage()
        .instance()
        .extend_ttl(LEDGER_THRESHOLD_INSTANCE, LEDGER_BUMP_INSTANCE);
}

/// Check if the contract has been initialized
pub fn is_init(e: &Env) -> bool {
    e.storage().instance().has(&DataKey::Admin)
}

/// Fetch the current admin Address
pub fn get_admin(e: &Env) -> Address {
    e.storage().instance().get(&DataKey::Admin).unwrap_optimized()
}

/// Set a new admin
///
/// ### Arguments
/// * `new_admin` - The Address for the admin
pub fn set_admin(e: &Env, new_admin: &Address) {
    e.storage().instance().set(&DataKey::Admin, new_admin);
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

/// Fetch the current position manager Address
pub fn get_position_manager(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::PositionManager).unwrap_optimized()
}

/// Set a new position manager
///
/// ### Arguments
/// * `address` - The Address for the position manager
pub fn set_position_manager(env: &Env, address: &Address) {
    env.storage().instance().set(&DataKey::PositionManager, address);
}

/// Fetch the current SLP token Address
pub fn get_slp_token(env: &Env) -> Address {
    env.storage().instance().get(&DataKey::SlpToken).unwrap_optimized()
}

/// Set a new SLP token
///
/// ### Arguments
/// * `address` - The Address for the SLP token
pub fn set_slp_token(env: &Env, address: &Address) {
    env.storage().instance().set(&DataKey::SlpToken, address);
}

/// Fetch the current SLP token supply
pub fn get_slp_supply(env: &Env) -> i128 {
    env.storage().instance().get(&DataKey::SlpSupply).unwrap_optimized()
}

/// Set a new SLP token supply
///
/// ### Arguments
/// * `supply` - The supply of the SLP token
pub fn set_slp_supply(env: &Env, supply: i128) {
    env.storage().instance().set(&DataKey::SlpSupply, &supply);
}

/// Fetch the token info for Token A
pub fn get_token_a_info(env: &Env) -> TokenInfo {
    env.storage().instance().get(&DataKey::TokenA).unwrap_optimized()
}

/// Set the token info for Token A
///
/// ### Arguments
/// * `info` - The TokenInfo to set
pub fn set_token_a_info(env: &Env, info: &TokenInfo) {
    env.storage().instance().set(&DataKey::TokenA, info);
}

/// Fetch the token info for Token B
pub fn get_token_b_info(env: &Env) -> TokenInfo {
    env.storage().instance().get(&DataKey::TokenB).unwrap_optimized()
}

/// Set the token info for Token B
///
/// ### Arguments
/// * `info` - The TokenInfo to set
pub fn set_token_b_info(env: &Env, info: &TokenInfo) {
    env.storage().instance().set(&DataKey::TokenB, info);
}