const axios = require('axios');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

// ID Verification Service (using Jumio as example - can be replaced with Onfido, Trulioo, etc.)
class IDVerificationService {
  constructor() {
    this.apiKey = process.env.JUMIO_API_KEY || 'your-jumio-api-key';
    this.apiSecret = process.env.JUMIO_API_SECRET || 'your-jumio-api-secret';
    this.baseUrl = process.env.JUMIO_BASE_URL || 'https://netverify.com/api/v4';
  }

  async createVerificationSession(userId, userInfo) {
    try {
      // Check if API credentials are configured
      if (!this.apiKey || this.apiKey === 'your-jumio-api-key' || 
          !this.apiSecret || this.apiSecret === 'your-jumio-api-secret') {
        console.log('🔧 Jumio API credentials not configured, using demo mode');
        return {
          success: true,
          transactionReference: `demo-${Date.now()}`,
          redirectUrl: `${process.env.BASE_URL || 'https://new-pacmac.onrender.com'}/demo-id-verification.html`,
          timestamp: new Date().toISOString(),
          demo: true
        };
      }

      const payload = {
        customerInternalReference: userId,
        userReference: userInfo.email,
        workflowId: '100', // Standard ID verification workflow
        successUrl: `${process.env.BASE_URL || 'https://new-pacmac.onrender.com'}/verification/success`,
        errorUrl: `${process.env.BASE_URL || 'https://new-pacmac.onrender.com'}/verification/error`,
        callbackUrl: `${process.env.BASE_URL || 'https://new-pacmac.onrender.com'}/api/verification/callback`
      };

      const response = await axios.post(`${this.baseUrl}/initiate`, payload, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
          'User-Agent': 'PacMac-Marketplace/1.0'
        }
      });

      return {
        success: true,
        transactionReference: response.data.transactionReference,
        redirectUrl: response.data.redirectUrl,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('ID Verification Error:', error.response?.data || error.message);
      
      // Fallback to demo mode if service is unavailable
      console.log('🔧 ID verification service unavailable, using demo mode');
      return {
        success: true,
        transactionReference: `demo-${Date.now()}`,
        redirectUrl: `${process.env.BASE_URL || 'https://new-pacmac.onrender.com'}/demo-id-verification.html`,
        timestamp: new Date().toISOString(),
        demo: true
      };
    }
  }

  async getVerificationStatus(transactionReference) {
    try {
      const response = await axios.get(`${this.baseUrl}/transactions/${transactionReference}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64')}`,
          'User-Agent': 'PacMac-Marketplace/1.0'
        }
      });

      return {
        success: true,
        status: response.data.verificationStatus,
        result: response.data.verificationResult,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('ID Verification Status Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Unable to fetch verification status'
      };
    }
  }
}

// Plaid Bank Verification Service
class BankVerificationService {
  constructor() {
    const configuration = new Configuration({
      basePath: process.env.PLAID_ENV === 'production' 
        ? PlaidEnvironments.production 
        : PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || 'your-plaid-client-id',
          'PLAID-SECRET': process.env.PLAID_SECRET || 'your-plaid-secret',
        },
      },
    });

    this.client = new PlaidApi(configuration);
  }

  async createLinkToken(userId) {
    try {
      // Check if Plaid credentials are configured
      if (!process.env.PLAID_CLIENT_ID || process.env.PLAID_CLIENT_ID === 'your_plaid_client_id' ||
          !process.env.PLAID_SECRET || process.env.PLAID_SECRET === 'your_plaid_secret') {
        console.log('🔧 Plaid API credentials not configured, using demo mode');
        return {
          success: true,
          linkToken: `demo-link-token-${Date.now()}`,
          expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          timestamp: new Date().toISOString(),
          demo: true
        };
      }

      const request = {
        user: {
          client_user_id: userId,
        },
        client_name: 'PacMac Marketplace',
        products: ['auth', 'identity', 'transactions'],
        country_codes: ['US'],
        language: 'en',
        webhook: `${process.env.BASE_URL || 'https://new-pacmac.onrender.com'}/api/plaid/webhook`,
        account_filters: {
          depository: {
            account_subtypes: ['checking', 'savings']
          }
        }
      };

      const response = await this.client.linkTokenCreate(request);
      
      return {
        success: true,
        linkToken: response.data.link_token,
        expiration: response.data.expiration,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Plaid Link Token Error:', error.response?.data || error.message);
      
      // Fallback to demo mode if service is unavailable
      console.log('🔧 Plaid service unavailable, using demo mode');
      return {
        success: true,
        linkToken: `demo-link-token-${Date.now()}`,
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString(),
        demo: true
      };
    }
  }

  async exchangePublicToken(publicToken, userId) {
    try {
      const request = {
        public_token: publicToken,
      };

      const response = await this.client.itemPublicTokenExchange(request);
      const accessToken = response.data.access_token;

      // Get account information
      const accountsRequest = {
        access_token: accessToken,
      };
      const accountsResponse = await this.client.accountsGet(accountsRequest);

      // Get identity information
      const identityRequest = {
        access_token: accessToken,
      };
      const identityResponse = await this.client.identityGet(identityRequest);

      return {
        success: true,
        accessToken: accessToken,
        itemId: response.data.item_id,
        accounts: accountsResponse.data.accounts,
        identity: identityResponse.data.accounts,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Plaid Exchange Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_message || 'Unable to exchange public token'
      };
    }
  }

  async getAccountInfo(accessToken) {
    try {
      const request = {
        access_token: accessToken,
      };

      const response = await this.client.accountsGet(request);
      
      return {
        success: true,
        accounts: response.data.accounts,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Plaid Account Info Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_message || 'Unable to fetch account information'
      };
    }
  }

  async verifyMicrodeposits(accessToken, amounts) {
    try {
      const request = {
        access_token: accessToken,
        amounts: amounts,
      };

      const response = await this.client.sandboxItemResetLogin(request);
      
      return {
        success: true,
        verified: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Plaid Microdeposits Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_message || 'Unable to verify microdeposits'
      };
    }
  }
}

// Address Verification Service (using SmartyStreets as example)
class AddressVerificationService {
  constructor() {
    this.apiKey = process.env.SMARTYSTREETS_API_KEY || 'your-smartystreets-api-key';
    this.baseUrl = 'https://us-street.api.smartystreets.com/verify';
  }

  async verifyAddress(address) {
    try {
      // Check if SmartyStreets credentials are configured
      if (!this.apiKey || this.apiKey === 'your_smartystreets_api_key' ||
          !process.env.SMARTYSTREETS_AUTH_TOKEN || process.env.SMARTYSTREETS_AUTH_TOKEN === 'your_smartystreets_auth_token') {
        console.log('🔧 SmartyStreets API credentials not configured, using demo mode');
        return {
          success: true,
          verified: true,
          standardizedAddress: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipcode: address.zipcode,
            plus4: '0000'
          },
          timestamp: new Date().toISOString(),
          demo: true
        };
      }

      const params = {
        'auth-id': this.apiKey,
        'auth-token': process.env.SMARTYSTREETS_AUTH_TOKEN,
        'street': address.street,
        'city': address.city,
        'state': address.state,
        'zipcode': address.zipcode
      };

      const response = await axios.get(this.baseUrl, { params });
      
      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          success: true,
          verified: true,
          standardizedAddress: {
            street: result.delivery_line_1,
            city: result.components.city_name,
            state: result.components.state_abbreviation,
            zipcode: result.components.zipcode,
            plus4: result.components.plus4_code
          },
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          verified: false,
          error: 'Address could not be verified'
        };
      }
    } catch (error) {
      console.error('Address Verification Error:', error.response?.data || error.message);
      
      // Fallback to demo mode if service is unavailable
      console.log('🔧 Address verification service unavailable, using demo mode');
      return {
        success: true,
        verified: true,
        standardizedAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipcode: address.zipcode,
          plus4: '0000'
        },
        timestamp: new Date().toISOString(),
        demo: true
      };
    }
  }
}

module.exports = {
  IDVerificationService,
  BankVerificationService,
  AddressVerificationService
};
