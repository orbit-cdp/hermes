import React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { styled } from '@mui/system';

interface TextProps extends TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'body1' | 'body2' | 'caption';
  color?: 'primary' | 'secondary' | 'textPrimary' | 'textSecondary' | 'positive' | 'negative';
}

const StyledText = styled(Typography)<TextProps>(({ theme, color }) => ({
  color: color ? theme.palette.main : theme.palette.text.primary,
}));

export const Text: React.FC<TextProps> = ({ children, ...props }) => (
  <StyledText {...props}>{children}</StyledText>
);
