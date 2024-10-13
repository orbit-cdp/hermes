import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { calculateFees, openLimitPosition, openPosition } from '../../store/walletSlice';
import { fetchTokenData, selectTokenData } from '../../store/perpsSlice';
import PositionTypeSelector from './PositionTypeSelector';
import TokenInput from '../common/TokenInput';
import LeverageControl from './LeverageControl';
import ActionButton from './ActionButton';
import TradeDetails from './TradeDetails';
import { Section } from '../common/Section';
import { FlexBox } from '../common/FlexBox';
import { TOKENS, SCALAR_7 } from '../../constants/tokens';
import { FormControl, InputLabel, MenuItem, Select, styled, TextField } from '@mui/material';
import { Text } from '../common/Text';
import LimitPriceInput from './LimitPriceInput';

// Custom styled components for consistent look
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'transparent',
    },
  },
}));

const StyledInputLabel = styled(InputLabel)(({ theme }) => ({
  color: theme.palette.text.secondary,
  '&.Mui-focused': {
    color: theme.palette.text.secondary,
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  '&.MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'transparent',
    },
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'transparent',
    },
    '&:hover fieldset': {
      borderColor: 'transparent',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'transparent',
    },
  },
}));

interface TradingInterfaceProps {
  positionType: 'long' | 'short';
  onPositionTypeChange: (positionType: 'long' | 'short') => void;
}

const TradingInterface: React.FC<TradingInterfaceProps> = React.memo(
  ({ positionType, onPositionTypeChange }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { contractId, isConnected, isPositionOperationInProgress } = useSelector(
      (state: RootState) => state.wallet
    );
    const [selectedToken, setSelectedToken] = useState(positionType === 'long' ? 'XLM' : 'USD');
    const [payingAmount, setPayingAmount] = useState('');
    const [positionSize, setPositionSize] = useState('');
    const [leverage, setLeverage] = useState(1.1);
    const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
    const [limitPrice, setLimitPrice] = useState('');
    const [fees, setFees] = useState<{
      totalFee: number;
      baseFee: number;
      impactFee: number;
    } | null>(null);

    const xlmTokenData = useSelector((state: RootState) => selectTokenData(state, 'XLM'));
    const usdTokenData = useSelector((state: RootState) => selectTokenData(state, 'USD'));

    useEffect(() => {
      dispatch(fetchTokenData());
    }, [dispatch]);

    useEffect(() => {
      setSelectedToken(positionType === 'long' ? 'XLM' : 'oUSD');
    }, [positionType]);

    const calculatePositionSize = useCallback((amount: string, lev: number) => {
      if (amount && !isNaN(Number(amount))) {
        return (Number(amount) * lev).toFixed(2);
      }
      return '';
    }, []);

    useEffect(() => {
      setPositionSize(calculatePositionSize(payingAmount, leverage));
    }, [payingAmount, leverage, calculatePositionSize]);

    useEffect(() => {
      console.log(leverage);
      calculateAndSetFees();
    }, [leverage]);

    const calculateAndSetFees = useCallback(async () => {
      if (contractId && payingAmount && !isNaN(Number(payingAmount))) {
        const token = TOKENS[selectedToken as keyof typeof TOKENS];
        const amount = Number(payingAmount);

        try {
          const calculatedFees = await dispatch(
            calculateFees({
              userId: contractId,
              token,
              amount,
              size: leverage,
            })
          ).unwrap();

          console.log('calc fee', calculatedFees);

          const totalFee = calculatedFees / SCALAR_7;
          console.log('total fee', totalFee);
          const baseFee = Number(payingAmount) * 0.0006; // 0.06% base fee
          const impactFee = totalFee - baseFee;

          setFees({ totalFee, baseFee, impactFee });
        } catch (error) {
          console.error('Failed to calculate fees:', error);
          setFees(null);
        }
      } else {
        setFees(null);
      }
    }, [contractId, payingAmount, selectedToken, leverage, dispatch]);

    useEffect(() => {
      calculateAndSetFees();
    }, [calculateAndSetFees]);

    const handlePayingAmountChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPayingAmount(value);
        setPositionSize(calculatePositionSize(value, leverage));
      },
      [leverage, calculatePositionSize]
    );

    const handlePositionSizeChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPositionSize(value);
        if (value && !isNaN(Number(value))) {
          setPayingAmount(((Number(value) * 0.1) / leverage).toFixed(2));
        } else {
          setPayingAmount('');
        }
      },
      [leverage]
    );

    const handleCreatePosition = useCallback(async () => {
      if (!contractId || !xlmTokenData || !usdTokenData) {
        console.error('Missing required data');
        return;
      }

      let selectedToken = positionType === 'long' ? 'XLM' : 'USD';

      const token = TOKENS[selectedToken as keyof typeof TOKENS];
      const amount = Number(payingAmount);
      const size = Number(positionSize);

      try {
        if (orderType === 'limit') {
          if (!limitPrice) {
            console.error('Limit price is required for limit orders');
            return;
          }

          await dispatch(
            openLimitPosition({
              userId: contractId,
              token,
              amount,
              size: leverage,
              entryPrice: Number(limitPrice),
            })
          ).unwrap();

          console.log(
            `Created limit ${positionType} position for ${payingAmount} ${selectedToken}, size: ${positionSize} ${selectedToken}, limit price: ${limitPrice}`
          );
        } else {
          const fees = await dispatch(
            calculateFees({
              userId: contractId,
              token,
              amount,
              size: leverage,
            })
          );

          console.log(fees);
          await dispatch(
            openPosition({
              userId: contractId,
              token,
              amount,
              size: leverage,
            })
          ).unwrap();

          console.log(
            `Created market ${positionType} position for ${payingAmount} ${selectedToken}, size: ${positionSize} ${selectedToken}`
          );
        }

        // Reset the form after successful position creation
        setPayingAmount('');
        setPositionSize('');
        setLeverage(1.1);
        setLimitPrice('');
      } catch (error) {
        console.error('Failed to create position:', error);
        // Handle the error (e.g., show an error message to the user)
      }
    }, [
      dispatch,
      contractId,
      positionType,
      payingAmount,
      positionSize,
      selectedToken,
      xlmTokenData,
      usdTokenData,
      orderType,
      limitPrice,
    ]);

    const calculateLiquidationPrice = useCallback(
      (entryPrice: number, isLong: boolean) => {
        if (!payingAmount || !positionSize) return null;

        const collateral = Number(payingAmount);
        const notionalValue = Number(positionSize);
        const maintenanceMargin = 0.01; // 5% maintenance margin, adjust as needed

        if (isLong) {
          return entryPrice * (1 - (1 - maintenanceMargin) / leverage);
        } else {
          return entryPrice * (1 + (1 - maintenanceMargin) / leverage);
        }
      },
      [payingAmount, positionSize, leverage]
    );

    const tradeDetails = useMemo(() => {
      if (!xlmTokenData || !usdTokenData) {
        return {
          entryPrice: '-',
          liquidationPrice: '-',
          openFee: '-',
          openFeePercentage: '-',
          priceImpact: '-',
          borrowRate: '-',
          availableLiquidity: '-',
        };
      }

      const xlmPrice = xlmTokenData.oraclePrice;
      const usdPrice = usdTokenData.oraclePrice;
      const isLong = positionType === 'long';
      const liquidationPrice = calculateLiquidationPrice(xlmPrice, isLong);
      console.log(fees);
      return {
        entryPrice: `$${xlmPrice.toFixed(2)}`,
        liquidationPrice: liquidationPrice ? `$${liquidationPrice.toFixed(5)}` : '-',
        openFee: fees ? `${fees.totalFee.toFixed(7)} USD` : '-',
        openFeePercentage:
          fees && payingAmount
            ? `${((fees.totalFee / Number(payingAmount)) * 100).toFixed(2)}%`
            : '-',
        priceImpact:
          fees && payingAmount
            ? `${((fees.impactFee / Number(payingAmount)) * 100).toFixed(2)}%`
            : '-',
        borrowRate: '0.0024% / hr',
        availableLiquidity: `$${(
          (xlmTokenData.tokenInfo.total_supply * xlmPrice) /
          SCALAR_7
        ).toFixed(2)}`,
      };
    }, [xlmTokenData, usdTokenData, positionType, calculateLiquidationPrice, fees, payingAmount]);

    return (
      <Section
        sx={{
          height: '100%',
          overflow: 'auto',
          padding: '16px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FlexBox direction="column" gap={2} sx={{ minHeight: '100%' }}>
          <PositionTypeSelector
            positionType={positionType}
            setPositionType={onPositionTypeChange}
          />
          <Text variant="caption" color="textSecondary">
            Order Type
          </Text>
          <StyledFormControl fullWidth>
            <StyledSelect
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as 'market' | 'limit')}
            >
              <MenuItem value="market">Market</MenuItem>
              <MenuItem value="limit">Limit</MenuItem>
            </StyledSelect>
          </StyledFormControl>
          {orderType === 'limit' && (
            <LimitPriceInput
              label="Limit Price"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
            />
          )}
          <TokenInput
            label="You're paying"
            selectedToken={selectedToken}
            value={payingAmount}
            onChange={handlePayingAmountChange}
          />
          <TokenInput
            label={`Size of ${positionType}`}
            selectedToken={selectedToken}
            value={positionSize}
            onChange={handlePositionSizeChange}
          />
          <LeverageControl leverage={leverage} setLeverage={setLeverage} />
          <TradeDetails {...tradeDetails} />
          <ActionButton
            onClick={handleCreatePosition}
            label={`Create ${orderType} ${positionType} position`}
            disabled={
              !isConnected ||
              !payingAmount ||
              !positionSize ||
              isPositionOperationInProgress ||
              (orderType === 'limit' && !limitPrice)
            }
          />
        </FlexBox>
      </Section>
    );
  }
);

export default TradingInterface;
