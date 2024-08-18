import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import Image from 'next/image';

interface TokenButtonProps {
  symbol: string;
  imageUrl: string;
  isActive: boolean;
  onClick: () => void;
}

const TokenButton: React.FC<TokenButtonProps> = ({ symbol, imageUrl, isActive, onClick }) => (
  <Button
    onClick={onClick}
    sx={{
      height: { xs: '36px', lg: '40px' },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      borderRadius: '0px',
      paddingLeft: '6px',
      paddingRight: '8px',
      fontSize: '14px',
      border: (theme) => `${isActive ? 2 : 1}px solid`,
      borderColor: isActive ? 'rgb(0 188 240)' : 'transparent',
      bgcolor: isActive ? 'rgba(0,188, 240, 0.2)' : 'transparent',
      color: isActive ? 'rgba(0,188, 240, 1)' : 'white',
      '&:hover': {
        borderColor: isActive ? 'rgb(0 188 240)' : 'primary.main',
      },
      whiteSpace: 'nowrap',
    }}
  >
    <Box sx={{ position: 'relative', marginRight: 1, display: 'flex', alignItems: 'center' }}>
      <Image
        src={imageUrl}
        alt={symbol}
        width={24}
        height={24}
        style={{ maxWidth: '24px', maxHeight: '24px', objectFit: 'cover', borderRadius: '9999px' }}
      />
    </Box>
    <span>{symbol}</span>
  </Button>
);

interface StatProps {
  label: string;
  value: string;
  color?: string;
}

const Stat: React.FC<StatProps> = ({ label, value, color = 'white' }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
    <Typography variant="subtitle1" sx={{ color: 'rgba(255, 255, 255, 0.3)' }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color }}>
      {value}
    </Typography>
  </Box>
);

interface PerpetualTradingHeaderProps {
  activeSymbol: string;
  setActiveSymbol: (symbol: string) => void;
}

const PerpetualTradingHeader: React.FC<PerpetualTradingHeaderProps> = ({
  activeSymbol,
  setActiveSymbol,
}) => {
  const tokenPairs = [
    {
      symbol: 'XLM-PERP',
      tradingViewSymbol: 'XLMUSD',
      imageUrl: '/icons/tokens/xlm.svg',
    },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        background: 'rgb(24, 28, 36)',
        flexDirection: { xs: 'column', lg: 'row' },
        alignItems: { lg: 'center' },
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px 0',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          height: '100%',
          alignItems: 'center',
          padding: '0 8px',
        }}
      >
        {tokenPairs.map((pair) => (
          <TokenButton
            key={pair.symbol}
            symbol={pair.symbol}
            imageUrl={pair.imageUrl}
            isActive={activeSymbol === pair.tradingViewSymbol}
            onClick={() => setActiveSymbol(pair.tradingViewSymbol)}
          />
        ))}
      </Box>
      <Box
        sx={{
          display: 'flex',
          minWidth: '260px',
          padding: '0 12px',
          gap: { lg: '12px', xl: '28px' },
          justifyContent: { lg: 'space-between', xl: 'flex-end' },
          alignItems: 'center',
          marginLeft: 'auto',
        }}
      >
      </Box>
    </Box>
  );
};

export default PerpetualTradingHeader;
