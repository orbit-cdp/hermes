# Smart Contract Test Suite

## Overview

This test suite is designed to thoroughly test the functionality of the Pool and Position Manager smart contracts for a decentralized trading platform on the Stellar blockchain. It provides a comprehensive set of tests and utilities to ensure the correct behavior of the contracts under various scenarios.

## Test Structure

The test suite is composed of several Rust files:

1. `test_pool.rs`: Contains tests for the Pool contract
2. `assertions.rs`: Custom assertion functions for approximate equality
3. `setup.rs`: Setup functions for creating test fixtures
4. `test_fixture.rs`: Defines the TestFixture struct and related utilities

## Key Components

### TestFixture

The `TestFixture` struct in `test_fixture.rs` provides a convenient way to set up the testing environment. It includes:

- Simulated blockchain environment
- Admin and user addresses
- Instances of Pool, Position Manager, and Oracle clients
- Mock token clients for USDC, XLM, and SLP (Stellar Liquidity Provider) tokens

### Test Utilities

- `create_fixture_with_data()`: Creates a TestFixture with pre-populated data
- Custom assertion functions for approximate equality (absolute and relative)
- Helpers for manipulating the simulated blockchain state (e.g., advancing time)

## Main Test Cases

### Pool Contract Tests

Located in `test_pool.rs`, these tests cover:

1. Initial deposit and minting of SLP tokens
2. Deposit behavior with changing asset prices
3. Withdrawal mechanics and correct asset distribution
4. Handling of unbalanced deposits

### Setup and Initialization Tests

Located in `setup.rs`, these tests ensure:

1. Correct initialization of the test fixture
2. Proper minting and distribution of initial tokens
3. Accurate initial pool balances

## Running the Tests

To run the tests, use the following command in the project root:

```
cargo test
```

## Key Test Scenarios

1. **Balanced Deposits**: Ensures that users can deposit assets in the correct ratio and receive the appropriate amount of SLP tokens.

2. **Price Changes**: Tests the contract's behavior when asset prices change, ensuring correct valuation and token minting/burning.

3. **Withdrawals**: Verifies that users can withdraw their assets correctly, receiving the right proportion of assets based on their SLP tokens.

4. **Unbalanced Deposits**: Checks that the contract handles attempts to deposit assets in incorrect ratios appropriately.

5. **Liquidation Scenarios**: (To be implemented) Will test the Position Manager's ability to liquidate under-collateralized positions.

## Assertions and Validations

The test suite uses custom assertion functions for comparing values with a tolerance for small discrepancies due to rounding:

- `assert_approx_eq_abs`: Asserts approximate equality with an absolute tolerance
- `assert_approx_eq_rel`: Asserts approximate equality with a relative tolerance

## Future Enhancements

1. Implement tests for the Position Manager contract
2. Add more edge cases and stress tests
3. Implement property-based testing for more exhaustive coverage
4. Add tests for error conditions and contract panics

## Dependencies

The test suite relies on mock implementations of the following contracts:

- Pool Contract
- Position Manager Contract
- Oracle Contract (SEP-40 compliant)
- Token Contracts (SEP-41 compliant)

These mocks are created and managed within the test suite to simulate the full environment of the decentralized trading platform.

## Best Practices

When adding new tests or modifying existing ones:

1. Use the `TestFixture` for consistent setup
2. Leverage existing utilities and assertion functions
3. Clearly document the purpose and expectations of each test
4. Ensure that tests are deterministic and do not depend on external state

By following these guidelines and continuously expanding the test suite, we can maintain high confidence in the correctness and robustness of our smart contracts.