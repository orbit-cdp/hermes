# Deploy Utils

This is a utility script for deploying the build contracts

## Core Components

### index.ts
Entry point for the application. Contains the `fullDeploy` function, which orchestrates the deployment of various contracts and tokens.

### logic.ts
Contains core logic for deploying and interacting with contracts. Key functions include:
- `installContracts`: Installs necessary contracts.
- `deployFutureContracts`: Deploys and initializes pool and position manager contracts.
- `deployTokenContract`: Deploys a token contract.
- `deployOracleContract`: Deploys and sets up the oracle contract.

## Utility Components

### address-book.ts
Manages a persistent store of contract addresses, tokens, and WASM hashes.

### tx.ts
Handles transaction-related operations, including simulating and sending transactions, and invoking Soroban operations.

### contract.ts
Provides utility functions for contract-related operations, such as installing and deploying contracts.

### env_config.ts
Manages environment configuration, loading settings from a `.env` file.

### stellar-asset.ts
Handles the deployment of Stellar assets as Soroban contracts.

## External Contracts

### pool.ts
Defines the `PoolContract` class for interacting with liquidity pool contracts.

### position-manager.ts
Implements the `PositionManagerContract` class for managing trading positions.

### token.ts
Defines the `TokenContract` class for interacting with token contracts.

### oracle.ts
Implements the `OracleContract` class for price oracle functionality.

## Setup and Usage

1. Clone the repository:
   ```
   git clone [repository-url]
   cd [repository-name]
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables in a `.env` file:
   ```
   RPC_URL=<Stellar RPC node URL>
   NETWORK_PASSPHRASE=<Stellar network passphrase>
   FRIENDBOT_URL=<Stellar Friendbot URL for testnet>
   ADMIN=<Admin account secret key>
   ```

4. Build the project:
   ```
   tsc
   ```
   This compiles TypeScript files and saves the resulting JavaScript files in the `lib/` directory.

5. Run the application:
   ```
   node lib/index.js <identifier>
   ```
   Replace `<identifier>` with a desired identifier for your address book file.

6. View the results:
   - Check the console output for deployment progress and results.
   - Examine the `<identifier>.contracts.json` file for deployed contract addresses and other information.

## License

AGPL-3.0 license