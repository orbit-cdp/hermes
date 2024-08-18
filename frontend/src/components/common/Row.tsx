import { Box, BoxProps } from '@mui/material';

export const Row: React.FC<BoxProps> = ({ children, sx, ...props }) => {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};
