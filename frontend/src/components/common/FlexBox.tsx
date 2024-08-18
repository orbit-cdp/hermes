import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/system';

interface FlexBoxProps extends BoxProps {
  direction?: 'row' | 'column';
  gap?: number | string;
}

const StyledFlexBox = styled(Box)<FlexBoxProps>(({ theme, direction = 'row', gap = 2 }) => ({
  display: 'flex',
  flexDirection: direction,
  gap: theme.spacing(gap),
}));

export const FlexBox: React.FC<FlexBoxProps> = ({ children, ...props }) => (
  <StyledFlexBox {...props}>{children}</StyledFlexBox>
);
