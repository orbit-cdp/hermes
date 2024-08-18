import React from 'react';
import { Paper, PaperProps } from '@mui/material';
import { styled } from '@mui/system';

const StyledCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
}));

export const Card: React.FC<PaperProps> = ({ children, ...props }) => (
  <StyledCard elevation={0} {...props}>
    {children}
  </StyledCard>
);
