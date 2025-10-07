import CryptoJS from 'crypto-js';

// Generate encryption key from user's session
// In production, this should be derived from user's password or a secure key
export const getEncryptionKey = (userId: string): string => {
  // Using userId as base for key - in production use proper key derivation
  return CryptoJS.SHA256(userId).toString();
};

export const encryptPassword = (password: string, key: string): string => {
  return CryptoJS.AES.encrypt(password, key).toString();
};

export const decryptPassword = (encryptedPassword: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};
