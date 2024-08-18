import { Inter } from '@next/font/google';
import { useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, store } from '../store/store';
import theme from '../theme';
import DefaultLayout from '../layouts/DefaultLayout';
import { SettingsProvider } from '../contexts';
import { WalletProvider } from '../contexts/wallet';
import { startPeriodicRefresh } from '../store/perpsSlice';
import { startPeriodicPositionRefresh } from '../store/positionsSlice';
import { fundWallet } from '../store/walletSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AppContent({ Component, pageProps }: AppProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isConnected, contractId } = useSelector((state: RootState) => state.wallet);

  useEffect(() => {
    const stopRefreshThunk = startPeriodicRefresh();
    const stopRefresh = dispatch(stopRefreshThunk);
    let stopPositionRefresh: (() => void) | undefined;

    if (isConnected && contractId) {
      stopPositionRefresh = dispatch(startPeriodicPositionRefresh(contractId));
    }

    return () => {
      if (typeof stopRefresh === 'function') {
        stopRefresh();
      }
      if (stopPositionRefresh) {
        stopPositionRefresh();
      }
    };
  }, [dispatch, isConnected, contractId]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // You can add any additional logic here that you want to run on route changes
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  return (
    <ThemeProvider theme={theme}>
      <SettingsProvider>
          <CssBaseline />
          <DefaultLayout>
            <Component {...pageProps} />
          </DefaultLayout>
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default function MyApp(props: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Provider store={store}>
        <AppContent {...props} />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Provider>
    </>
  );
}
