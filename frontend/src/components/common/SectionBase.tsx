import { Box, BoxProps, useTheme } from '@mui/material';

export interface SectionBaseProps extends BoxProps {
  type?: 'normal' | 'alt' | undefined;
}

export const SectionBase: React.FC<SectionBaseProps> = ({ children, type, sx, ...props }) => {
  const theme = useTheme();
  const color = type === 'alt' ? theme.palette.background.default : theme.palette.background.paper;
  const boxShadow = type === 'alt' ? 'unset' : '0px 4px 4px rgba(0, 0, 0, 0.1);';
  return (
    <Box
      sx={{
        backgroundColor: color,
        boxShadow: boxShadow,
        borderRadius: '5px',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
