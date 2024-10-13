import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  styled,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import {
  fetchPosition,
  selectPosition,
  selectPositionsLastUpdated,
  startPeriodicPositionRefresh,
} from '../../store/positionsSlice';
import { closeAllPositions, closePosition } from '../../store/walletSlice';
import { Position } from '../../../packages/position-manager-sdk/dist';
import PositionRow from './PositionRow'; // We'll create this component next

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: 'rgb(24, 28, 36)',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
}));

const StyledTable = styled(Table)({
  borderCollapse: 'separate',
  borderSpacing: '0 8px',
});

const StyledTableHeadCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: 'hsla(0,0%,100%,.5)',
  border: 'none',
  fontWeight: 'normal',
  padding: theme.spacing(1),
}));

const TradingOverview: React.FC = () => {
  const { contractId } = useSelector((state: RootState) => state.wallet);
  const dispatch = useDispatch<AppDispatch>();
  const position = useSelector((state: RootState) =>
    contractId ? selectPosition(state, contractId) : undefined
  );

  console.log(position);

  const xlmTokenData = useSelector((state: RootState) => state.perps.tokens['XLM']);

  useEffect(() => {
    if (contractId) {
      const stopRefresh = dispatch(startPeriodicPositionRefresh(contractId));
      return () => stopRefresh();
    }
  }, [dispatch, contractId]);

  const handleCloseAllPositions = async () => {
    if (contractId) {
      try {
        await dispatch(closeAllPositions(contractId)).unwrap();
        dispatch(fetchPosition(contractId));
      } catch (error) {
        console.error('Failed to close all positions:', error);
      }
    }
  };

  return (
    <Box
      sx={{
        padding: 0,
        background: 'rgb(24, 28, 36)',
        color: 'white',
        overflow: 'auto',
      }}
    >
      <StyledTableContainer>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" color="white">
            Positions ({position ? 1 : 0})
          </Typography>
          <Button
            variant="contained"
            onClick={handleCloseAllPositions}
            sx={{
              backgroundColor: '#19232D',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
            }}
          >
            Close All
          </Button>
        </Box>
        <StyledTable>
          <TableHead>
            <TableRow>
              <StyledTableHeadCell>Position</StyledTableHeadCell>
              <StyledTableHeadCell>Value</StyledTableHeadCell>
              <StyledTableHeadCell>Size</StyledTableHeadCell>
              <StyledTableHeadCell>Collateral</StyledTableHeadCell>
              <StyledTableHeadCell>Entry / Mark Price</StyledTableHeadCell>
              <StyledTableHeadCell>Liq. Price</StyledTableHeadCell>
              <StyledTableHeadCell>Take Profit</StyledTableHeadCell>
              <StyledTableHeadCell>Stop Loss</StyledTableHeadCell>
              <StyledTableHeadCell>Actions</StyledTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {position ? (
              <PositionRow
                key={contractId}
                position={position}
                onClosePosition={() => dispatch(closePosition(contractId!))}
              />
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ color: 'white' }}>
                  No open positions
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </Box>
  );
};

export default TradingOverview;
