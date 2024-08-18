import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

interface CustomButtonProps extends MuiButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  color?: 'primary' | 'secondary' | 'error';
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = 'contained',
  color = 'primary',
  ...props
}) => (
  <MuiButton
    variant={variant}
    color={color}
    sx={{
      borderRadius: '12px',
      textTransform: 'none',
      '&:hover': {
        backgroundColor: (theme) => theme.palette[color].light,
      },
      ...props.sx,
    }}
    {...props}
  >
    {children}
  </MuiButton>
);

export default CustomButton;
