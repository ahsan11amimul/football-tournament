import CryptoJS from 'crypto-js';

export const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY;
export const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT;
const privateKey = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY;

/**
 * IMPORTANT: This is a client-side authentication helper.
 * Storing the Private Key in the frontend is NOT SECURE for production.
 * However, for a practice/local project, this allows you to upload images directly.
 */
export const authenticator = async () => {
  try {
    const token = Math.random().toString(36).substring(7);
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 mins from now
    
    // Generate signature: HMAC-SHA1(token + expire, private_key)
    const signature = CryptoJS.HmacSHA1(token + expire, privateKey).toString();
    
    return { signature, expire, token };
  } catch (error) {
    console.error("ImageKit Auth Error:", error);
    throw new Error(`Authentication failed: ${error.message}`);
  }
};
