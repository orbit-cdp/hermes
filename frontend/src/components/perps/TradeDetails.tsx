import React from 'react';
import { Tooltip, IconButton, useMediaQuery, useTheme } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Section } from '../common/Section';
import { FlexBox } from '../common/FlexBox';
import { Text } from '../common/Text';

interface TradeDetailsProps {
  entryPrice: string;
  liquidationPrice: string;
  openFee: string;
  openFeePercentage: string;
  priceImpact: string;
  borrowRate: string;
  availableLiquidity: string;
}

const TradeDetails: React.FC<TradeDetailsProps> = ({
  entryPrice,
  liquidationPrice,
  openFee,
  openFeePercentage,
  priceImpact,
  borrowRate,
  availableLiquidity,
}) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  if (!isLargeScreen) return null;

  return (
    <Section backgroundColor={theme.palette.background.paper}>
      <FlexBox direction="column" gap={1}>
        <DetailRow label="Entry price" value={entryPrice} />
        <DetailRow label="Liquidation price" value={liquidationPrice} />
        <DetailRow label="Open fee" value={`${openFee} (${openFeePercentage})`} />
        <DetailRow label="Price impact" value={priceImpact} />
        <DetailRow label="Borrow rate" value={borrowRate} />
        <DetailRow label="Available liquidity" value={availableLiquidity} />
      </FlexBox>
    </Section>
  );
};

const DetailRow: React.FC<{ label: React.ReactNode; value: string }> = ({ label, value }) => (
  <FlexBox justifyContent="space-between" alignItems="center">
    {typeof label === 'string' ? (
      <Text variant="caption" color="textSecondary">
        {label}
      </Text>
    ) : (
      label
    )}
    <Text variant="caption" color="textPrimary">
      {value}
    </Text>
  </FlexBox>
);

export default TradeDetails;
