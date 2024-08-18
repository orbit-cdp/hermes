import React, { useState } from 'react';
import { TableRow, TableCell, Typography, Button, Box } from '@mui/material';
import Image from 'next/image';
import { Position } from 'position-manager-sdk';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { selectTokenData } from '../../store/perpsSlice';
import { closePosition } from '../../store/walletSlice';
import { TOKENS } from '../../constants/tokens';

interface PositionRowProps {
  position: Position;
  onClosePosition: () => void;
}

const SCALAR_7 = 10_000_000; // 10^7

const PositionRow: React.FC<PositionRowProps> = ({ position, onClosePosition }) => {
  const dispatch = useDispatch<AppDispatch>();
  const xlmTokenData = useSelector((state: RootState) => selectTokenData(state, 'XLM'));
  const usdTokenData = useSelector((state: RootState) => selectTokenData(state, 'USD'));
  const { contractId, isPositionOperationInProgress } = useSelector(
    (state: RootState) => state.wallet
  );

  const [showTakeProfitInput, setShowTakeProfitInput] = useState(false);
  const [showStopLossInput, setShowStopLossInput] = useState(false);
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');

  if (!xlmTokenData || !usdTokenData) {
    return null; // Or a loading state
  }

  const xlmPrice = xlmTokenData.oraclePrice;
  const usdPrice = usdTokenData.oraclePrice;

  const formatUSD = (value: number) => `$${value.toFixed(2)}`;
  const formatToken = (value: number) => {
    if (position.token === TOKENS.XLM) {
      return `${value.toFixed(4)} XLM`;
    } else {
      return `${value.toFixed(2)} oUSD`;
    }
  };
  const formatXLMPrice = (value: number) => `${value.toFixed(4)} XLM`;

  const size = Number(position.borrowed) / SCALAR_7;
  const collateral = Number(position.collateral) / SCALAR_7;
  const entryPrice = Number(position.entry_price) / SCALAR_7;
  const markPrice = position.token === TOKENS.XLM ? xlmPrice / usdPrice : usdPrice / xlmPrice;

  // Always calculate prices in XLM terms
  const xlmEntryPrice = position.token === TOKENS.XLM ? entryPrice : 1 / entryPrice;
  const xlmMarkPrice = position.token === TOKENS.XLM ? markPrice : 1 / markPrice;
  const xlmLiquidationPrice = position.token === TOKENS.XLM 
    ? entryPrice * (1 - collateral / (collateral + size))
    : 1 / (entryPrice * (1 - collateral / (collateral + size)));

  const leverage = size / collateral;
  
  const pnl = position.token === TOKENS.XLM ? 
    size * (markPrice - entryPrice) : 
    size * (1/entryPrice - 1/markPrice);

  const pnlPercentage = position.token === TOKENS.XLM ?
    ((markPrice - entryPrice) / entryPrice) * 100 :
    ((1/markPrice - 1/entryPrice) / (1/entryPrice)) * 100;

  const value = position.token === TOKENS.XLM ? size * markPrice : size;

  // Calculate USD values correctly based on the position's token
  const valueInUSD = position.token === TOKENS.XLM ? value * usdPrice : value;
  const pnlInUSD = position.token === TOKENS.XLM ? pnl * usdPrice : pnl;
  const sizeInUSD = position.token === TOKENS.XLM ? size * xlmPrice : size;
  const collateralInUSD = position.token === TOKENS.XLM ? collateral * xlmPrice : collateral;

  const handleClosePosition = async () => {
    if (contractId) {
      try {
        await dispatch(closePosition(contractId)).unwrap();
      } catch (error) {
        console.error('Failed to close position:', error);
      }
    }
  };

  return (
    <TableRow>
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Image
            src={`/icons/tokens/${position.token == TOKENS.XLM ? "xlm" : "ousd"}.svg`}
            alt="XLM"
            width={24}
            height={24}
            style={{ borderRadius: '50%' }}
          />
          <Typography color="white">{position.token == TOKENS.XLM ? "XLM" : "oUSD"}</Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography color="white">{formatUSD(valueInUSD)}</Typography>
        <Typography
          style={{
            color: pnl >= 0 ? 'rgb(50, 223, 123)' : 'rgb(235, 87, 87)',
          }}
          variant="body2"
        >
          {formatUSD(pnlInUSD)} ({pnlPercentage.toFixed(2)}%)
        </Typography>
      </TableCell>
      <TableCell>
        <Typography color="white">
          {formatToken(size)} ({leverage.toFixed(2)}x)
        </Typography>
        <Typography color="white" variant="body2">
          {formatUSD(sizeInUSD)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography color="white">{formatToken(collateral)}</Typography>
        <Typography color="white" variant="body2">
          {formatUSD(collateralInUSD)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography color="white">
          {formatXLMPrice(xlmEntryPrice)} / {formatXLMPrice(xlmMarkPrice)}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography color="white">{formatXLMPrice(xlmLiquidationPrice)}</Typography>
      </TableCell>
      <TableCell>
        {showTakeProfitInput ? (
          <Box>
            <input
              type="number"
              value={takeProfitPrice}
              onChange={(e) => setTakeProfitPrice(e.target.value)}
              placeholder="Price"
            />
            <Button>Set</Button>
          </Box>
        ) : (
          <Button variant="outlined" size="small" onClick={() => setShowTakeProfitInput(true)}>
            Add TP
          </Button>
        )}
      </TableCell>
      <TableCell>
        {showStopLossInput ? (
          <Box>
            <input
              type="number"
              value={stopLossPrice}
              onChange={(e) => setStopLossPrice(e.target.value)}
              placeholder="Price"
            />
            <Button>Set</Button>
          </Box>
        ) : (
          <Button variant="outlined" size="small" onClick={() => setShowStopLossInput(true)}>
            Add SL
          </Button>
        )}
      </TableCell>
      <TableCell>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleClosePosition}
          disabled={isPositionOperationInProgress}
        >
          Close
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default PositionRow;