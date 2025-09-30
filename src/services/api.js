import axios from 'axios';

const API_KEY = import.meta.env.VITE_BEACON_KEY;
const BASE_URL = 'https://api.currencybeacon.com/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  params: {
    api_key: API_KEY
  }
});

// Add response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response successful:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export const currencyAPI = {
  // Get all available currencies
  getCurrencies: async () => {
    try {
      return await apiClient.get('/currencies');
    } catch (error) {
      console.error('getCurrencies error:', error);
      throw error;
    }
  },
  
  // Get latest exchange rates
  getLatestRates: async (base = 'USD') => {
    try {
      return await apiClient.get('/latest', { params: { base } });
    } catch (error) {
      console.error('getLatestRates error:', error);
      throw error;
    }
  },
  
  // Convert specific amount between currencies
  convertCurrency: async (from, to, amount) => {
    try {
      console.log('Making convert request:', { from, to, amount });
      return await apiClient.get('/convert', { 
        params: { from, to, amount } 
      });
    } catch (error) {
      console.error('convertCurrency error:', error);
      throw error;
    }
  },
  
  // Get historical rates (if needed)
  getHistoricalRates: async (date, base = 'USD') => {
    try {
      return await apiClient.get('/historical', { params: { date, base } });
    } catch (error) {
      console.error('getHistoricalRates error:', error);
      throw error;
    }
  }
};

export default currencyAPI;
