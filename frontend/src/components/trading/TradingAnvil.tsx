import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MoneyTreeIcon from '../icons/MoneyTreeIcon';
import PerpetualIcon from '../icons/PerpetualIcon';

interface TradingLinkProps {
  href: string;
  title: string;
  subtitle: string;
  badge?: string;
}

const TradingLink: React.FC<TradingLinkProps> = ({ href, title, subtitle, badge }) => {
  const theme = useTheme();
  const router = useRouter();
  const active = href === '/' + router.pathname.split('/')[1];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(href, undefined, { shallow: true });
  };

  const IconComponent = href === '/perps' ? PerpetualIcon : MoneyTreeIcon;

  return (
    <Link href={href} passHref legacyBehavior>
      <Box
        component="a"
        onClick={handleClick}
        sx={{
          py: 3,
          px: 1.5,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          position: 'relative',
          color: active ? theme.palette.primary.main : 'white',
          textDecoration: 'none',
          '&:hover': {
            color: theme.palette.primary.light,
          },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: badge ? 0 : 0.75 }}>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                fontWeight: 600,
                lineHeight: 1,
              }}
            >
              {title}
            </Typography>
            {badge && (
              <Typography
                component="span"
                sx={{
                  ml: 2.5,
                  py: 1,
                  px: 1.5,
                  bgcolor: theme.palette.primary.main,
                  color: '#384E16',
                  fontSize: 11,
                  fontWeight: 1000,
                  lineHeight: 1,
                  borderRadius: '4px',
                }}
              >
                {badge}
              </Typography>
            )}
          </Box>
          <Typography
            variant="body2"
            sx={{
              fontSize: 11,
              fontWeight: 400,
              lineHeight: 1,
              letterSpacing: '0.1px',
              opacity: active ? 1 : 0.5,
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        {active && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 1,
              left: 0,
              right: 0,
              borderBottom: '2px solid #C7F284',
            }}
          />
        )}
      </Box>
    </Link>
  );
};

const TradingAnvil: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center', gap: 4 }}>
      <TradingLink href="/perps" title="Perpetual Trading" subtitle="Gamble and trade" />
      <TradingLink href="/perps-earn" title="Earn" subtitle="Supply and earn" />
    </Box>
  );
};

export default TradingAnvil;
