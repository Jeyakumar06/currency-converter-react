import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  IconButton,
  Grid,
  Avatar,
  Skeleton,
  Alert
} from '@mui/material';
import { SwapHoriz, Refresh } from '@mui/icons-material';
import { currencyAPI } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';

const CurrencyConverter = () => {
  const { currencies, loading: contextLoading, error: contextError } = useCurrency();
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amount, setAmount] = useState('1000');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [converting, setConverting] = useState(false);
  const [conversionError, setConversionError] = useState(null);

  // Debug the currencies data
  useEffect(() => {
    console.log('💱 Converter - Currencies available:', Object.keys(currencies).length);
    console.log('💱 Context loading:', contextLoading);
  }, [currencies, contextLoading]);

  // Debounced conversion
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (amount && parseFloat(amount) > 0 && fromCurrency && toCurrency && !contextLoading) {
        convertCurrency();
      } else {
        setConvertedAmount('');
      }
    }, 500); // Increased delay to 500ms

    return () => clearTimeout(timeoutId);
  }, [amount, fromCurrency, toCurrency, contextLoading]);

  const convertCurrency = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    setConverting(true);
    setConversionError(null);
    
    try {
      console.log('🔄 Converting:', parseFloat(amount), fromCurrency, '→', toCurrency);
      
      const response = await currencyAPI.convertCurrency(
        fromCurrency, 
        toCurrency, 
        parseFloat(amount)
      );
      
      console.log('✅ Conversion response:', response.data);
      
      // Handle CurrencyBeacon response format
      if (response.data) {
        // Look for the conversion result in different possible fields
        const result = response.data.value || response.data.result || response.data.amount;
        
        if (result !== undefined && result !== null) {
          setConvertedAmount(result.toFixed(2));
          console.log('✅ Converted amount set:', result.toFixed(2));
        } else {
          throw new Error('No conversion result in API response');
        }
      } else {
        throw new Error('Empty API response');
      }
    } catch (err) {
      console.error('❌ Conversion error:', err);
      setConversionError(err.message);
      setConvertedAmount('');
    } finally {
      setConverting(false);
    }
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setConversionError(null);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Allow numbers and decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (conversionError) {
        setConversionError(null);
      }
    }
  };

  const formatAmount = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(num);
  };

  const getCurrencyFlag = (currencyCode) => {
    const countryCode = currencyCode.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/24x18/${countryCode}.png`;
  };

  // Show loading only when currencies are still loading
  if (contextLoading && Object.keys(currencies).length === 0) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Skeleton variant="rectangular" width="45%" height={56} />
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="rectangular" width="45%" height={56} />
          </Box>
          <Skeleton variant="rectangular" width="100%" height={60} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ 
      maxWidth: 800, 
      mx: 'auto', 
      mb: 4, 
      boxShadow: 3,
      borderRadius: 2 
    }}>
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" fontWeight={600}>
            Currency Converter
          </Typography>
          <IconButton onClick={convertCurrency} disabled={converting}>
            <Refresh />
          </IconButton>
        </Box>
        
        {contextError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {contextError}
          </Alert>
        )}

        {conversionError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {conversionError}
          </Alert>
        )}

        <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
          {/* Amount Input */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              InputProps={{
                style: { fontSize: '1.2rem', fontWeight: '500' }
              }}
            />
          </Grid>

          {/* From Currency */}
          <Grid item xs={5} md={3}>
            <FormControl fullWidth>
              <InputLabel>From</InputLabel>
              <Select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                label="From"
              >
                {Object.entries(currencies).map(([code, name]) => (
                  <MenuItem key={code} value={code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={getCurrencyFlag(code)}
                        sx={{ width: 20, height: 15 }}
                        variant="rounded"
                      />
                      <Typography variant="body2">
                        {code}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Swap Button */}
          <Grid item xs={2} md={1} sx={{ textAlign: 'center' }}>
            <IconButton
              onClick={handleSwapCurrencies}
              sx={{
                backgroundColor: 'primary.light',
                '&:hover': { backgroundColor: 'primary.main', color: 'white' }
              }}
            >
              <SwapHoriz />
            </IconButton>
          </Grid>

          {/* To Currency */}
          <Grid item xs={5} md={3}>
            <FormControl fullWidth>
              <InputLabel>To</InputLabel>
              <Select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                label="To"
              >
                {Object.entries(currencies).map(([code, name]) => (
                  <MenuItem key={code} value={code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={getCurrencyFlag(code)}
                        sx={{ width: 20, height: 15 }}
                        variant="rounded"
                      />
                      <Typography variant="body2">
                        {code}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Conversion Result */}
        <Box
          sx={{
            backgroundColor: 'grey.50',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            border: '2px solid',
            borderColor: converting ? 'warning.light' : convertedAmount ? 'success.light' : 'grey.300'
          }}
        >
          {converting ? (
            <Typography variant="h6" color="warning.main">
              Converting...
            </Typography>
          ) : convertedAmount ? (
            <Box>
              <Typography variant="h4" component="div" fontWeight={600} color="primary">
                {formatAmount(convertedAmount)} {toCurrency}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {formatAmount(amount)} {fromCurrency} =
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" color="text.secondary">
              Enter an amount to convert
            </Typography>
          )}
        </Box>

        {/* Debug Info */}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
          Currencies loaded: {Object.keys(currencies).length} | 
          Context loading: {contextLoading ? 'Yes' : 'No'}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
