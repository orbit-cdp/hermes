import React from 'react';
import { Box, Typography, TextField, Button, Slider } from '@mui/material';

interface LeverageControlProps {
  leverage: number;
  setLeverage: React.Dispatch<React.SetStateAction<number>>;
}

const LeverageControl: React.FC<LeverageControlProps> = ({ leverage, setLeverage }) => (
  <>
    <Typography variant="caption" sx={{ color: 'white' }}>
      Leverage
    </Typography>
    <Box
      sx={{
        bgcolor: 'rgb(24, 28, 36)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      <Button
        sx={{ position: 'absolute', left: '8px', color: 'white' }}
        onClick={() => setLeverage((prev) => Math.max(1.1, prev - 0.1))}
      >
        -
      </Button>
      <TextField
        variant="standard"
        value={`${leverage.toFixed(1)}x`}
        InputProps={{
          disableUnderline: true,
          style: { color: 'white', textAlign: 'center' },
        }}
        sx={{
          input: { textAlign: 'center' },
          width: '100%',
        }}
      />
      <Button
        sx={{ position: 'absolute', right: '8px', color: 'white' }}
        onClick={() => setLeverage((prev) => Math.min(100, prev + 0.1))}
      >
        +
      </Button>
    </Box>
    <Box sx={{ paddingX: 1 }}>
      <Slider
        value={leverage}
        onChange={(_, newValue) => setLeverage(newValue as number)}
        min={1.1}
        max={100}
        step={0.1}
        marks={[
          { value: 1.1, label: '1.1x' },
          { value: 20, label: '20x' },
          { value: 40, label: '40x' },
          { value: 60, label: '60x' },
          { value: 80, label: '80x' },
          { value: 100, label: '100x' },
        ]}
        sx={{
          color: '#32DF7B',
          '& .MuiSlider-thumb': {
            bgcolor: 'rgb(24, 28, 36)',
            borderRadius: '0px',
            border: '3px solid rgb(137, 141, 146)',
          },
          '& .MuiSlider-rail': {
            bgcolor: 'rgba(0,0,0,1)',
          },
          '& .MuiSlider-mark': {
            bgcolor: '#19232D',
            width: '2px',
            height: '12px',
            marginTop: '0px',
          },
          '& .MuiSlider-markLabel': {
            color: 'rgba(232, 249, 255, 0.5)',
          },
          '& .MuiSlider-markActive': {
            background: 'rgb(50 223 123)',
          },
        }}
      />
    </Box>
  </>
);

export default LeverageControl;
