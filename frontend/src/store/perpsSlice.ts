import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch, RootState } from './store';
import { oracle, native, ousd, pool } from '../lib/passkey';
import { Asset } from 'mock-oracle-bindings';
import { PriceData } from 'pool-sdk';
import { AssembledTransaction } from '@stellar/stellar-sdk/lib/contract';
import { TOKENS } from '../constants/tokens';
import { getWalletBalance } from './walletSlice';

const SCALAR_7 = 10 ** 7;

export interface TokenInfo {
  address: string;
  target_ratio: number;
  total_supply: number;
}

interface TokenData {
  tokenInfo: TokenInfo;
  oraclePrice: number;
  balance: number;
  totalValue: number;
  currentRatio: number;
  utilization: number;
}

interface SLPData {
  totalSupply: number;
  price: number;
}

interface PerpsState {
  tokens: { [symbol: string]: TokenData };
  slp: SLPData;
  totalLockedValue: number;
  lastUpdated: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PerpsState = {
  tokens: {},
  slp: {
    totalSupply: 0,
    price: 0,
  },
  totalLockedValue: 0,
  lastUpdated: null,
  isLoading: false,
  error: null,
};

export const fetchTokenData = createAsyncThunk(
  'perps/fetchTokenData',
  async (_, { rejectWithValue }) => {
    const tokenData: { [symbol: string]: TokenData } = {};
    let totalLockedValue = 0;
    try {
      for (const [symbol, contractId] of Object.entries(TOKENS)) {
        const { result: tokenInfo } = await pool.get_token_info({ token: contractId });
        const total_supply = Number(tokenInfo.total_supply) / SCALAR_7;
        tokenInfo.total_supply = total_supply;
        tokenInfo.target_ratio = Number(tokenInfo.target_ratio) / SCALAR_7;

        const { simulationData } = await oracle.lastprice({
          asset: {
            tag: 'Stellar',
            values: [contractId],
          },
        });
        const oraclePrice = Number(simulationData.result.retval._value[0].val()._value.lo()._value) / SCALAR_7;

        const client = symbol == 'USD' ? ousd : native;

        const balanceResult = await client.balance({
          id: 'CBQKHHTKPQXJXVJ6YZOWMDE2KOPS5276U7GJEAPFIC4JLNJQJ7YAJ2AD',
        });
        const balance = Number(balanceResult) / SCALAR_7;

        const totalValue = total_supply * oraclePrice;
        totalLockedValue += totalValue;

        // Calculate utilization
        const utilization = ((total_supply - balance) / total_supply) * 100;

        tokenData[symbol] = { 
          tokenInfo, 
          oraclePrice, 
          balance,
          totalValue,
          currentRatio: 0, // We'll calculate this after getting total locked value
          utilization,
        };
      }

      // Calculate current ratios
      for (const symbol in tokenData) {
        tokenData[symbol].currentRatio = (tokenData[symbol].totalValue / totalLockedValue) * 100;
      }

      // Fetch SLP data
      const { result: slpSupply } = await pool.get_slp_supply();
      const slpTotalSupply = Number(slpSupply) / SCALAR_7;
      const slpPrice = totalLockedValue / slpTotalSupply;

      return { tokenData, totalLockedValue, slp: { totalSupply: slpTotalSupply, price: slpPrice } };
    } catch (error) {
      console.log(error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const startPeriodicRefresh = () => (dispatch: AppDispatch) => {
  const refreshInterval = 30000; // 30 seconds

  const refresh = () => {
    dispatch(fetchTokenData());
  };

  refresh(); // Initial fetch
  const intervalId = setInterval(refresh, refreshInterval);

  // Return a function to stop the periodic refresh
  return () => {
    clearInterval(intervalId);
  };
};

const perpsSlice = createSlice({
  name: 'perps',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTokenData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchTokenData.fulfilled,
        (state, action: PayloadAction<{ 
          tokenData: { [symbol: string]: TokenData }, 
          totalLockedValue: number,
          slp: SLPData
        }>) => {
          state.isLoading = false;
          state.tokens = action.payload.tokenData;
          state.totalLockedValue = action.payload.totalLockedValue;
          state.slp = action.payload.slp;
          state.lastUpdated = Date.now();
        }
      )
      .addCase(fetchTokenData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectTokenData = (state: RootState, symbol: string) => state.perps.tokens[symbol];
export const selectSLPData = (state: RootState) => state.perps.slp;
export const selectTotalLockedValue = (state: RootState) => state.perps.totalLockedValue;

export default perpsSlice.reducer;