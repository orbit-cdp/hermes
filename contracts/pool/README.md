# Pool Smart Contract

## Overview

This smart contract implements a liquidity pool for decentralized trading on the Stellar blockchain. It allows users to deposit and withdraw liquidity, and facilitates borrowing and repayment of assets for leveraged trading positions.

## Features

- Liquidity provision and withdrawal
- Dynamic fee adjustment based on pool imbalance
- Integration with an oracle for price feeds
- Interaction with a position manager for leveraged trading
- Minting and burning of pool tokens (SLP - Stellar Liquidity Provider tokens)

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
fn initialize(e: Env, admin: Address, oracle: Address, position_manager: Address, spl: Address, token_a: TokenInfo, token_b: TokenInfo)
```

Initializes the pool contract with necessary parameters and initial token information.

### Deposit

```rust
fn deposit(e: Env, user: Address, token_a_amount: i128, token_b_amount: i128) -> i128
```

Allows users to deposit liquidity into the pool. Returns the amount of SLP tokens minted.

### Withdraw

```rust
fn withdraw(e: Env, user: Address, slp_amount: i128) -> (i128, i128)
```

Enables users to withdraw liquidity from the pool by burning SLP tokens. Returns the amounts of token A and token B withdrawn.

### Borrow

```rust
fn borrow(e: Env, token: Address, amount: i128, fee: i128)
```

Allows the position manager to borrow assets from the pool for leveraged trading.

### Repay

```rust
fn repay(e: Env, token: Address, amount: i128, fee: i128)
```

Enables the position manager to repay borrowed assets to the pool.

## Error Handling

The contract defines custom errors in `errors.rs` to handle various failure scenarios, such as insufficient liquidity, invalid token addresses, and excessive borrowing.

## Storage

The contract uses persistent storage to maintain state across transactions. Key data stored includes:

- Admin address
- Oracle address
- Position manager address
- SLP token address and supply
- Token A and Token B information (address, total supply, target ratio)

## Price Oracle Integration

The contract integrates with a price oracle (SEP-40 compliant) to fetch current asset prices for accurate valuation and risk management.