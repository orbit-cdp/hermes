import React from 'react';
import { Button } from '@mui/material';

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, label, disabled }) => (
  <Button
    variant="contained"
    onClick={onClick}
    disabled={disabled}
    sx={{
      bgcolor: '#121D28',
      color: 'white',
      '&:hover': {
        bgcolor: 'linear-gradient(90deg, rgba(199,242,132,1) 0%, rgba(0,190,240,1) 100%)',
      },
      '&:disabled': {
        bgcolor: 'rgba(255, 255, 255, 0.12)',
        color: 'rgba(255, 255, 255, 0.3)',
      },
      padding: '16px',
      borderRadius: '12px',
      fontSize: '18px',
      fontWeight: 500,
    }}
  >
    {label}
  </Button>
);

export default ActionButton;
