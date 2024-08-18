import { Account, Asset, Operation, StrKey, hash, xdr } from '@stellar/stellar-sdk';
import { addressBook } from './address-book.js';
import { config } from './env_config.js';
import { TxParams, invokeSorobanOperation } from './tx.js';

import { TokenContract } from '../external/token.js';
import { bumpContractInstance } from './contract.js';

/**
 * Deploys a Stellar asset as a contract on the Stellar network using Soroban functionalities.
 * @param {Asset} asset - The Stellar asset to deploy.
 * @param {TxParams} txParams - Transaction parameters including account and builder options.
 * @returns {Promise<TokenContract>} A TokenContract instance for the deployed asset.
 */
export async function deployStellarAsset(
  asset: Asset,
  txParams: TxParams,
): Promise<TokenContract> {
  const xdrAsset = asset.toXDRObject();
  const networkId = hash(Buffer.from(config.passphrase));
  const preimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId: networkId,
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAsset(xdrAsset),
    })
  );
  const contractId = StrKey.encodeContract(hash(preimage.toXDR()));

  const deployFunction = xdr.HostFunction.hostFunctionTypeCreateContract(
    new xdr.CreateContractArgs({
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAsset(xdrAsset),
      executable: xdr.ContractExecutable.contractExecutableStellarAsset(),
    })
  );
  const deployOp = Operation.invokeHostFunction({
    func: deployFunction,
    auth: [],
  });
  await invokeSorobanOperation(deployOp.toXDR('base64'), () => undefined, txParams);
  addressBook.setToken(asset.code, contractId);
  console.warn(asset.code, contractId);
  addressBook.writeToFile();
  console.warn(
    `Successfully deployed Stellar asset contract for 
    ${asset.code} with Contract ID: ${contractId}\n 
    ${JSON.stringify(asset)}`
  );
  return new TokenContract(contractId, asset);
}