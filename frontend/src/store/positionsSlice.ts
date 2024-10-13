import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from './store';
import { positionManager } from '../lib/passkey';
import { Position } from '../../packages/position-manager-sdk/dist';
// import type { u32, u64, i128 } from '@stellar/stellar-sdk/contract';

// Helper function to convert BigInt to string for serialization
const serializeBigInt = (value: bigint | number): string => value.toString();

// Helper function to parse string back to BigInt
const parseBigInt = (value: string): bigint => BigInt(value);

// Serializable version of the Position type
interface SerializablePosition {
  borrowed: string;
  collateral: string;
  entry_price: string;
  filled: boolean;
  leverage: number;
  stop_loss: string;
  take_profit: string;
  timestamp: string;
  token: string;
}

interface PositionsState {
  positions: { [userId: string]: SerializablePosition | null };
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  noActivePosition: { [userId: string]: boolean };
}

const initialState: PositionsState = {
  positions: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
  noActivePosition: {},
};

// Convert Position to SerializablePosition
const toSerializablePosition = (position: Position): SerializablePosition => ({
  borrowed: serializeBigInt(position.borrowed),
  collateral: serializeBigInt(position.collateral),
  entry_price: serializeBigInt(position.entry_price),
  filled: position.filled,
  leverage: Number(position.leverage),
  stop_loss: serializeBigInt(position.stop_loss),
  take_profit: serializeBigInt(position.take_profit),
  timestamp: serializeBigInt(position.timestamp),
  token: position.token,
});

// Convert SerializablePosition back to Position
export const toPosition = (position: SerializablePosition): Position => ({
  borrowed: parseBigInt(position.borrowed),
  collateral: parseBigInt(position.collateral),
  entry_price: parseBigInt(position.entry_price),
  filled: position.filled,
  leverage: position.leverage,
  stop_loss: parseBigInt(position.stop_loss),
  take_profit: parseBigInt(position.take_profit),
  timestamp: parseBigInt(position.timestamp),
  token: position.token,
});

export const fetchPosition = createAsyncThunk(
  'positions/fetchPosition',
  async (userId: string, { rejectWithValue }) => {
    try {
      const result = await positionManager.get_position({ user: userId });

      // Check if the result indicates no active position
      if (!result) {
        return { userId, noActivePosition: true };
      }

      return { userId, position: toSerializablePosition(result), noActivePosition: false };
    } catch (error) {
      console.error(error);
      return rejectWithValue((error as Error).message);
    }
  }
);

export const startPeriodicPositionRefresh = (userId: string) => (dispatch: AppDispatch) => {
  const refreshInterval = 5000; // 5 seconds

  const refresh = () => {
    dispatch(fetchPosition(userId));
  };

  refresh(); // Initial fetch
  const intervalId = setInterval(refresh, refreshInterval);

  // Return a function to stop the periodic refresh
  return () => {
    clearInterval(intervalId);
  };
};

const positionsSlice = createSlice({
  name: 'positions',
  initialState,
  reducers: {
    setPosition: (
      state,
      action: PayloadAction<{ userId: string; position: SerializablePosition | null }>
    ) => {
      const { userId, position } = action.payload;
      state.positions[userId] = position;
      state.noActivePosition[userId] = position === null;
      state.lastUpdated = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosition.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchPosition.fulfilled,
        (
          state,
          action: PayloadAction<{
            userId: string;
            position?: SerializablePosition;
            noActivePosition: boolean;
          }>
        ) => {
          state.isLoading = false;
          if (action.payload.noActivePosition) {
            state.positions[action.payload.userId] = null;
            state.noActivePosition[action.payload.userId] = true;
          } else {
            state.positions[action.payload.userId] = action.payload.position!;
            state.noActivePosition[action.payload.userId] = false;
          }
          state.lastUpdated = Date.now();
        }
      )
      .addCase(fetchPosition.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPosition } = positionsSlice.actions;

export const selectPosition = (state: RootState, userId: string): Position | null | undefined => {
  const serializablePosition = state.positions.positions[userId];
  console.log('pos', serializablePosition);
  if (serializablePosition === null) {
    return null; // Explicitly no position
  }
  return serializablePosition ? toPosition(serializablePosition) : undefined;
};

export const selectNoActivePosition = (state: RootState, userId: string): boolean => {
  return state.positions.noActivePosition[userId] || false;
};

export const selectPositionsLastUpdated = (state: RootState) => state.positions.lastUpdated;

export default positionsSlice.reducer;
