import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography, Card, CardContent } from '@mui/material';
import LiquidityAllocation from '../components/earn/LiquidityAllocation';
import SLPSwapInterface from '../components/earn/SLPSwapInterface';
import { RootState } from '../store/store';
import { selectTotalLockedValue } from '../store/perpsSlice';

const Earn: React.FC = () => {
  const [swapType, setSwapType] = useState<'buy' | 'sell'>('buy');
  const totalLockedValue = useSelector(selectTotalLockedValue);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        gap: '2rem',
        p: 4,
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Card
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.875rem',
              }}
            >
              Total Value Locked
            </Typography>
            <Typography
              variant="h4"
              sx={{
                mb: 1,
                fontSize: '1.5rem',
                fontWeight: 600,
                color: 'white',
              }}
            >
              {formatCurrency(totalLockedValue)}
            </Typography>
          </CardContent>
        </Card>
        <LiquidityAllocation />
      </Box>
      <Box sx={{ width: '400px' }}>
        <SLPSwapInterface swapType={swapType} onSwapTypeChange={setSwapType} />
      </Box>
    </Box>
  );
};

export default Earn;
