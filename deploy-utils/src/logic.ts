import { Address, Asset } from "@stellar/stellar-sdk";
import { addressBook } from "./utils/address-book.js";
import { deployContract, installContract } from "./utils/contract.js";
import { config } from "./utils/env_config.js";
import { deployStellarAsset } from "./utils/stellar-asset.js";
import { TxParams, invokeSorobanOperation, signWithKeypair } from "./utils/tx.js";
import { PoolContract, poolInitArgs, TokenInfo } from "./external/pool.js";
import { PositionManagerContract, positionManagerInitArgs } from "./external/position-manager.js";
import { TokenContract } from "./external/token.js";
import { OracleContract } from "./external/oracle.js";

const txParams: TxParams = {
    account: await config.rpc.getAccount(config.admin.publicKey()),
    txBuilderOptions: {
      fee: '10000',
      timebounds: {
        minTime: 0,
        maxTime: 0,
      },
      networkPassphrase: config.passphrase,
    },
    signerFunction: async (txXdr: string) => signWithKeypair(txXdr, config.passphrase, config.admin),
  };

export async function installContracts() {
  await installContract("pool", txParams);
  await installContract("positionmanager", txParams);
  await installContract("token", txParams);
  await installContract("oraclemock", txParams);
}

export async function deployFutureContracts(oracle: string, slp: string, tokenA: string, tokenB: string, ratioA: number, ratioB: number) {
    await deployContract("pool", "pool", txParams);
    await deployContract("positionmanager", "positionmanager", txParams);

    const poolAddress = addressBook.getContractId("pool");
    const positionManagerAddress = addressBook.getContractId("positionmanager");
    const oracleAddress = addressBook.getContractId(oracle);

    const token_a = addressBook.getToken(tokenA);
    const token_b = addressBook.getToken(tokenB);
    const slpAddress = addressBook.getToken(slp);

    const scalar7 = 10_000_000;

    //TODO: Check if ratio a + b = 1
    const token_a_info: TokenInfo = {
        address: token_a,
        target_ratio: ratioA * scalar7,
        total_supply: BigInt(0),
    };

    const token_b_info: TokenInfo = {
        address: token_b,
        target_ratio: ratioB * scalar7, 
        total_supply: BigInt(0),
    };

    const poolInitArgs: poolInitArgs = {
        admin: Address.fromString(config.admin.publicKey()),
        oracle: Address.fromString(oracleAddress),
        position_manager: Address.fromString(positionManagerAddress),
        spl: Address.fromString(slpAddress),
        token_a: token_a_info,
        token_b: token_b_info,
    };

    const positionManagerInitArgs: positionManagerInitArgs = {
        pool_contract: Address.fromString(poolAddress),
        oracle: Address.fromString(oracleAddress),
        token_a: token_a,
        token_b: token_b,
    };

    const pool = new PoolContract(poolAddress);
    const positionManager = new PositionManagerContract(positionManagerAddress);

    console.log('Initializing pool...');
    await invokeSorobanOperation(
        pool.initialize(poolInitArgs),
        PoolContract.parsers.initialize,
        txParams
    );
    console.log('Pool initialized.');

    console.log('Initializing position manager...');
    await invokeSorobanOperation(
        positionManager.initialize(positionManagerInitArgs),
        PositionManagerContract.parsers.initialize,
        txParams
    );
    console.log('Position manager initialized.');

    const slpClient = new TokenContract(slpAddress);

    console.log('Setting pool as admin of SLP token...');
    await invokeSorobanOperation(
        slpClient.set_admin(poolAddress),
        () => {},
        txParams
    );
    console.log('SLP token admin set to pool.');
}

export async function deployTokenContract(name: string) {
    console.log('Deploying token contract...');
    const token = new Asset(name, config.admin.publicKey());
  
    try {
      await deployStellarAsset(token, txParams);
      console.log(`Successfully deployed ${name} token contract.\n`);
    } catch (e) {
      console.log('Failed to deploy token contract', e);
    }
}

export async function deployOracleContract(name: string) {
    await deployContract(name, "oraclemock", txParams);

    const oracleAddress = addressBook.getContractId(name);
    const oracle = new OracleContract(oracleAddress);

    await invokeSorobanOperation(
        oracle.setData(
          Address.fromString(config.admin.publicKey()),
          {
            tag: 'Other',
            values: ['USD'],
          },
          [
            {
              tag: 'Stellar',
              values: [Address.fromString(addressBook.getToken('oUSD'))],
            },
            {
              tag: 'Stellar',
              values: [Address.fromString(addressBook.getToken('XLM'))],
            },
          ],
          7,
          300
        ),
        () => undefined,
        txParams
      );

      await invokeSorobanOperation(
        oracle.setPriceStable([BigInt(1e7), BigInt(0.1e7)]),
        () => undefined,
        txParams
      );
      console.log('Successfully deployed and setup the mock Oracle contract.\n');
}