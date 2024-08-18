import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import Image from 'next/image';
import PoolStats from './PoolStats';
import { Card } from '../common/Card';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store/store';
import { fetchTokenData, selectTokenData, selectTotalLockedValue } from '../../store/perpsSlice';

const LiquidityAllocation: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const xlmTokenData = useSelector((state: RootState) => selectTokenData(state, 'XLM'));
  const usdTokenData = useSelector((state: RootState) => selectTokenData(state, 'USD'));
  const totalLockedValue = useSelector(selectTotalLockedValue);

  useEffect(() => {
    dispatch(fetchTokenData());
  }, [dispatch]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  const calculateWeightage = (currentRatio: number, targetRatio: number) => {
    return `${formatPercentage(currentRatio)} / ${formatPercentage(targetRatio * 100)}`;
  };

  const token_data = [
    {
      name: 'XLM',
      fullName: 'Stellar Lumens',
      poolSize: formatNumber(xlmTokenData?.totalValue || 0),
      amount: `${(xlmTokenData?.tokenInfo.total_supply || 0).toFixed(2)} XLM`,
      weightage: calculateWeightage(
        xlmTokenData?.currentRatio || 0,
        xlmTokenData?.tokenInfo.target_ratio || 0
      ),
      utilization: formatPercentage(xlmTokenData?.utilization || 0),
      logo: '/path/to/xlm-logo.png', // Replace with actual path
    },
    {
      name: 'oUSD',
      fullName: 'Orbit USD',
      poolSize: formatNumber(usdTokenData?.totalValue || 0),
      amount: `${(usdTokenData?.tokenInfo.total_supply || 0).toFixed(2)} oUSD`,
      weightage: calculateWeightage(
        usdTokenData?.currentRatio || 0,
        usdTokenData?.tokenInfo.target_ratio || 0
      ),
      utilization: formatPercentage(usdTokenData?.utilization || 0),
      logo: '/path/to/ousd-logo.png', // Replace with actual path
    },
  ];

  return (
    <Card
      sx={{
        overflow: 'hidden',
      }}
    >
      <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
        <Table sx={{ minWidth: 688 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontSize: '0.75rem',
                  borderBottom: 'none',
                }}
              >
                Token
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontSize: '0.75rem',
                  borderBottom: 'none',
                }}
              >
                Pool Size
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontSize: '0.75rem',
                  borderBottom: 'none',
                }}
              >
                Current / Target Weightage
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color: 'rgba(255, 255, 255, 0.25)',
                  fontSize: '0.75rem',
                  borderBottom: 'none',
                }}
              >
                Utilization
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {token_data.map((token, index) => (
              <TableRow key={token.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{
                    borderBottom:
                      index === token_data.length - 1
                        ? 'none'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ minHeight: 24, minWidth: 24, mr: 1 }}>
                      <Image
                        src={token.logo}
                        alt={token.name}
                        width={24}
                        height={24}
                        style={{ objectFit: 'cover', borderRadius: '50%' }}
                      />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', color: 'white' }}>
                        {token.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.3)' }}>
                        {token.fullName}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    borderBottom:
                      index === token_data.length - 1
                        ? 'none'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', color: 'white' }}>
                    {token.poolSize}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.3)' }}>
                    {token.amount}
                  </Typography>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    borderBottom:
                      index === token_data.length - 1
                        ? 'none'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {token.weightage}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    borderBottom:
                      index === token_data.length - 1
                        ? 'none'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {token.utilization}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <PoolStats />
    </Card>
  );
};

export default LiquidityAllocation;
