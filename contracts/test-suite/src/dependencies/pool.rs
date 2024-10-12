use soroban_sdk::{testutils::Address as _, Address, Env};

mod pool_contract {
    soroban_sdk::contractimport!(file = "../wasms/pool.wasm");
}

pub use pool_contract::{Client as PoolClient, TokenInfo, WASM as POOL_WASM};

pub fn create_pool<'a>(e: &Env) -> (Address, PoolClient<'a>) {
    let contract_id = Address::generate(e);
    e.register_contract_wasm(&contract_id, POOL_WASM);
    (contract_id.clone(), PoolClient::new(e, &contract_id))
}