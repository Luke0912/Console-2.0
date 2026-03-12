import CryptoJS from 'crypto-js';
import config from '../config';

/**
 * Encrypts a string using AES-256
 * Used primarily for encrypting Instagram access tokens before storing in DB
 */
export const encrypt = (text: string): string => {
    if (!text) {
        throw new Error('Text to encrypt cannot be empty');
    }

    const encrypted = CryptoJS.AES.encrypt(text, config.encryption.key);
    return encrypted.toString();
};

/**
 * Decrypts an AES-256 encrypted string
 * Used to decrypt Instagram access tokens when making API calls
 */
export const decrypt = (encryptedText: string): string => {
    if (!encryptedText) {
        throw new Error('Encrypted text cannot be empty');
    }

    const bytes = CryptoJS.AES.decrypt(encryptedText, config.encryption.key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    if (!decrypted) {
        throw new Error('Decryption failed - invalid key or corrupted data');
    }

    return decrypted;
};
