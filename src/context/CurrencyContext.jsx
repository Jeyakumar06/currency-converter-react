import React, { createContext, useContext, useState, useEffect } from 'react';
import { currencyAPI } from '../services/api';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currencies, setCurrencies] = useState({});
  const [rates, setRates] = useState({});
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        console.log('🔄 Fetching currencies...');
        const response = await currencyAPI.getCurrencies();
        
        console.log('📊 API response type:', typeof response.data);
        console.log('📊 Is array:', Array.isArray(response.data));
        console.log('📊 Response keys:', Object.keys(response.data));
        console.log('📊 Sample data:', response.data[0] || response.data['0']);
        
        let currencyData = {};
        
        if (response.data) {
          // Handle CurrencyBeacon's numbered object format: {0: {...}, 1: {...}, 2: {...}}
          if (typeof response.data === 'object' && !Array.isArray(response.data)) {
            console.log('📋 Processing numbered object format...');
            
            // Convert numbered object to array using Object.values()
            const currencyArray = Object.values(response.data);
            console.log('📋 Converted to array, length:', currencyArray.length);
            
            currencyArray.forEach((currency, index) => {
              if (index < 3) { // Debug first 3 items
                console.log(`Currency ${index}:`, currency);
              }
              
              // Extract currency code and name
              const code = currency.short_code;
              const name = currency.name;
              
              if (code && name) {
                currencyData[code.toUpperCase()] = name;
                if (index < 5) {
                  console.log(`✅ Mapped: ${code} -> ${name}`);
                }
              } else {
                if (index < 3) {
                  console.log(`⚠️ Skipped currency ${index}: missing code or name`);
                }
              }
            });
          }
          // Handle regular array format (fallback)
          else if (Array.isArray(response.data)) {
            console.log('📋 Processing standard array format...');
            response.data.forEach((currency, index) => {
              const code = currency.short_code || currency.code;
              const name = currency.name;
              if (code && name) {
                currencyData[code.toUpperCase()] = name;
              }
            });
          }
        }
        
        console.log('🎯 Total currencies processed:', Object.keys(currencyData).length);
        console.log('🎯 Sample currencies:', Object.entries(currencyData).slice(0, 5));
        
        if (Object.keys(currencyData).length > 0) {
          setCurrencies(currencyData);
          setError(null);
          console.log('✅ Currencies successfully set!');
        } else {
          throw new Error('No currencies could be processed');
        }
        
      } catch (err) {
        console.error('❌ Currency fetch failed:', err);
        setError(`Currency loading failed: ${err.message}`);
        
        // Fallback currencies
        const fallbackCurrencies = {
          'USD': 'United States Dollar',
          'EUR': 'Euro',
          'GBP': 'British Pound Sterling',
          'JPY': 'Japanese Yen',
          'AUD': 'Australian Dollar',
          'CAD': 'Canadian Dollar',
          'CHF': 'Swiss Franc',
          'CNY': 'Chinese Yuan',
          'INR': 'Indian Rupee',
          'SGD': 'Singapore Dollar',
          'HKD': 'Hong Kong Dollar',
          'KRW': 'South Korean Won',
          'BRL': 'Brazilian Real',
          'MXN': 'Mexican Peso',
          'SEK': 'Swedish Krona',
          'NOK': 'Norwegian Krone',
          'DKK': 'Danish Krone',
          'PLN': 'Polish Zloty',
          'NZD': 'New Zealand Dollar',
          'ZAR': 'South African Rand'
        };
        
        setCurrencies(fallbackCurrencies);
        console.log('🆘 Using fallback currencies');
      }
    };

    fetchCurrencies();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      if (Object.keys(currencies).length === 0) {
        console.log('⏳ Waiting for currencies to load before fetching rates...');
        return;
      }

      try {
        console.log('💰 Fetching exchange rates for base:', baseCurrency);
        setLoading(true);
        setError(null);
        
        const response = await currencyAPI.getLatestRates(baseCurrency);
        
        console.log('💰 Rates response received:', response.data);
        
        if (response.data && response.data.rates) {
          const ratesCount = Object.keys(response.data.rates).length;
          console.log('✅ Exchange rates loaded:', ratesCount);
          
          setRates(response.data.rates);
          
          // Handle timestamp conversion
          if (response.data.timestamp) {
            setLastUpdated(new Date(response.data.timestamp * 1000));
          } else if (response.data.date) {
            setLastUpdated(new Date(response.data.date));
          } else {
            setLastUpdated(new Date());
          }
          
          console.log('✅ Rates successfully updated!');
        } else {
          throw new Error('Invalid exchange rates response format');
        }
      } catch (err) {
        console.error('❌ Rates fetch failed:', err);
        setError(`Exchange rates loading failed: ${err.message}`);
      } finally {
        setLoading(false);
        console.log('💰 Rates loading completed');
      }
    };

    fetchRates();
  }, [currencies, baseCurrency]);

  const refreshRates = async () => {
    console.log('🔄 Manual refresh initiated');
    setError(null);
    
    // Trigger re-fetch by temporarily changing base currency
    const currentBase = baseCurrency;
    setBaseCurrency('');
    setTimeout(() => {
      setBaseCurrency(currentBase);
    }, 100);
  };

  const contextValue = {
    currencies,
    rates,
    baseCurrency,
    setBaseCurrency,
    loading,
    error,
    lastUpdated,
    refreshRates
  };

  // Debug state changes
  useEffect(() => {
    console.log('📊 CONTEXT STATE UPDATED:', {
      currenciesCount: Object.keys(currencies).length,
      ratesCount: Object.keys(rates).length,
      baseCurrency,
      loading,
      hasError: !!error,
      timestamp: lastUpdated?.toLocaleTimeString()
    });
  }, [currencies, rates, baseCurrency, loading, error, lastUpdated]);

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};
