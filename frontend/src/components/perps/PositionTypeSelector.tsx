import React from 'react';
import { Box, Button } from '@mui/material';
import ShortIcon from '../icons/ShortIcon';
import LongIcon from '../icons/LongIcon';

interface PositionTypeButtonProps {
  type: 'long' | 'short';
  selected: boolean;
  onClick: () => void;
}

const typeToPosition = {
  long: 'Long',
  short: 'Short',
};

const PositionTypeButton: React.FC<PositionTypeButtonProps> = ({ type, selected, onClick }) => {
  const isLong = type === 'long';
  const color = isLong ? 'rgb(50 223 123)' : 'rgb(235 87 87)';
  const Icon = isLong ? LongIcon : ShortIcon;

  return (
    <Button
      onClick={onClick}
      sx={{
        padding: '8px 14px',
        width: '100%',
        borderRadius: '0px',
        bgcolor: selected ? `rgba(${isLong ? '50,223,123' : '235,87,87'},.1)` : 'transparent',
        border: selected ? `2px solid ${color}` : '2px solid transparent',
        color: selected ? `${color} !important` : 'hsla(0,0%,100%,.5)',
        display: 'flex',
        gap: '8px',
      }}
    >
      {typeToPosition[type]}
      <Icon color={selected ? color : 'hsla(0,0%,100%,.5)'} />
    </Button>
  );
};

interface PositionTypeSelectorProps {
  positionType: 'long' | 'short';
  setPositionType: (positionType: 'long' | 'short') => void;
}

const PositionTypeSelector: React.FC<PositionTypeSelectorProps> = ({
  positionType,
  setPositionType,
}) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Box
      sx={{
        display: 'flex',
        bgcolor: '#19232D',
        width: '100%',
        padding: '4px',
        gap: '8px',
      }}
    >
      <PositionTypeButton
        type="long"
        selected={positionType === 'long'}
        onClick={() => setPositionType('long')}
      />
      <PositionTypeButton
        type="short"
        selected={positionType === 'short'}
        onClick={() => setPositionType('short')}
      />
    </Box>
  </Box>
);

export default PositionTypeSelector;
