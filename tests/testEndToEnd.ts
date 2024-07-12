import axios from 'axios';

const API_URL = 'http://0.0.0.0:3000';
const API_KEY = 'your_hardcoded_api_key'; // Replace with the actual API key

const testEndToEndFlow = async () => {
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

    // Step 3: Confirm the Sale
    const confirmResponse = await axios.post(`${API_URL}/confirm`, {
      reference: reference,
      tx_hash: '0x123456',
      token_id_hash: 'b7d016666d769',
      recipient_address: '0xdd9AAE1C317eE6EFEb0F3DB0A068e9Ed952a6CEB',
      order: {
        contract_address: '0x999888',
        total_amount: 1,
        deadline: 1713864739,
        created_at: 1713863839302,
        currency: 'USDC',
        products: [
          {
            product_id: 1, // Adjust based on the actual product ID in your database
            detail: [
              {
                token_id: authorizeResponse.data.products[0].detail[0].token_id,
                amount: 9.90
              }
            ],
            quantity: 1,
            collection_address: '0x777888',
            collection_type: 'ERC721'
          }
        ]
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY
      }
    });

    console.log('Confirm Response:', confirmResponse.data);
  } catch (error: any) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
};

testEndToEndFlow();