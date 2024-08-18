use std::ops::Index;
use sep_40_oracle::testutils::{Asset, MockPriceOracleClient};
use sep_41_token::testutils::MockTokenClient;
use soroban_sdk::testutils::{Address as _, BytesN as _, Ledger, LedgerInfo};
use soroban_sdk::{vec as svec, Address, BytesN, Env, String, Map, Symbol};
use crate::dependencies::oracle::create_mock_oracle;
use crate::dependencies::pool::{create_pool, PoolClient, TokenInfo};
use crate::dependencies::position_manager::{create_position_manager, PositionManagerClient};
use crate::dependencies::token::create_stellar_token;

pub const SCALAR_7: i128 = 1_000_0000;

#[derive(Copy, Clone, PartialEq, Eq, Hash, Debug)]
pub enum TokenIndex {
    USDC = 0,
    XLM = 1,
    SLP = 2,
}

impl<'a> Index<TokenIndex> for Vec<MockTokenClient<'a>> {
    type Output = MockTokenClient<'a>;

    fn index(&self, index: TokenIndex) -> &Self::Output {
        &self[index as usize]
    }
}

pub struct TestFixture<'a> {
    pub env: Env,
    pub admin: Address,
    pub users: Vec<Address>,
    pub pool: PoolClient<'a>,
    pub position_manager: PositionManagerClient<'a>,
    pub oracle: MockPriceOracleClient<'a>,
    pub tokens: Vec<MockTokenClient<'a>>,
}


impl TestFixture<'_> {

    pub fn create<'a>() -> TestFixture<'a> {
        let env = Env::default();
        env.mock_all_auths();
        env.budget().reset_unlimited();

        let admin = Address::generate(&env);
        let frodo = Address::generate(&env);

        //TODO: Check this
        env.ledger().set(LedgerInfo {
            timestamp: 1441065600, // Sept 1st, 2015
            protocol_version: 21,
            sequence_number: 150,
            network_id: Default::default(),
            base_reserve: 10,
            min_temp_entry_ttl: 500000,
            min_persistent_entry_ttl: 500000,
            max_entry_ttl: 9999999,
        });

        let (usdc_id, usdc_client) = create_stellar_token(&env, &admin);
        let (xlm_id, xlm_client) = create_stellar_token(&env, &admin);
        let (slp_id, slp_client) = create_stellar_token(&env, &admin);

        let (pool_id, pool_client) = create_pool(&env);
        let (position_manager_id, position_manager_client) = create_position_manager(&env);

        let (mock_oracle_id, mock_oracle_client) = create_mock_oracle(&env);
        mock_oracle_client.set_data(
            &admin,
            &Asset::Other(Symbol::new(&env, "USD")),
            &svec![
                &env,
                Asset::Stellar(usdc_id.clone()),
                Asset::Stellar(xlm_id.clone()),
            ],
            &7,
            &300,
        );
        mock_oracle_client.set_price_stable(&svec![
            &env,
            1_0000000,    // usdc
            0_1000000,    // xlm
        ]);

        slp_client.set_admin(&pool_id);

        let token_a = TokenInfo {
            address: usdc_id,
            target_ratio: (SCALAR_7 / 2) as u32,
            total_supply: 0,
        };
        let token_b = TokenInfo {
            address: xlm_id,
            target_ratio: (SCALAR_7 / 2) as u32,
            total_supply: 0,
        };
        pool_client.initialize(&admin, &mock_oracle_id, &position_manager_id, &slp_id, &token_a, &token_b);
        position_manager_client.initialize(&pool_id, &mock_oracle_id);

        let fixture = TestFixture {
            env,
            admin,
            users: vec![frodo],
            pool: pool_client,
            position_manager: position_manager_client,
            oracle: mock_oracle_client,
            tokens: vec![usdc_client, xlm_client, slp_client],
        };
        fixture.jump(7 * 24 * 60 * 60);
        fixture
    }

    /********** Chain Helpers ***********/

    pub fn jump(&self, time: u64) {
        self.env.ledger().set(LedgerInfo {
            timestamp: self.env.ledger().timestamp().saturating_add(time),
            protocol_version: 21,
            sequence_number: self.env.ledger().sequence(),
            network_id: Default::default(),
            base_reserve: 10,
            min_temp_entry_ttl: 999999,
            min_persistent_entry_ttl: 999999,
            max_entry_ttl: 9999999,
        });
    }

    pub fn jump_with_sequence(&self, time: u64) {
        let blocks = time / 5;
        self.env.ledger().set(LedgerInfo {
            timestamp: self.env.ledger().timestamp().saturating_add(time),
            protocol_version: 21,
            sequence_number: self.env.ledger().sequence().saturating_add(blocks as u32),
            network_id: Default::default(),
            base_reserve: 10,
            min_temp_entry_ttl: 999999,
            min_persistent_entry_ttl: 999999,
            max_entry_ttl: 9999999,
        });
    }
}