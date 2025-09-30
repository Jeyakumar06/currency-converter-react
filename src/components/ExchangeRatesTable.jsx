import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
  Box,
  Avatar,
  TableSortLabel,
  Chip,
  IconButton,
  Skeleton
} from '@mui/material';
import { Refresh, Search } from '@mui/icons-material';
import { useCurrency } from '../context/CurrencyContext';

const ExchangeRatesTable = () => {
  const { 
    currencies, 
    rates, 
    baseCurrency, 
    loading, 
    error, 
    lastUpdated, 
    refreshRates 
  } = useCurrency();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('currency');
  const [sortDirection, setSortDirection] = useState('asc');

  const getCurrencyFlag = (currencyCode) => {
    const countryCode = currencyCode.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/24x18/${countryCode}.png`;
  };

  // Filter and sort currencies
  const filteredAndSortedCurrencies = useMemo(() => {
    let filteredCurrencies = Object.entries(rates).filter(([code, rate]) => {
      const currencyName = currencies[code] || code;
      return (
        code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currencyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Sort currencies
    filteredCurrencies.sort(([codeA, rateA], [codeB, rateB]) => {
      let valueA, valueB;
      
      if (sortBy === 'currency') {
        valueA = codeA;
        valueB = codeB;
      } else {
        valueA = rateA;
        valueB = rateB;
      }

      if (sortDirection === 'asc') {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    return filteredCurrencies;
  }, [rates, currencies, searchQuery, sortBy, sortDirection]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const formatRate = (rate) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    }).format(rate);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(timestamp);
  };

  if (loading) {
    return (
      <Card sx={{ maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 2 }} />
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" width="100%" height={53} sx={{ mb: 1 }} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', boxShadow: 3, borderRadius: 2 }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2" fontWeight={600}>
            Exchange Rates
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip 
              label={`Base: ${baseCurrency}`} 
              color="primary" 
              variant="outlined"
              size="small"
            />
            <IconButton onClick={refreshRates} disabled={loading}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {/* Search */}
        <TextField
          fullWidth
          placeholder="Search currencies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ mb: 3 }}
        />

        {/* Last Updated */}
        {lastUpdated && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Last updated: {formatTimestamp(lastUpdated)}
          </Typography>
        )}

        {/* Error State */}
        {error && (
          <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.50' }}>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'currency'}
                    direction={sortBy === 'currency' ? sortDirection : 'asc'}
                    onClick={() => handleSort('currency')}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Currency
                    </Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortBy === 'rate'}
                    direction={sortBy === 'rate' ? sortDirection : 'asc'}
                    onClick={() => handleSort('rate')}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Rate (per {baseCurrency})
                    </Typography>
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedCurrencies.map(([currencyCode, rate]) => (
                <TableRow 
                  key={currencyCode}
                  hover
                  sx={{ '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={getCurrencyFlag(currencyCode)}
                        sx={{ width: 24, height: 18 }}
                        variant="rounded"
                      />
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {currencyCode}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {currencies[currencyCode] || 'Unknown Currency'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight={500}>
                      {formatRate(rate)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredAndSortedCurrencies.length === 0 && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No currencies found matching your search.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeRatesTable;
