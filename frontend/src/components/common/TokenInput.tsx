import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import Image from 'next/image';
import { slp } from '../../lib/passkey';

const coinIconPaths: { [key: string]: string } = {
  XLM: '/icons/tokens/xlm.svg',
  oUSD: '/icons/tokens/ousd.svg',
  SLP: '/icons/tokens/slp.svg',
};

interface TokenInputProps {
  label: string;
  selectedToken: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const TokenInput: React.FC<TokenInputProps> = ({
  label,
  selectedToken,
  value,
  onChange,
  disabled,
}) => (
  <>
    <Typography variant="caption" sx={{ color: 'white' }}>
      {label}
    </Typography>
    <Box
      sx={{
        bgcolor: 'rgb(24, 28, 36)',
        height: '3.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid rgb(63, 70, 77)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '0.75rem' }}>
        <Image
          src={coinIconPaths[selectedToken]}
          alt={selectedToken}
          width={24}
          height={24}
          style={{ borderRadius: '50%' }}
        />
        <Typography variant="body1" sx={{ color: 'white' }}>
          {selectedToken}
        </Typography>
      </Box>
      <TextField
        variant="standard"
        placeholder="0.00"
        InputProps={{
          disableUnderline: true,
          style: { color: 'white', textAlign: 'right' },
        }}
        sx={{
          input: { textAlign: 'right', paddingRight: '8px' },
        }}
        value={value}
        onChange={onChange}
      />
    </Box>
  </>
);

export default TokenInput;
