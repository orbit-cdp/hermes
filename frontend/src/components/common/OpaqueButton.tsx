import { Button, ButtonProps, PaletteColor } from '@mui/material';

export interface OpaqueButtonProps extends ButtonProps {
  palette: PaletteColor;
  passedRef?: any;
}

export const OpaqueButton: React.FC<OpaqueButtonProps> = ({
  children,
  palette,
  sx,
  passedRef,
  ...props
}) => {
  return (
    <Button
      ref={passedRef}
      variant="contained"
      sx={{
        background: palette.opaque,
        color: palette.contrastText,
        '&:hover': { background: palette.opaque, color: 'white' },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};
