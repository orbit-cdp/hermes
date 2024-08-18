# Decentralized Trading Platform on Stellar

## Overview

This repository contains the smart contracts and associated tools for a decentralized trading platform built on the Stellar blockchain. The platform enables users to provide liquidity, engage in leveraged trading, and manage positions through a set of interconnected smart contracts.

## Components

### 1. Pool Contract

Located in the `pool/` directory, this smart contract manages the liquidity pool. It allows users to:

- Deposit and withdraw liquidity
- Mint and burn pool tokens (SLP - Stellar Liquidity Provider tokens)
- Borrow and repay assets for leveraged trading

For more details, see the [Pool Contract README](./pool/README.md).

### 2. Position Manager Contract

Found in the `position-manager/` directory, this contract handles leveraged trading positions. Key features include:

- Opening and closing positions
- Managing collateral
- Liquidating under-collateralized positions

For more information, refer to the [Position Manager README](./position-manager/README.md).

### 3. Test Suite

The `test-suite/` directory contains comprehensive tests for both the Pool and Position Manager contracts. It includes:

- Test fixtures and utilities
- Simulated blockchain environment
- Extensive test cases covering various scenarios

For details on running tests and adding new ones, see the [Test Suite README](./test-suite/README.md).

### 4. WebAuthn Wallet Integration

The `webauthn-factory/` and `webauthn-wallet/` directories contain smart wallet implementations based on the [Passkey Kit](https://github.com/kalepail/passkey-kit). These components enable secure, passwordless authentication for users interacting with the platform.

### 5. Compiled WebAssembly (Wasm) Files

The `wasms/` directory stores the compiled WebAssembly files for the Pool and Position Manager contracts, ready for deployment on the Stellar network.

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-repo/decentralized-trading-platform.git
   cd decentralized-trading-platform
   ```

2. Install dependencies:
   ```
   cargo build
   ```

3. Build the contracts:
   ```
   stellar contract build
   ```
   This will compile the contracts and automatically move the resulting Wasm files to the `wasms/` folder.

4. Run tests:
   ```
   cargo test
   ```

5. To deploy contracts, use the Wasm files in the `wasms/` directory with the Stellar network tools of your choice.

## Development Workflow

1. Make changes to the contract code in the `pool/` or `position-manager/` directories.
2. Update or add tests in the `test-suite/` directory to cover new functionality.
3. Build the contracts using `stellar-contract-build`.
4. Run the test suite to ensure all tests pass.
5. Update documentation as necessary.

## License

AGPL-3.0 license
