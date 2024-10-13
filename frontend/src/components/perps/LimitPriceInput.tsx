import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import Image from 'next/image';

interface LimitPriceInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const LimitPriceInput: React.FC<LimitPriceInputProps> = ({ label, value, onChange, disabled }) => (
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '0.75rem' }}></Box>
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
        disabled={disabled}
      />
    </Box>
  </>
);

export default LimitPriceInput;
