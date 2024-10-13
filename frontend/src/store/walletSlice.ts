import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from './store';
import base64url from 'base64url';
import {
  account,
  fundPubkey,
  fundSigner,
  native,
  ousd,
  slp,
  positionManager,
  pool,
  send_transaction,
  server,
} from '../lib/passkey';
import { fetchPosition, setPosition } from './positionsSlice';
import { Position } from '../../packages/position-manager-sdk/dist';

const SCALAR_7 = 10_000_000;

export interface WalletState {
  isConnected: boolean;
  keyId: string | null;
  contractId: string | null;
  balances: {
    native: string;
    ousd: string;
    slp: string;
  };
  isPositionOperationInProgress: boolean; // New state
}

const initialState: WalletState = {
  isConnected: false,
  keyId: null,
  contractId: null,
  balances: {
    native: '',
    ousd: '',
    slp: '',
  },
  isPositionOperationInProgress: false, // Initialize new state
};

// Thunks
export const registerWallet = createAsyncThunk(
  'wallet/register',
  async (passkeyName: string, { dispatch }) => {
    console.log('Test');
    const { keyId: kid, contractId: cid, built } = await account.createWallet('Perps', passkeyName);
    if (built) {
      await server.send(built);
    }

    const newKeyId = base64url(kid);
    localStorage.setItem('sp:keyId', newKeyId);
    localStorage.setItem(`sp:cId:${newKeyId}`, cid);

    dispatch(setKeyId(newKeyId));
    dispatch(setContractId(cid));
    dispatch(setConnected(true));
    const result = await dispatch(fundWallet());
    console.log('FUNDING RESULT', result);
  }
);

export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async ({ keyId_ }: { keyId_?: string }, { dispatch }) => {
    try {
      const { keyId: kid, contractId: cid } = await account.connectWallet({
        keyId: keyId_,
        getContractId: async (keyId: string) => {
          const storedContractId = localStorage.getItem(`sp:cId:${keyId}`);
          if (storedContractId) return storedContractId;
          throw new Error('Contract ID not found');
        },
      });

      const newKeyId = base64url(kid);
      localStorage.setItem('sp:keyId', newKeyId);
      localStorage.setItem(`sp:cId:${newKeyId}`, cid);

      dispatch(setKeyId(newKeyId));
      dispatch(setContractId(cid));
      dispatch(setConnected(true));
      const result = await dispatch(fundWallet());
      console.log('FUNDING RESULT', result);
      await dispatch(getWalletBalance());

      return { keyId: newKeyId, contractId: cid };
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }
);

export const openPosition = createAsyncThunk(
  'wallet/openPosition',
  async (
    {
      userId,
      token,
      amount,
      size,
    }: { userId: string; token: string; amount: number; size: number },
    { dispatch, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const { contractId, keyId } = state.wallet;
      console.log({
        user: contractId!,
        input: BigInt(amount * SCALAR_7),
        size: BigInt(size * SCALAR_7),
        token,
      });
      const { built } = await positionManager.open_position({
        user: contractId!,
        input: BigInt(amount * SCALAR_7),
        size: size * SCALAR_7,
        token,
      });

      const xdr = await account.sign(built!, { keyId: keyId! });

      // Send the transaction
      await server.send(xdr.built!);

      // Fetch the actual position to ensure consistency
      return dispatch(fetchPosition(userId)).unwrap();
    } catch (error) {
      console.error('Failed to open position:', error);
      // If there's an error, we need to fetch the position again to ensure the UI is in sync
      dispatch(fetchPosition(userId));
      throw error;
    }
  }
);

export const calculateFees = createAsyncThunk(
  'wallet/calculateFees',
  async (
    {
      userId,
      token,
      amount,
      size,
    }: { userId: string; token: string; amount: number; size: number },
    { dispatch, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const { contractId, keyId } = state.wallet;
      console.log('input', {
        user: contractId!,
        input: BigInt(amount * SCALAR_7),
        size: size * SCALAR_7,
        token,
      });
      const { built } = await positionManager.open_position({
        user: contractId!,
        input: BigInt(amount * SCALAR_7),
        size: size * SCALAR_7,
        token,
      });
      console.log(built);
      console.log(built.fee);
      return built.fee;
    } catch (error) {
      console.error('Failed to open position:', error);
      // If there's an error, we need to fetch the position again to ensure the UI is in sync
      dispatch(fetchPosition(userId));
      throw error;
    }
  }
);

export const openLimitPosition = createAsyncThunk(
  'wallet/openLimitPosition',
  async (
    {
      userId,
      token,
      amount,
      size,
      entryPrice,
    }: { userId: string; token: string; amount: number; size: number; entryPrice: number },
    { dispatch, getState }
  ) => {
    try {
      const state = getState() as RootState;
      const { contractId, keyId } = state.wallet;
      const { built } = await positionManager.open_limit_position({
        user: contractId!,
        input: BigInt(amount * SCALAR_7),
        size: size * SCALAR_7,
        token,
        entry_price: entryPrice * SCALAR_7,
      });

      const xdr = await account.sign(built!, { keyId: keyId! });

      // Send the transaction
      await server.send(xdr.built!);

      // Fetch the actual position to ensure consistency
      return dispatch(fetchPosition(userId)).unwrap();
    } catch (error) {
      console.error('Failed to open limit position:', error);
      // If there's an error, we need to fetch the position again to ensure the UI is in sync
      dispatch(fetchPosition(userId));
      throw error;
    }
  }
);

export const closePosition = createAsyncThunk(
  'wallet/closePosition',
  async (userId: string, { getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const { contractId, keyId } = state.wallet;

      console.log(contractId, keyId);

      const { built } = await positionManager.close_position({ user: contractId! });

      const xdr = await account.sign(built!, { keyId: keyId! });

      // Send the transaction
      await server.send(xdr.built!);

      // Fetch the updated position to ensure consistency
      return dispatch(fetchPosition(userId)).unwrap();
    } catch (error) {
      console.error('Failed to close position:', error);
      // If there's an error, we need to fetch the position again to ensure the UI is in sync
      dispatch(fetchPosition(userId));
      throw error;
    }
  }
);

export const closeAllPositions = createAsyncThunk(
  'wallet/closeAllPositions',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      // Since there's only one position per user in this system,
      // closeAllPositions is effectively the same as closePosition
      const state = getState() as RootState;
      const { contractId, keyId } = state.wallet;

      const { built } = await positionManager.close_position({ user: contractId! });
      const xdr = await account.sign(built!, { keyId: keyId! });
      await server.send(xdr.built!);

      // Fetch and return the updated position (which should now be closed)
      return fetchPosition(userId);
    } catch (error) {
      console.error('Failed to close all positions:', error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const getWalletBalance = createAsyncThunk('wallet/getBalance', async (_, { getState }) => {
  const state = getState() as RootState;
  const { contractId } = state.wallet;
  if (contractId) {
    const [nativeBalance, ousdBalance, slpBalance] = await Promise.all([
      native.balance({ id: contractId }),
      ousd.balance({ id: contractId }),
      slp.balance({ id: contractId }),
    ]);
    return {
      native: nativeBalance.result.toString(),
      ousd: ousdBalance.result.toString(),
      slp: slpBalance.result.toString(),
    };
  } else {
    return {
      native: '',
      ousd: '',
      slp: '',
    };
  }
});

export const fundWallet = createAsyncThunk('wallet/fund', async (_, { getState }) => {
  const state = getState() as RootState;
  const { contractId } = state.wallet;

  const { built, ...transfer } = await native.transfer({
    to: contractId!,
    from: fundPubkey,
    amount: BigInt(5000 * SCALAR_7),
  });

  await transfer.signAuthEntries({
    publicKey: fundPubkey,
    signAuthEntry: (auth: any) => fundSigner.signAuthEntry(auth),
  });

  const xdr = built!.toXDR();
  await server.send(xdr.built!);
});

export const depositSLP = createAsyncThunk(
  'wallet/depositSLP',
  async (
    { tokenAAmount, tokenBAmount }: { tokenAAmount: number; tokenBAmount: number },
    { getState, dispatch }
  ) => {
    const state = getState() as RootState;
    const { contractId, keyId } = state.wallet;

    if (!contractId || !keyId) {
      throw new Error('Wallet not connected');
    }

    const { built } = await pool.deposit({
      user: contractId,
      token_a_amount: BigInt(Math.floor(tokenAAmount * SCALAR_7)),
      token_b_amount: BigInt(Math.floor(tokenBAmount * SCALAR_7)),
    });

    const xdr = await account.sign(built!, { keyId: keyId });
    await server.send(xdr.built!);

    // Update the wallet balance after deposit
    dispatch(getWalletBalance());
  }
);

export const withdrawSLP = createAsyncThunk(
  'wallet/withdrawSLP',
  async ({ slpAmount }: { slpAmount: number }, { getState, dispatch }) => {
    const state = getState() as RootState;
    const { contractId, keyId } = state.wallet;

    if (!contractId || !keyId) {
      throw new Error('Wallet not connected');
    }

    const { built } = await pool.withdraw({
      user: contractId,
      slp_amount: BigInt(Math.floor(slpAmount * SCALAR_7)),
    });

    const xdr = await account.sign(built!, { keyId: keyId });
    await server.send(xdr.built!);

    // Update the wallet balance after withdrawal
    dispatch(getWalletBalance());
  }
);

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setConnected(state, action) {
      state.isConnected = action.payload;
    },
    setKeyId(state, action) {
      state.keyId = action.payload;
    },
    setContractId(state, action) {
      state.contractId = action.payload;
    },
    setBalances(state, action) {
      state.balances = action.payload;
    },
    resetWallet(state) {
      state.isConnected = false;
      state.keyId = null;
      state.contractId = null;
      state.balances = {
        native: '',
        ousd: '',
        slp: '',
      };
      localStorage.removeItem('sp:keyId');
      if (state.keyId) localStorage.removeItem(`sp:cId:${state.keyId}`);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWalletBalance.fulfilled, (state, action) => {
        state.balances = action.payload;
      })
      .addCase(depositSLP.fulfilled, (state) => {
        // You can update any relevant state here if needed
      })
      .addCase(withdrawSLP.fulfilled, (state) => {
        // You can update any relevant state here if needed
      })
      .addCase(openPosition.pending, (state) => {
        state.isPositionOperationInProgress = true;
      })
      .addCase(openPosition.fulfilled, (state) => {
        state.isPositionOperationInProgress = false;
      })
      .addCase(openPosition.rejected, (state) => {
        state.isPositionOperationInProgress = false;
      })
      .addCase(closePosition.pending, (state) => {
        state.isPositionOperationInProgress = true;
      })
      .addCase(closePosition.fulfilled, (state) => {
        state.isPositionOperationInProgress = false;
      })
      .addCase(closePosition.rejected, (state) => {
        state.isPositionOperationInProgress = false;
      });
  },
});

export const { setConnected, setKeyId, setContractId, setBalances, resetWallet } =
  walletSlice.actions;

export default walletSlice.reducer;
