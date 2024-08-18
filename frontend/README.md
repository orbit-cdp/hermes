# Stellar Perpetual Trading Platform

## Project Description

This project is a decentralized finance (DeFi) application built on the Stellar network, focusing on perpetual trading and earning opportunities. It provides a user-friendly interface for users to engage in perpetual trading, manage positions, and participate in liquidity provision.

## Technologies Used

- Next.js 13.x
- React 18.x
- TypeScript 4.x
- Material-UI 5.x
- Redux Toolkit
- Stellar SDK
- Passkey Kit
- TradingView Lightweight Charts

## Prerequisites

- Node.js 14.x or later
- Yarn package manager
- A modern web browser with WebAuthn support
- Access to the Stellar testnet

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/orbit-cdp/orbit-devto-ui
   cd orbit-devto-ui
   ```

2. Install dependencies:
   ```
   yarn install
   ```

## Usage

To run the development server:

```
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Available scripts:
- `yarn dev`: Runs the app in development mode
- `yarn build`: Builds the app for production
- `yarn start`: Runs the built app in production mode
- `yarn lint`: Runs the linter

## Project Structure

```
.
├── components/
│   ├── common/
│   ├── earn/
│   ├── icons/
│   ├── perps/
│   └── trading/
├── constants/
├── contexts/
├── lib/
├── pages/
├── public/
├── store/
├── styles/
├── theme.ts
└── types/
```

- `components/`: React components organized by feature
- `constants/`: Constant values used throughout the app
- `contexts/`: React context providers
- `lib/`: Utility functions and API clients
- `pages/`: Next.js pages and API routes
- `public/`: Static assets
- `store/`: Redux store configuration and slices
- `styles/`: Global styles and CSS modules
- `theme.ts`: Material-UI theme configuration
- `types/`: TypeScript type definitions

## Features

1. Wallet Connection: Secure wallet connection using WebAuthn
2. Perpetual Trading: Open and manage long/short positions
3. Liquidity Provision: Deposit and withdraw from liquidity pools
4. Real-time Charts: TradingView integration for price charts
5. Position Management: View and close open positions
6. Token Swaps: Swap between different tokens (XLM, oUSD, SLP)

## API Reference

This project primarily interacts with smart contracts on the Stellar network. Key contract interactions include:

- Pool Contract: For liquidity operations
- Position Manager Contract: For managing trading positions
- Oracle Contract: For price feeds

Refer to the `lib/passkey.ts` file for specific contract addresses and methods.

## Configuration

- `theme.ts`: Customize the Material-UI theme
- `next.config.js`: Next.js configuration options

## Testing

To run tests (once implemented):

```
yarn test
```

The project is set up to use Jest for unit and integration testing.

## Deployment

1. Build the project:
   ```
   yarn build
   ```

2. Deploy to your preferred hosting platform (e.g., Vercel, Netlify)

Ensure that environment variables are properly set in your deployment environment.

## License

AGPL-3.0 license
