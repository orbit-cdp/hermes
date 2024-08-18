import {
    Account,
    Keypair,
    Operation,
    SorobanRpc,
    TimeoutInfinite,
    Transaction,
    TransactionBuilder,
    xdr,
  } from '@stellar/stellar-sdk';
  import { config } from './env_config.js';

  function parseResult<T>(
    response:
      | SorobanRpc.Api.SimulateTransactionSuccessResponse
      | SorobanRpc.Api.GetSuccessfulTransactionResponse,
    parser: (xdr: string) => T
  ): T | undefined {
    if ('result' in response && response.result) {
      return parser(response.result.retval.toXDR('base64'));
    } else if ('returnValue' in response && response.returnValue) {
      return parser(response.returnValue.toXDR('base64'));
    } else {
      return undefined;
    }
  }
  
  export type TxParams = {
    account: Account;
    signerFunction: (txXdr: string) => Promise<string>;
    txBuilderOptions: TransactionBuilder.TransactionBuilderOptions;
  };
  
  export async function signWithKeypair(
    txXdr: string,
    passphrase: string,
    source: Keypair
  ): Promise<string> {
    const tx = new Transaction(txXdr, passphrase);
    tx.sign(source);
    return tx.toXDR();
  }
  
  export async function simulationOperation(
    operation: string,
    txParams: TxParams
  ): Promise<SorobanRpc.Api.SimulateTransactionResponse> {
    const txBuilder = new TransactionBuilder(
      txParams.account,
      txParams.txBuilderOptions
    ).addOperation(xdr.Operation.fromXDR(operation, 'base64'));
    const transaction = txBuilder.build();
    const simulation = await config.rpc.simulateTransaction(transaction);
    return simulation;
  }
  
  export async function sendTransaction<T>(
    transaction: Transaction,
    parser: (result: string) => T
  ): Promise<T | undefined> {
    let send_tx_response = await config.rpc.sendTransaction(transaction);
    const curr_time = Date.now();
    while (send_tx_response.status === 'TRY_AGAIN_LATER' && Date.now() - curr_time < 20000) {
      await new Promise((resolve) => setTimeout(resolve, 4000));
      send_tx_response = await config.rpc.sendTransaction(transaction);
    }
    if (send_tx_response.status !== 'PENDING') {
      console.error('Transaction failed to send: ' + send_tx_response.hash);
      throw send_tx_response;
    }
  
    let get_tx_response = await config.rpc.getTransaction(send_tx_response.hash);
    while (get_tx_response.status === 'NOT_FOUND') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      get_tx_response = await config.rpc.getTransaction(send_tx_response.hash);
    }
  
    if (get_tx_response.status !== 'SUCCESS') {
      console.log('Tx Failed: ', get_tx_response.status);
      throw get_tx_response;
    }
  
    console.log('Tx Submitted!');
    const result = parseResult(get_tx_response, parser);
    return result;
  }
  
  export async function invokeSorobanOperation<T>(
    operation: string,
    parser: (result: string) => T,
    txParams: TxParams,
    sorobanData?: xdr.SorobanTransactionData
  ): Promise<T | undefined> {
    const account = await config.rpc.getAccount(txParams.account.accountId());
    const txBuilder = new TransactionBuilder(account, txParams.txBuilderOptions).addOperation(
      xdr.Operation.fromXDR(operation, 'base64')
    );
    if (sorobanData) {
      txBuilder.setSorobanData(sorobanData);
    }
    let transaction = txBuilder.build();
    let simulation = await config.rpc.simulateTransaction(transaction);
    if (SorobanRpc.Api.isSimulationRestore(simulation)) {
      console.log('Restoring...');
      const fee = Number(simulation.restorePreamble.minResourceFee) + 1000;
      const restore_tx = new TransactionBuilder(account, { fee: fee.toString() })
        .setNetworkPassphrase(config.passphrase)
        .setTimeout(0)
        .setSorobanData(simulation.restorePreamble.transactionData.build())
        .addOperation(Operation.restoreFootprint({}))
        .build();
      const restoreSignedTx = new Transaction(
        await txParams.signerFunction(restore_tx.toXDR()),
        config.passphrase
      );
      console.log('Restore Hash:', restoreSignedTx.hash().toString('hex'));
      await sendTransaction(restoreSignedTx, () => undefined);
      console.log('Restored!');
      // increment sequence number since restore consumed one
      account.incrementSequenceNumber();
      transaction = new TransactionBuilder(account, txParams.txBuilderOptions)
        .addOperation(xdr.Operation.fromXDR(operation, 'base64'))
        .build();
      simulation = await config.rpc.simulateTransaction(transaction);
    }
  
    if (SorobanRpc.Api.isSimulationError(simulation)) {
      console.log('is simulation error');
      console.log('xdr: ', transaction.toXDR());
      console.log('simulation: ', simulation);
      throw simulation;
    }
  
    const assembledTx = SorobanRpc.assembleTransaction(transaction, simulation).build();
    console.log('Transaction Hash:', assembledTx.hash().toString('hex'));
    const signedTx = new Transaction(
      await txParams.signerFunction(assembledTx.toXDR()),
      config.passphrase
    );
  
    const response = await sendTransaction(signedTx, parser);
    return response;
  }
  
  export async function invokeClassicOp(operation: string, txParams: TxParams) {
    const account = await config.rpc.getAccount(txParams.account.accountId());
    const txBuilder = new TransactionBuilder(account, txParams.txBuilderOptions)
      .addOperation(xdr.Operation.fromXDR(operation, 'base64'))
      .setTimeout(TimeoutInfinite);
    const transaction = txBuilder.build();
    const signedTx = new Transaction(
      await txParams.signerFunction(transaction.toXDR()),
      config.passphrase
    );
    console.log('Transaction Hash:', signedTx.hash().toString('hex'));
    try {
      await sendTransaction(signedTx, () => undefined);
    } catch (e) {
      console.error(e);
      throw Error('failed to submit classic op TX');
    }
  }