import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import walletReducer from './walletSlice';
import perpsReducer from './perpsSlice';
import positionReducer from './positionsSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    perps: perpsReducer,
    positions: positionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
