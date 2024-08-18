// positionsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppDispatch } from './store';
import { positionManager } from '../lib/passkey';
import { Position } from 'position-manager-sdk';

// Helper function to convert BigInt to string for serialization
const serializeBigInt = (value: bigint | number): string => value.toString();

// Helper function to parse string back to number
const parseNumber = (value: string): number => Number(value);

// Serializable version of the Position type
interface SerializablePosition {
  borrowed: string;
  collateral: string;
  entry_price: string;
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
  timestamp: serializeBigInt(position.timestamp),
  token: position.token,
});

// Convert SerializablePosition back to Position (for type consistency in components)
export const toPosition = (position: SerializablePosition): Position => ({
  borrowed: BigInt(position.borrowed),
  collateral: BigInt(position.collateral),
  entry_price: BigInt(position.entry_price),
  timestamp: BigInt(position.timestamp),
  token: position.token,
});

export const fetchPosition = createAsyncThunk(
  'positions/fetchPosition',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log(userId);
      const { result } = await positionManager.get_position({ user: userId });

      // Check if the result indicates no active position
      if (
        !result ||
        result.error ||
        (typeof result === 'object' && Object.keys(result).length === 0)
      ) {
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
  const refreshInterval = 30000; // 30 seconds

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
