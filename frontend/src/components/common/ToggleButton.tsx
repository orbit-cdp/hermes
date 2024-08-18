import { Box, Button, ButtonBaseProps, PaletteColor, useTheme } from '@mui/material';
import React from 'react';
import { OpaqueButton } from './OpaqueButton';

export interface ToggleButtonProps extends ButtonBaseProps {
  active: boolean;
  palette: PaletteColor;
}

export const ToggleButton: React.FC<ToggleButtonProps> = React.forwardRef(
  ({ active, palette, sx, children, color, ...props }, ref) => {
    const theme = useTheme();
    return (
      <Box sx={{ display: 'flex', width: '100%' }}>
        {active ? (
          <OpaqueButton palette={palette} sx={{ ...sx }} {...props} passedRef={ref}>
            {children}
          </OpaqueButton>
        ) : (
          <Button
            variant="text"
            sx={{
              background: theme.palette.background.paper,
              color: theme.palette.primary.main,
              '&:hover': { background: theme.palette.background.paper, color: palette.main },
              ...sx,
            }}
            {...props}
            ref={ref}
          >
            {children}
          </Button>
        )}
      </Box>
    );
  }
);
