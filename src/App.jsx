import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { CurrencyProvider } from './context/CurrencyContext';
import CurrencyConverter from './components/CurrencyConverter';
import ExchangeRatesTable from './components/ExchangeRatesTable';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#fafafa',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CurrencyProvider>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              fontWeight={700}
              color="primary"
            >
              Currency Exchange
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto' }}
            >
              Get real-time exchange rates and convert currencies instantly with our 
              professional currency converter tool.
            </Typography>
          </Box>

          {/* Currency Converter Section */}
          <CurrencyConverter />

          {/* Exchange Rates Table Section */}
          <ExchangeRatesTable />

          {/* Footer */}
          <Box sx={{ textAlign: 'center', mt: 4, py: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Exchange rates provided by CurrencyBeacon API
            </Typography>
          </Box>
        </Container>
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;
