#![cfg(test)]

use soroban_sdk::{
    log, testutils::{Address as AddressTestTrait, Events, Logs}, vec, Address, Error, IntoVal, Symbol, Val, Vec
};
use test_suite::create_fixture_with_data;
use test_suite::test_fixture::{SCALAR_7, TokenIndex};
use test_suite::assertions::assert_approx_eq_abs;

#[test]
fn test_pool() {
    let fixture = create_fixture_with_data();
    let henk = Address::generate(&fixture.env);

    // Mint initial tokens for Henk
    fixture.tokens[TokenIndex::XLM].mint(&henk, &(10_000 * SCALAR_7));
    fixture.tokens[TokenIndex::USDC].mint(&henk, &(1_000 * SCALAR_7));

    // Initial deposit
    fixture.pool.deposit(&henk, &(1_000 * SCALAR_7), &(10_000 * SCALAR_7));

    // Henk deposited 10,000 XLM (1,000 USD) and 1,000 USDC (1,000 USD), total $2,000
    assert_eq!(fixture.tokens[TokenIndex::SLP].balance(&henk), 2_000 * SCALAR_7);

    // Confirm pool's balance after deposit
    // Initial deposit was 10,000 XLM and 1,000 USDC
    // Henks deposit was 1,000 XLM and 10,000 USDC
    assert_eq!(fixture.tokens[TokenIndex::XLM].balance(&fixture.pool.address), 20_000 * SCALAR_7);
    assert_eq!(fixture.tokens[TokenIndex::USDC].balance(&fixture.pool.address), 2_000 * SCALAR_7);

    // Price for XLM goes down to 0.09
    fixture.oracle.set_price_stable(&vec![
        &fixture.env,
        1_000_0000,
        90_0000,
    ]);

    // Pool has 20,000 XLM * 0.09 = $1,800 and 2,000 USDC = 2,000 USD, total $3,800
    // The ratio is 1,800 / 3,800 = 47.37% for XLM and 2,000 / 3,800 = 52.63% for USDC
    // To correct the ratio we need $200 worth of XLM, that is $200 / 0.09 = 2,222.22 XLM
    fixture.tokens[TokenIndex::XLM].mint(&henk, &(2_222 * SCALAR_7));
    fixture.pool.deposit(&henk, &0, &(2_222 * SCALAR_7));

    // Calculate expected SLP tokens for the second deposit
    // The deposit value is 2,222 XLM * 0.09 = $199,98
    // SLP tokens are 199,98 * 4,000 / 3,800 = 210,505263
    let expected_new_slp = 210_5052631; // Rounded down
    assert_eq!(fixture.tokens[TokenIndex::SLP].balance(&henk), 2_000 * SCALAR_7 + expected_new_slp);

    // Confirm updated pool balance
    assert_eq!(fixture.tokens[TokenIndex::XLM].balance(&fixture.pool.address), 22_222 * SCALAR_7);
    assert_eq!(fixture.tokens[TokenIndex::USDC].balance(&fixture.pool.address), 2_000 * SCALAR_7);

    // Henk withdraws 1,000 SLP tokens
    let (withdrawn_usdc, withdrawn_xlm) = fixture.pool.withdraw(&henk, &(1_000 * SCALAR_7));

    // Expected withdraw amounts
    // 1000 SLP tokens to withdraw total ~4210,505 SLP tokens
    // 1000 / 4210,505 * $3999,98 = $950
    // Pool is balanced so $950 / 2 = 475 USDC and $475 / 0.09 = 5277,777 XLM

    fixture.env.logs().print();
    println!("withdrawn_usdc: {} withdrawn_xlm: {}", withdrawn_usdc, withdrawn_xlm);

    assert_approx_eq_abs(withdrawn_usdc, 475 * SCALAR_7, 1000_000);
    assert_approx_eq_abs(withdrawn_xlm,  5277_777_0000, 1000_000);

    let new_xlm_amount = 22_222 * SCALAR_7 - 5277_777_0000;
    let new_usdc_amount = 2_000 * SCALAR_7 - 475 * SCALAR_7;

    assert_approx_eq_abs(fixture.tokens[TokenIndex::XLM].balance(&fixture.pool.address), new_xlm_amount, 1000_000);
    assert_approx_eq_abs(fixture.tokens[TokenIndex::USDC].balance(&fixture.pool.address), new_usdc_amount, 1000_000);

    // Price for XLM goes backup to 0.10
    fixture.oracle.set_price_stable(&vec![
        &fixture.env,
        1_000_0000,
        100_0000,
    ]);

    let (withdrawn_usdc, withdrawn_xlm) = fixture.pool.withdraw(&henk, &(1_000 * SCALAR_7));

    // The pool now has 2000 - 475 = 1525 USDC and 22222 - 5277,777 = 16944,223 XLM
    // The pool value is 1525 + 16944,223 * 0.10 = $3219,4223
    // Expected withdraw amounts
    // 1000 SLP tokens to withdraw total ~3210,505 SLP tokens
    // 1000 / 3210,505 * $3219,4223 = $1002,77754
    // The current ratio is $1525 / $3219,4223 = 47,368747% for USDC and 52,631253% for XLM
    // Excess XLM ratio is 52,631253% - 50% = 2,631253%
    // The adjust factor is 2,631253% / 52,631253% = 0,04999412
    // Value of XLM to withdraw is $1002,77754 * 0,52631253 * (1 + 0,04999412) = $554,16
    // Value of USDC to withdraw is $1002,77754 - $554,16 = $448,61754
    // XLM to withdraw is $554,16 / 0,10 = 5541,6 XLM

    assert_approx_eq_abs(withdrawn_usdc, 448_617_0000, 1000_000);
    assert_approx_eq_abs(withdrawn_xlm, 5541_600_0000, 1000_000);

    fixture.oracle.set_price_stable(&vec![
        &fixture.env,
        1_000_0000,
        80_0000,
    ]);

    let (withdrawn_usdc, withdrawn_xlm) = fixture.pool.withdraw(&henk, &(200 * SCALAR_7));

    // The pool now has 1525 - 448,61754 = 1076,38246 USDC and 16944,223 - 5541,6 = 11402,623 XLM
    // The pool value is 1076,38246 + 11402,623 * 0.08 = $1988,5923
    // Expected withdraw amounts
    // 200 SLP tokens to withdraw total ~2210,505 SLP tokens
    // 200 / 2210,505 * $1988,5923 = $179,921991
    // The current ratio is $1076,38246 / $1988,5923 = 54,12786% for USDC and 45,87214% for XLM
    // Excess USDC ratio is 54,12786% - 50% = 4,12786%
    // The adjust factor is 4,12786% / 54,12786% = 0,07626128
    // Value of USDC to withdraw is $179,921991 * 0,5412786 * (1 + 0,07626128) = $104,814851
    // Value of XLM to withdraw is $179,921991  - $104,814851 = $75,10714
    // XLM to withdraw is $75,10714 / 0,08 = 938,83925 XLM
    assert_approx_eq_abs(withdrawn_usdc, 104_814_8510, 1000_000);
    assert_approx_eq_abs(withdrawn_xlm, 938_839_2500, 1000_000);
}

#[test]
#[should_panic(expected = "Error(Contract, #504)")]
fn test_unbalanced_deposit() {
    let fixture = create_fixture_with_data();
    let henk = Address::generate(&fixture.env);

    fixture.pool.deposit(&henk, &(1_000 * SCALAR_7), &(1_000 * SCALAR_7));
}

#[test]
fn test_balanced_deposit() {
    let fixture = create_fixture_with_data();
    let henk = Address::generate(&fixture.env);

    // Mint initial tokens for Henk
    fixture.tokens[TokenIndex::XLM].mint(&henk, &(10_000 * SCALAR_7));
    fixture.tokens[TokenIndex::USDC].mint(&henk, &(1_000 * SCALAR_7));

    // Initial deposit
    fixture.pool.deposit(&henk, &(1_000 * SCALAR_7), &(10_000 * SCALAR_7));
}

#[test]
fn testing() {
    let fixture = create_fixture_with_data();
    let ben = Address::generate(&fixture.env);

    fixture.tokens[TokenIndex::XLM].mint(&ben, &(10_000 * SCALAR_7));

    fixture.position_manager.open_position(&ben, &(1_000 * SCALAR_7), &20000000, &fixture.tokens[TokenIndex::XLM].address);

    let position = fixture.position_manager.get_position(&ben);
    println!("Position: {:?}", position);

    // we supply 1000 XLM fee of 0.1% is charged
    // 1000 * 0.001 = 1 XLM fee so collateral should be 999 XLM
    assert_eq!(position.collateral, 999 * SCALAR_7);

    fixture.position_manager.close_position(&ben);

    println!("Balance of ben {:?}", fixture.tokens[TokenIndex::XLM].balance(&ben));
}