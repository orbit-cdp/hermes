use crate::test_fixture::{SCALAR_7, TestFixture, TokenIndex};
use soroban_sdk::{log, testutils::{Address as _, Logs}, Address};

pub fn create_fixture_with_data<'a>() -> TestFixture<'a> {
    let fixture = TestFixture::create();

    // Frodo is a big whale he is rich
    let frodo = fixture.users[0].clone();
    fixture.tokens[TokenIndex::XLM].mint(&frodo, &(10_000_000_000 * SCALAR_7)); // 10B XLM
    fixture.tokens[TokenIndex::USDC].mint(&frodo, &(10_000_000_000 * SCALAR_7)); // 10B USDC

    fixture.pool.deposit(&frodo, &(1_000 * SCALAR_7), &(10_000 * SCALAR_7));
    fixture
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_fixture_with_data() {
        let fixture = create_fixture_with_data();
        let frodo: &Address = fixture.users.get(0).unwrap();

        // Frodo deposited 1,000 XLM = 100USD and 1,000 USDC = 1,000USD total 1100USD
        assert_eq!(fixture.tokens[TokenIndex::SLP].balance(frodo), 2_000 * SCALAR_7);

        //Confirm pools balance
        assert_eq!(fixture.tokens[TokenIndex::XLM].balance(&fixture.pool.address), 10_000 * SCALAR_7);
        assert_eq!(fixture.tokens[TokenIndex::USDC].balance(&fixture.pool.address), 1_000 * SCALAR_7);
    }
}