import React from 'react';
import { Box, Button } from '@mui/material';

interface OrderTypeButtonProps {
  type: 'market' | 'limit';
  selected: boolean;
  onClick: () => void;
}

const typeToLabel = {
  market: 'Market',
  limit: 'Limit',
};

const OrderTypeButton: React.FC<OrderTypeButtonProps> = ({ type, selected, onClick }) => {
  return (
    <Button
      onClick={onClick}
      sx={{
        padding: '8px 14px',
        width: '100%',
        borderRadius: '0px',
        bgcolor: selected ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: selected ? '2px solid #32DF7B' : '2px solid transparent',
        color: selected ? '#32DF7B !important' : 'hsla(0,0%,100%,.5)',
      }}
    >
      {typeToLabel[type]}
    </Button>
  );
};

interface OrderTypeSelectorProps {
  orderType: 'market' | 'limit';
  setOrderType: (orderType: 'market' | 'limit') => void;
}

const OrderTypeSelector: React.FC<OrderTypeSelectorProps> = ({
  orderType,
  setOrderType,
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
      <OrderTypeButton
        type="market"
        selected={orderType === 'market'}
        onClick={() => setOrderType('market')}
      />
      <OrderTypeButton
        type="limit"
        selected={orderType === 'limit'}
        onClick={() => setOrderType('limit')}
      />
    </Box>
  </Box>
);

export default OrderTypeSelector;