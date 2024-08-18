import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, Typography } from '@mui/material';
import Image from 'next/image';
import TradingOverview from './TradingOverview';
import PerpetualTradingHeader from './PerpetualTradingHeader';
import theme from '../../theme';
import styles from './TradingViewChart.module.css';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradingViewChartProps {
  symbol: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.innerHTML = `
        {
          "custom_css_url": "https://static.jup.ag/tv/css/tradingview.css"
        }`;
      script.onload = () => initTradingViewWidget();
      document.body.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  useEffect(() => {
    if (window.TradingView) {
      initTradingViewWidget();
    }
  }, [symbol]);

  const initTradingViewWidget = () => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      setTimeout(() => {
        new window.TradingView.widget({
          width: '100%',
          height: 'auto',
          symbol: `COINBASE:${symbol}`,
          interval: 'D',
          timezone: 'Etc/UTC',
          custom_css_url: 'https://static.jup.ag/tv/css/tradingview.css',
          overrides: {
            'paneProperties.background': 'rgb(24, 28, 36)',
            'paneProperties.backgroundType': 'solid',
            'mainSeriesProperties.candleStyle.upColor': 'rgb(30, 200, 96)',
            'mainSeriesProperties.candleStyle.downColor': 'rgb(228, 75, 83)',
            'mainSeriesProperties.candleStyle.borderUpColor': 'rgb(30, 200, 96)',
            'mainSeriesProperties.candleStyle.drawWick': true,
          },
          details: false,
          locale: 'en',
          theme: 'dark',
          enable_publishing: false,
          container_id: 'tradingview_chart_container',
        });
      }, 100); // Short delay to ensure widget is ready
    }
  };

  return (
    <div
      id="tradingview_chart_container"
      style={{ width: '100%', height: '50vh', display: 'flex' }}
      ref={containerRef}
    />
  );
};

export default TradingViewChart;
