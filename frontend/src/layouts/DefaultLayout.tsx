import { Box } from '@mui/material';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import TradingAnvil from '../components/trading/TradingAnvil';
import WalletBanner from '../components/auth/WalletBanner';
import { FlexBox } from '../components/common/FlexBox';

export default function DefaultLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { poolId } = router.query;
  const safePoolId =
    typeof poolId == 'string' && /^[0-9A-Z]{56}$/.test(poolId) ? poolId : undefined;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <TradingAnvil />
        <FlexBox sx={{ padding: '20px' }}>
          <WalletBanner />
        </FlexBox>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
