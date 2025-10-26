/**
 * Magic Link Authentication Service
 * 
 * Provides email-based authentication using Magic Link SDK
 * Replaces manual wallet creation with secure, passwordless login
 */

import { Magic } from '@magic-sdk/react-native-expo';
import { OAuthExtension } from '@magic-ext/react-native-expo-oauth';

// TODO: Replace with your Magic publishable API key from https://dashboard.magic.link/
const MAGIC_API_KEY = 'YOUR_MAGIC_PUBLISHABLE_API_KEY';

// Flow EVM Testnet configuration
const FLOW_EVM_TESTNET = {
  rpcUrl: 'https://testnet.evm.nodes.onflow.org',
  chainId: 545,
};

/**
 * Initialize Magic instance
 * - Configured for Flow EVM Testnet (Chain 545)
 * - Includes OAuth extension for social login
 */
export const magic = new Magic(MAGIC_API_KEY, {
  network: FLOW_EVM_TESTNET,
  extensions: [new OAuthExtension()],
});

/**
 * Authentication Methods
 */

/**
 * Login with email using OTP (One-Time Password)
 * Magic will send an OTP to the user's email
 * 
 * @param {string} email - User's email address
 * @param {boolean} showUI - Show Magic's built-in UI (default: true)
 * @returns {Promise<string>} DID token on success
 */
export const loginWithEmail = async (email, showUI = true) => {
  try {
    console.log('Logging in with email:', email);
    const didToken = await magic.auth.loginWithEmailOTP({ 
      email,
      showUI 
    });
    console.log('Login successful!');
    return didToken;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * Login with Google OAuth
 * Opens Google OAuth flow in popup
 * 
 * @param {string} redirectURI - URL to redirect after login
 * @returns {Promise<void>}
 */
export const loginWithGoogle = async (redirectURI = 'oruva://oauth-callback') => {
  try {
    console.log('Logging in with Google');
    await magic.oauth.loginWithPopup({
      provider: 'google',
      redirectURI,
    });
    console.log('Google login successful!');
  } catch (error) {
    console.error('Google login failed:', error);
    throw error;
  }
};

/**
 * Check if user is currently logged in
 * 
 * @returns {Promise<boolean>} True if logged in, false otherwise
 */
export const isLoggedIn = async () => {
  try {
    const loggedIn = await magic.user.isLoggedIn();
    console.log('User logged in:', loggedIn);
    return loggedIn;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

/**
 * Get current user information
 * Returns user email, wallet addresses, etc.
 * 
 * @returns {Promise<object>} User info object
 */
export const getUserInfo = async () => {
  try {
    const userInfo = await magic.user.getInfo();
    console.log('User info:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
};

/**
 * Get user's Ethereum address
 * Extracts the public address from user info
 * 
 * @returns {Promise<string>} Ethereum address
 */
export const getUserAddress = async () => {
  try {
    const userInfo = await getUserInfo();
    // Magic SDK v31+ returns wallets object
    if (userInfo.wallets && userInfo.wallets.ethereum) {
      return userInfo.wallets.ethereum.publicAddress;
    }
    // Fallback for older SDK versions
    return userInfo.publicAddress;
  } catch (error) {
    console.error('Error getting user address:', error);
    throw error;
  }
};

/**
 * Get DID token for backend authentication
 * Token has 15-minute lifespan by default
 * 
 * @param {number} lifespan - Token lifespan in seconds (default: 900)
 * @returns {Promise<string>} DID token
 */
export const getIdToken = async (lifespan = 900) => {
  try {
    const token = await magic.user.getIdToken({ lifespan });
    console.log('ID token generated');
    return token;
  } catch (error) {
    console.error('Error getting ID token:', error);
    throw error;
  }
};

/**
 * Logout current user
 * Clears Magic session
 * 
 * @returns {Promise<boolean>} True on successful logout
 */
export const logout = async () => {
  try {
    console.log('Logging out user');
    await magic.user.logout();
    console.log('Logout successful!');
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};

/**
 * Show Magic settings UI
 * Allows users to update email, enable MFA, add recovery methods
 * 
 * @param {string} page - Optional page to show ('mfa', 'update-email', 'recovery')
 * @returns {Promise<void>}
 */
export const showSettings = async (page = null) => {
  try {
    console.log('Showing settings');
    if (page) {
      await magic.user.showSettings({ page });
    } else {
      await magic.user.showSettings();
    }
  } catch (error) {
    console.error('Error showing settings:', error);
    throw error;
  }
};

/**
 * Show user's wallet address in QR code
 * Useful for receiving payments
 * 
 * @returns {Promise<void>}
 */
export const showAddress = async () => {
  try {
    console.log('Showing wallet address');
    await magic.wallet.showAddress();
  } catch (error) {
    console.error('Error showing address:', error);
    throw error;
  }
};

/**
 * Show wallet balances
 * Displays user's token balances
 * 
 * @returns {Promise<void>}
 */
export const showBalances = async () => {
  try {
    console.log('Showing balances');
    await magic.wallet.showBalances();
  } catch (error) {
    console.error('Error showing balances:', error);
    throw error;
  }
};

/**
 * Get Magic RPC provider for ethers.js
 * Use this to create ethers provider and signer
 * 
 * @returns {object} Magic RPC provider
 * @example
 * const provider = new ethers.providers.Web3Provider(getMagicProvider());
 * const signer = provider.getSigner();
 */
export const getMagicProvider = () => {
  return magic.rpcProvider;
};

export default {
  magic,
  loginWithEmail,
  loginWithGoogle,
  isLoggedIn,
  getUserInfo,
  getUserAddress,
  getIdToken,
  logout,
  showSettings,
  showAddress,
  showBalances,
  getMagicProvider,
};
