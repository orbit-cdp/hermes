# Position Manager Smart Contract

## Overview

This smart contract implements a position manager for leveraged trading on the Stellar blockchain. It allows users to open, close, and manage leveraged positions, interacting with a liquidity pool and an oracle for price feeds.

## Features

- Opening and closing leveraged positions
- Liquidation of under-collateralized positions
- Integration with an oracle for price feeds
- Interaction with a pool contract for borrowing and repaying assets

## Contract Structure

The contract is composed of several Rust files:

1. `contract.rs`: Main contract logic
2. `errors.rs`: Custom error definitions
3. `oracle.rs`: Oracle interaction for price feeds
4. `storage.rs`: Data storage and retrieval functions
5. `constants.rs`: Constant definitions

## Key Functions

### Initialize

```rust
fn initialize(env: Env, pool_contract: Address, oracle: Address)
```

Initializes the position manager contract with the pool contract and oracle addresses.

### Open Position

```rust
fn open_position(env: Env, user: Address, collateral: i128, size: u32, token: Address)
```

Allows users to open a leveraged position by depositing collateral and specifying the position size and token.

### Close Position

```rust
fn close_position(env: Env, user: Address)
```

Enables users to close their open position, repaying the borrowed amount and returning remaining funds.

### Liquidate

```rust
fn liquidate(env: Env, user: Address, liquidator: Address)
```

Allows liquidation of under-collateralized positions by external liquidators.

### Get Position

```rust
fn get_position(env: Env, user: Address) -> Position
```

Retrieves the current position information for a given user.

## Error Handling

The contract defines custom errors in `errors.rs` to handle various failure scenarios, such as position already exists, no position exists, and position not liquidatable.

## Storage

The contract uses persistent storage to maintain state across transactions. Key data stored includes:

- Oracle address
- Pool contract address
- User positions (mapped by user address)

## Price Oracle Integration

The contract integrates with a price oracle (SEP-40 compliant) to fetch current asset prices for accurate position valuation and liquidation checks.

## Security Considerations

- The contract implements authorization checks to ensure only position owners can perform certain actions.
- It includes checks to prevent opening multiple positions for a single user.
- The contract verifies price data freshness to avoid using stale prices in calculations.
- Liquidation thresholds are implemented to manage risk and protect the protocol.

## Interaction with Pool Contract

The Position Manager contract interacts with the Pool contract for borrowing and repaying assets. It uses the `PoolClient` to make calls to the Pool contract's `borrow` and `repay` functions.

## Position Structure

Positions are stored with the following information:

- Token address
- Entry price
- Borrowed amount
- Collateral amount
- Timestamp of position opening

This structure allows for accurate tracking and management of user positions.