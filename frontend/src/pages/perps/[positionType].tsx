import React, { useEffect, useState } from 'react';
import type { NextPage, GetServerSideProps } from 'next';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useRouter } from 'next/router';
import TradingInterface from '../../components/perps/TradingInterface';
import PerpetualTradingHeader from '../../components/trading/PerpetualTradingHeader';
import TradingViewChart from '../../components/trading/TradingViewChart';
import TradingOverview from '../../components/trading/TradingOverview';

const Perps: NextPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const [positionType, setPositionType] = useState<'long' | 'short'>('long');
  const [activeSymbol, setActiveSymbol] = useState('XLMUSD');

  useEffect(() => {
    if (router.query.positionType) {
      setPositionType(router.query.positionType as 'long' | 'short');
    }
  }, [router.query.positionType]);

  const handlePositionTypeChange = (newPositionType: 'long' | 'short') => {
    router.push(`/perps/${newPositionType}`, undefined, { shallow: true });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: { xs: '100%', md: 'calc(100% - 360px)' },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <PerpetualTradingHeader activeSymbol={activeSymbol} setActiveSymbol={setActiveSymbol} />
        <Box sx={{ flexGrow: 0, overflow: 'hidden' }}>
          <TradingViewChart symbol={activeSymbol} />
        </Box>
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          <TradingOverview />
        </Box>
      </Box>
      <Box
        sx={{
          width: { xs: '100%', md: '360px' },
          height: '100%',
          overflow: 'auto',
          display: { xs: 'none', md: 'block' },
        }}
      >
        <TradingInterface
          positionType={positionType}
          onPositionTypeChange={handlePositionTypeChange}
        />
      </Box>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const positionType = context.params?.positionType as string | undefined;

  if (!positionType || (positionType !== 'long' && positionType !== 'short')) {
    return {
      redirect: {
        destination: '/perps/long',
        permanent: false,
      },
    };
  }

  return {
    props: { positionType },
  };
};

export default Perps;
