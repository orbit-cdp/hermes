import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Drawer,
  Divider,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Image from 'next/image';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LaunchIcon from '@mui/icons-material/Launch';
import LogoutIcon from '@mui/icons-material/Logout';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { TbFaceId, TbFingerprint } from 'react-icons/tb';
import { RootState, AppDispatch } from '../../store/store';
import {
  connectWallet,
  resetWallet,
  getWalletBalance,
  registerWallet,
  fundWallet,
} from '../../store/walletSlice';

const WalletBanner: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isConnected, contractId, balances } = useSelector((state: RootState) => state.wallet);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passkeyName, setPasskeyName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const coinIconPaths: { [key: string]: string } = {
    XLM: '/icons/tokens/xlm.svg',
    oUSD: '/icons/tokens/ousd.svg',
    SLP: '/icons/tokens/slp.svg',
  };

  const tokenList = [
    { name: 'XLM', balance: balances.native, icon: <AttachMoneyIcon /> },
    { name: 'oUSD', balance: balances.ousd, icon: <AttachMoneyIcon /> },
    { name: 'SLP', balance: balances.slp, icon: <AttachMoneyIcon /> },
  ];

  useEffect(() => {
    if (isConnected) {
      dispatch(getWalletBalance());
      setDialogOpen(false);
      setIsRegistering(false);
    }
  }, [isConnected, dispatch]);

  const handleConnect = useCallback(
    async (type: 'signin' | 'register') => {
      try {
        setLoading(true);
        if (type === 'register') {
          if (!passkeyName) {
            alert('Please enter a name for your passkey.');
            return;
          }
          await dispatch(registerWallet(passkeyName)).unwrap();
        } else {
          await dispatch(connectWallet({})).unwrap();
        }
        setDialogOpen(false);
        setIsRegistering(false);
      } catch (error) {
        console.error('Failed to connect:', error);
        alert('Failed to connect. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [passkeyName, dispatch]
  );

  const handleDisconnect = useCallback(async () => {
    try {
      dispatch(resetWallet());
      setDrawerOpen(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }, [dispatch]);

  const copyAddress = useCallback(() => {
    if (contractId) {
      navigator.clipboard.writeText(contractId);
      dispatch(getWalletBalance());
      // You might want to add a snackbar or toast notification here
    }
  }, [contractId]);

  const openExplorer = useCallback(() => {
    if (contractId) {
      window.open(`https://stellar.expert/explorer/testnet/contract/${contractId}`, '_blank');
    }
  }, [contractId]);

  const shortenAddress = useMemo(() => {
    return (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, []);

  const formatBalance = useMemo(() => {
    return (balanceStr: string) => {
      const balanceNum = parseFloat(balanceStr);
      return (balanceNum / 10_000_000).toFixed(2);
    };
  }, []);

  const calculateTotalOUSDValue = useMemo(() => {
    // This is a placeholder calculation. You'll need to implement the actual conversion logic.
    const xlmToOUSD = parseFloat(balances.native) * 0.1; // Assuming 1 XLM = 0.1 oUSD
    const slpToOUSD = parseFloat(balances.slp) * 0.5; // Assuming 1 SLP = 0.5 oUSD
    const totalOUSD = parseFloat(balances.ousd) + xlmToOUSD + slpToOUSD;
    return (totalOUSD / 10_000_000).toFixed(2);
  }, [balances]);

  return (
    <>
      <Button
        onClick={() => (isConnected ? setDrawerOpen(true) : setDialogOpen(true))}
        sx={{
          textTransform: 'none',
          display: 'flex',
          flexGrow: 1,
          color: 'white',
          bgcolor: '#283747',
          border: '1px solid rgba(217,217,217,0.1)',
          borderRadius: '9999px',
          py: 0,
          px: 2,
          '&:hover': {
            bgcolor: 'rgba(40, 55, 71, 0.8)',
          },
        }}
      >
        {isConnected ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {shortenAddress(contractId || '')}
              </Typography>
            </Box>
          </Box>
        ) : (
          'Connect Wallet'
        )}
      </Button>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 400,
            bgcolor: '#283747',
            color: 'white',
          },
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, bgcolor: '#283747' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                  {shortenAddress(contractId || '')}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
              ${calculateTotalOUSDValue}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Total Value in oUSD
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <IconButton
                onClick={copyAddress}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(40, 55, 71, 0.5)',
                  border: '1px solid rgba(217,217,217,0.1)',
                  '&:hover': { bgcolor: 'rgba(40, 55, 71, 0.8)' },
                }}
              >
                <ContentCopyIcon />
              </IconButton>
              <IconButton
                onClick={openExplorer}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(40, 55, 71, 0.5)',
                  border: '1px solid rgba(217,217,217,0.1)',
                  '&:hover': { bgcolor: 'rgba(40, 55, 71, 0.8)' },
                }}
              >
                <LaunchIcon />
              </IconButton>
              <IconButton
                onClick={handleDisconnect}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(40, 55, 71, 0.5)',
                  border: '1px solid rgba(217,217,217,0.1)',
                  '&:hover': { bgcolor: 'rgba(40, 55, 71, 0.8)' },
                }}
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
          <Divider sx={{ bgcolor: 'rgba(232,249,255,0.1)' }} />
          <Box sx={{ p: 2, bgcolor: '#304256', flexGrow: 1 }}>
            <Typography sx={{ color: 'rgba(255,255,255,0.5)', py: 2 }}>Your Tokens</Typography>
            <List>
              {tokenList.map((token) => (
                <ListItem key={token.name} sx={{ py: 1 }}>
                  <ListItemIcon>
                    <Image
                      src={coinIconPaths[token.name]}
                      alt={token.name}
                      width={24}
                      height={24}
                      style={{ borderRadius: '50%' }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={token.name}
                    secondary={formatBalance(token.balance)}
                    primaryTypographyProps={{ color: 'white' }}
                    secondaryTypographyProps={{ color: 'rgba(255,255,255,0.7)' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </Drawer>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setIsRegistering(false);
        }}
        PaperProps={{
          style: {
            backgroundColor: '#1C2635',
            borderRadius: '16px',
            maxWidth: '400px',
            width: '100%',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            paddingTop: '2rem',
          }}
        >
          {isRegistering ? 'Register Wallet' : 'Connect Wallet'}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              padding: '1rem',
            }}
          >
            {isRegistering && (
              <TextField
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder="Enter passkey name"
                variant="outlined"
                fullWidth
                sx={{
                  backgroundColor: '#242D3D',
                  borderRadius: '12px',
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'transparent',
                    },
                    '&:hover fieldset': {
                      borderColor: 'transparent',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'transparent',
                    },
                  },
                }}
              />
            )}
            <Button
              onClick={() => {
                if (isRegistering) {
                  handleConnect('register');
                } else {
                  setIsRegistering(true);
                }
              }}
              disabled={loading}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#3772FF',
                color: 'white',
                textTransform: 'none',
                borderRadius: '12px',
                padding: '0.75rem',
                '&:hover': {
                  backgroundColor: '#2860E1',
                },
              }}
            >
              {loading ? (
                'Loading...'
              ) : (
                <>
                  <TbFaceId size={24} /> {isRegistering ? 'Register' : 'New Wallet'}{' '}
                  <TbFingerprint size={24} />
                </>
              )}
            </Button>
            <Button
              onClick={() => handleConnect('signin')}
              disabled={loading}
              sx={{
                backgroundColor: '#242D3D',
                color: 'white',
                textTransform: 'none',
                borderRadius: '12px',
                padding: '0.75rem',
                '&:hover': {
                  backgroundColor: '#1A2231',
                },
              }}
            >
              {loading ? 'Loading...' : 'Sign In'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletBanner;
