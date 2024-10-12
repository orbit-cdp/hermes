import { PasskeyKit, PasskeyServer, SACClient } from 'passkey-kit';
import { Account, Keypair, SorobanRpc, StrKey } from '@stellar/stellar-sdk';
import { Buffer } from 'buffer';
import { Client as PoolClient } from 'pool-sdk';
import { Client as PositionManagerClient } from 'position-manager-sdk';
import { Client as OracleClient } from 'mock-oracle-bindings';
import { toast } from 'react-toastify';
import { fetchTokenData } from '../store/perpsSlice';
import { getWalletBalance } from '../store/walletSlice';

const contract = require('@stellar/stellar-sdk/contract');
const basicNodeSigner = contract.basicNodeSigner;

export const rpc = new SorobanRpc.Server('https://soroban-testnet.stellar.org');

export const mockPubkey = StrKey.encodeEd25519PublicKey(Buffer.alloc(32));
export const mockSource = new Account(mockPubkey, '0');

export const fundKeypair = new Promise<Keypair>(async (resolve) => {
  const now = new Date();

  now.setMinutes(0, 0, 0);

  const nowData = new TextEncoder().encode(now.getTime().toString());
  const hashBuffer = await crypto.subtle.digest('SHA-256', nowData);
  const keypair = Keypair.fromRawEd25519Seed(Buffer.from(hashBuffer));

  rpc.requestAirdrop(keypair.publicKey()).catch(() => {});

  resolve(keypair);
});

export const fundPubkey = (await fundKeypair).publicKey();
export const fundSigner = basicNodeSigner(await fundKeypair, 'Test SDF Network ; September 2015');

export const account = new PasskeyKit({
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  factoryContractId: 'CBRKYZBFLZHZI6HTLLYZ3EOAFIE6GBSDFQLNU5F3NKOX2NOFUKEPIBUS',
});

export const sac = new SACClient({
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
});

export const native = sac.getSACClient('CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC');

export const ousd = sac.getSACClient('CAE67UQKK2WLYIDB6H4LTW7KMYYDGHZFVWVFWUBK4U5BIXWLEYXM4IUA');

export const slp = sac.getSACClient('CAZ4AQYC3W2CDEBA7RFVVFL53KKTQ6FZ6KS6SNX2L776J5LYYM2U32S2');

export const send_transaction = async (xdr: string, fee = 10_000) => {
  const submittingToast = toast.info('Submitting transaction...', {
    position: 'top-right',
    autoClose: false, // Don't auto close this toast
    hideProgressBar: false,
    closeOnClick: false, // Don't close on click
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  const data = new FormData();
  const jwt =
    'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxYzUxMDdmZjU4MzM4MDFkMDBmNmZhMjI3NzAzODY0NzNhMjY1ZmM5ZDhlZTVjMGYwN2U0NGIzYTRmNzAzMjU5IiwiZXhwIjoxNzMwNTQzNjQ5LCJjcmVkaXRzIjoxMDAwMDAwMDAwLCJpYXQiOjE3MjMyODYwNDl9.GwJfFIQ9q8m0qYusqHZQCNhJGf7ktB3o18Oq5Q3u9hI';

  data.set('xdr', xdr);
  data.set('fee', fee.toString());

  try {
    const response = await fetch('https://testnet.launchtube.xyz', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: data,
    });

    if (response.ok) {
      const result = await response.json();

      // Close the submitting toast if it exists
      if (submittingToast) {
        toast.dismiss(submittingToast);
      }

      // Show success notification
      toast.success('Transaction submitted successfully!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      return result;
    } else {
      const errorData = await response.json();
      throw errorData;
    }
  } catch (error) {
    console.error('Transaction failed:', error);

    // Show error notification
    toast.error('Transaction failed. Please try again.', {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });

    throw error;
  }
};

export const pool = new PoolClient({
  contractId: 'CDDKCDVXEAES2CICDHLUJAGPTOLHND4OYYQRLV4YMUSY65XYOVGHSXQK',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
});

export const positionManager = new PositionManagerClient({
  contractId: 'CDNSFAFYK67YEWGJ7P4UGHMDFQTQ3JXB7VF6JLPJWUZLOMW6QEBTCHWZ',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
});

export const oracle = new OracleClient({
  contractId: 'CDIIDS3LAMDTBUO6I5HK5J4CWF4H7MA3BY4SIJDAFTHLSLQ5OTBAPHJQ',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
});


