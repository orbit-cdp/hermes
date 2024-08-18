import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { fetchTokenData, selectSLPData, selectTokenData } from '../../store/perpsSlice';
import { depositSLP, withdrawSLP } from '../../store/walletSlice';
import { Section } from '../common/Section';
import { FlexBox } from '../common/FlexBox';
import { Text } from '../common/Text';
import { Box, Tabs, Tab, Typography, CircularProgress } from '@mui/material';
import TokenInput from '../common/TokenInput';
import ActionButton from '../perps/ActionButton';

interface SLPSwapInterfaceProps {
  swapType: 'buy' | 'sell';
  onSwapTypeChange: (swapType: 'buy' | 'sell') => void;
}

const SLPSwapInterface: React.FC<SLPSwapInterfaceProps> = React.memo(
  ({ swapType, onSwapTypeChange }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isConnected } = useSelector((state: RootState) => state.wallet);
    const [amount, setAmount] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const slpData = useSelector(selectSLPData);
    const usdTokenData = useSelector((state: RootState) => selectTokenData(state, 'USD'));
    const xlmTokenData = useSelector((state: RootState) => selectTokenData(state, 'XLM'));

    useEffect(() => {
      dispatch(fetchTokenData());
    }, [dispatch]);

    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setAmount(value);
      setError(null);
    }, []);

    const getDepositValue = useCallback(
      (slpAmount: number) => {
        if (!usdTokenData || !xlmTokenData || !slpData) {
          return [0, 0];
        }

        const totalValue = usdTokenData.totalValue + xlmTokenData.totalValue;
        if (totalValue === 0) {
          return [50, 500]
        }
        const depositValue = (slpAmount * totalValue) / Number(slpData.totalSupply);

        const aRatio = usdTokenData.currentRatio / 100; // Convert percentage to ratio
        const bRatio = xlmTokenData.currentRatio / 100;

        const targetARatio = usdTokenData.tokenInfo.target_ratio;
        const targetBRatio = xlmTokenData.tokenInfo.target_ratio;

        if (Math.abs(aRatio - targetARatio) < 1e-7) {
          const aDeposit = Number((depositValue * aRatio).toFixed(7));
          const bDeposit = Number(((depositValue * bRatio) / xlmTokenData.oraclePrice).toFixed(7));
          return [aDeposit, bDeposit];
        } else {
          const aNeedsToBe = Number(((totalValue + depositValue) * targetARatio).toFixed(7));
          const bNeedsToBe = Number(((totalValue + depositValue) * targetBRatio).toFixed(7));
          const aDifference = Number((aNeedsToBe - usdTokenData.totalValue).toFixed(7));
          const bDifference = Number((bNeedsToBe - xlmTokenData.totalValue).toFixed(7));

          if (aDifference >= depositValue) {
            return [Number(depositValue.toFixed(7)), 0];
          } else if (bDifference >= depositValue) {
            return [0, Number((depositValue / xlmTokenData.oraclePrice).toFixed(7))];
          } else {
            const totalToFix = Math.abs(aDifference) + Math.abs(bDifference);
            const leftOver = Number((depositValue - totalToFix).toFixed(7));
            const aDeposit = Number((Math.abs(aDifference) + leftOver * targetARatio).toFixed(7));
            const bDeposit = Number(
              (
                (Math.abs(bDifference) + leftOver * targetBRatio) /
                xlmTokenData.oraclePrice
              ).toFixed(7)
            );
            return [aDeposit, bDeposit];
          }
        }
      },
      [usdTokenData, xlmTokenData, slpData]
    );

    const handleSwap = useCallback(async () => {
      if (!amount || isNaN(parseFloat(amount))) {
        setError('Invalid amount');
        return;
      }

      const slpAmount = parseFloat(amount);

      setIsLoading(true);
      setError(null);

      try {
        if (swapType === 'buy') {
          const [usdAmount, xlmAmount] = getDepositValue(slpAmount);
          await dispatch(depositSLP({ tokenAAmount: usdAmount, tokenBAmount: xlmAmount })).unwrap();
          console.log(`Bought ${slpAmount} SLP`);
        } else {
          await dispatch(withdrawSLP({ slpAmount })).unwrap();
          console.log(`Sold ${slpAmount} SLP`);
        }
        setAmount('');
      } catch (error) {
        console.error(`Failed to ${swapType} SLP:`, error);
        setError(`Failed to ${swapType} SLP. Please try again.`);
      } finally {
        setIsLoading(false);
      }
    }, [amount, swapType, getDepositValue, dispatch]);

    const swapDetails = useMemo(() => {
      if (!amount || isNaN(parseFloat(amount)) || !usdTokenData || !xlmTokenData) {
        return {
          oUSDAmount: '-',
          XLMAmount: '-',
          totalValue: '-',
        };
      }

      const slpAmount = parseFloat(amount);
      const [usdAmount, xlmAmount] = getDepositValue(slpAmount);

      const totalValue = Number(usdAmount) + Number(xlmAmount) * xlmTokenData.oraclePrice;

      return {
        oUSDAmount: usdAmount.toFixed(7),
        XLMAmount: xlmAmount.toFixed(7),
        totalValue: totalValue.toFixed(7),
      };
    }, [amount, usdTokenData, xlmTokenData, getDepositValue]);

    return (
      <Section
        sx={{
          height: '100%',
          overflow: 'auto',
          padding: '16px',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <FlexBox
          direction="column"
          gap={2}
          sx={{ minHeight: '100%', width: '100%', maxWidth: '400px' }}
        >
          <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
            SLP Swap
          </Typography>
          <Tabs
            value={swapType}
            onChange={(_, newValue) => onSwapTypeChange(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab label="Buy" value="buy" />
            <Tab label="Sell" value="sell" />
          </Tabs>
          <TokenInput
            label={swapType === 'buy' ? 'Amount to Buy' : 'Amount to Sell'}
            selectedToken="SLP"
            value={amount}
            onChange={handleAmountChange}
            disabled={isLoading}
          />
          <Box sx={{ mt: 2 }}>
            <FlexBox justifyContent="space-between">
              <Text variant="caption" color="textSecondary">
                oUSD Amount
              </Text>
              <Text variant="caption" color="textPrimary">
                {swapDetails.oUSDAmount}
              </Text>
            </FlexBox>
            <FlexBox justifyContent="space-between">
              <Text variant="caption" color="textSecondary">
                XLM Amount
              </Text>
              <Text variant="caption" color="textPrimary">
                {swapDetails.XLMAmount}
              </Text>
            </FlexBox>
            <FlexBox justifyContent="space-between">
              <Text variant="caption" color="textSecondary">
                Total Value
              </Text>
              <Text variant="caption" color="textPrimary">
                ${swapDetails.totalValue}
              </Text>
            </FlexBox>
          </Box>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <ActionButton
            onClick={handleSwap}
            label={isLoading ? 'Processing...' : `${swapType === 'buy' ? 'Buy' : 'Sell'} SLP`}
            disabled={!isConnected || !amount || isLoading}
          />
        </FlexBox>
      </Section>
    );
  }
);

export default SLPSwapInterface;
