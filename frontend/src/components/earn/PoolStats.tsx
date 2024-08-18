import React from 'react';
import {
  Box,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { selectSLPData } from '../../store/perpsSlice';

const PoolStats: React.FC = () => {
  const slpData = useSelector((state: RootState) => selectSLPData(state));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <Box sx={{ mt: 3, px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          SLP Price
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: 'white' }}>
          {formatCurrency(slpData.price)}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          Total Supply
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: 'white' }}>
          {formatNumber(slpData.totalSupply)} SLP
        </Typography>
      </Box>
    </Box>
  );
};

export default PoolStats;
