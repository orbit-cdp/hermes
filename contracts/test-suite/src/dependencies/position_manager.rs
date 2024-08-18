use soroban_sdk::{testutils::Address as _, Address, Env};

mod pool_contract {
    soroban_sdk::contractimport!(file = "../wasms/position_manager.wasm");
}

pub use pool_contract::{Client as PositionManagerClient, WASM as POSITION_MANAGER_WASM};

pub fn create_position_manager<'a>(e: &Env) -> (Address, PositionManagerClient<'a>) {
    let contract_id = Address::generate(e);
    e.register_contract_wasm(&contract_id, POSITION_MANAGER_WASM);
    (contract_id.clone(), PositionManagerClient::new(e, &contract_id))
}