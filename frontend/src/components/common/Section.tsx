import React from 'react';
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/system';

interface SectionProps extends BoxProps {
  backgroundColor?: string;
}

const StyledSection = styled(Box)<SectionProps>(({ theme, backgroundColor }) => ({
  padding: theme.spacing(2),
  backgroundColor: backgroundColor || theme.palette.background.paper,
}));

export const Section: React.FC<SectionProps> = ({ children, ...props }) => (
  <StyledSection {...props}>{children}</StyledSection>
);
