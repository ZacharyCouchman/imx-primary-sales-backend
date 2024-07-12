import axios from 'axios';

const API_URL = 'http://0.0.0.0:3000';
const API_KEY = 'your_hardcoded_api_key'; // Replace with the actual API key

const testExpireFlow = async () => {
  try {
    // Step 1: Get Quote
    const quoteResponse = await axios.post(`${API_URL}/quote`, {
      recipient_address: '0xdd9AAE1C317eE6EFEb0F3DB0A068e9Ed952a6CEB',
      products: [
        {
          product_id: 1, // Adjust based on the actual product ID in your database
          quantity: 1
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY
      }
    });

    console.log('Quote Response:', quoteResponse.data);

    // Step 2: Request Authorization
    const authorizeResponse = await axios.post(`${API_URL}/authorize`, {
      recipient_address: '0xdd9AAE1C317eE6EFEb0F3DB0A068e9Ed952a6CEB',
      currency: 'USDC',
      products: [
        {
          product_id: 1, // Adjust based on the actual product ID in your database
          quantity: 1
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY
      }
    });

    console.log('Authorize Response:', authorizeResponse.data);

    const reference = authorizeResponse.data.reference;

    // Step 3: Trigger Expiry
    const expireResponse = await axios.post(`${API_URL}/expire`, {
      reference: reference
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY
      }
    });

    console.log('Expire Response:', expireResponse.data);
  } catch (error: any) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

testExpireFlow();