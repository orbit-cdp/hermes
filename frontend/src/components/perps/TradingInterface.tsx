import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { openPosition } from '../../store/walletSlice';
import { fetchTokenData, selectTokenData } from '../../store/perpsSlice';
import PositionTypeSelector from './PositionTypeSelector';
import TokenInput from '../common/TokenInput';
import LeverageControl from './LeverageControl';
import ActionButton from './ActionButton';
import TradeDetails from './TradeDetails';
import { Section } from '../common/Section';
import { FlexBox } from '../common/FlexBox';
import { TOKENS, SCALAR_7 } from '../../constants/tokens';

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
          setPayingAmount((Number(value) / leverage).toFixed(2));
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
      const size = Number(leverage);

      console.log(amount, size, token);

      try {
        await dispatch(
          openPosition({
            userId: contractId,
            token,
            amount,
            size,
          })
        ).unwrap();

        console.log(
          `Created ${positionType} position for ${payingAmount} ${selectedToken}, size: ${positionSize} ${selectedToken}`
        );

        // Reset the form after successful position creation
        setPayingAmount('');
        setPositionSize('');
        setLeverage(1.1);
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

      return {
        entryPrice: `$${xlmPrice.toFixed(2)}`,
        liquidationPrice: liquidationPrice ? `$${liquidationPrice.toFixed(5)}` : '-',
        openFee: '0.0 USD',
        openFeePercentage: '0.00%',
        priceImpact: '-', // Calculate based on your logic
        borrowRate: '0.0024% / hr',
        availableLiquidity: `$${(
          (xlmTokenData.tokenInfo.total_supply * xlmPrice) /
          SCALAR_7
        ).toFixed(2)}`,
      };
    }, [xlmTokenData, usdTokenData, positionType, calculateLiquidationPrice]);

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
            label={`Create ${positionType} position`}
            disabled={
              !isConnected || !payingAmount || !positionSize || isPositionOperationInProgress
            }
          />
        </FlexBox>
      </Section>
    );
  }
);

export default TradingInterface;