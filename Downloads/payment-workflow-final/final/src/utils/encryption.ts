// Payment data encryption utilities
// Note: In production, use proper key management and encryption algorithms

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-encryption-key-here';
const ALGORITHM = 'AES-GCM';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag?: string;
}

// Convert string to ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to string
function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

// Convert ArrayBuffer to base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate a random IV
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // 96 bits for GCM
}

// Import key from string
async function importKey(keyString: string): Promise<CryptoKey> {
  const keyData = stringToArrayBuffer(keyString);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export const encryptionUtils = {
  // Encrypt sensitive payment data
  async encrypt(data: string): Promise<EncryptedData> {
    try {
      const key = await importKey(ENCRYPTION_KEY);
      const iv = generateIV();
      const encodedData = stringToArrayBuffer(data);

      const encrypted = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv: iv },
        key,
        encodedData
      );

      // For AES-GCM, the auth tag is included in the encrypted data
      return {
        encrypted: arrayBufferToBase64(encrypted),
        iv: arrayBufferToBase64(iv.buffer),
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  },

  // Decrypt sensitive payment data
  async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      const key = await importKey(ENCRYPTION_KEY);
      const encrypted = base64ToArrayBuffer(encryptedData.encrypted);
      const iv = base64ToArrayBuffer(encryptedData.iv);

      const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv: iv },
        key,
        encrypted
      );

      return arrayBufferToString(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  },

  // Encrypt payment card data
  async encryptCardData(cardData: {
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    holderName: string;
  }): Promise<EncryptedData> {
    const dataString = JSON.stringify(cardData);
    return this.encrypt(dataString);
  },

  // Decrypt payment card data
  async decryptCardData(encryptedData: EncryptedData): Promise<{
    number: string;
    expiryMonth: string;
    expiryYear: string;
    cvv: string;
    holderName: string;
  }> {
    const decryptedString = await this.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  },

  // Encrypt bank account data
  async encryptBankData(bankData: {
    accountNumber: string;
    routingNumber?: string;
    bankName: string;
    accountHolder: string;
  }): Promise<EncryptedData> {
    const dataString = JSON.stringify(bankData);
    return this.encrypt(dataString);
  },

  // Decrypt bank account data
  async decryptBankData(encryptedData: EncryptedData): Promise<{
    accountNumber: string;
    routingNumber?: string;
    bankName: string;
    accountHolder: string;
  }> {
    const decryptedString = await this.decrypt(encryptedData);
    return JSON.parse(decryptedString);
  },

  // Hash sensitive data (one-way - for comparison only)
  async hashData(data: string): Promise<string> {
    const encodedData = stringToArrayBuffer(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
    return arrayBufferToBase64(hashBuffer);
  },

  // Mask sensitive data for display
  maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 4) return cardNumber;
    const lastFour = cardNumber.slice(-4);
    const masked = '•'.repeat(cardNumber.length - 4);
    return masked + lastFour;
  },

  maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length < 4) return accountNumber;
    const lastFour = accountNumber.slice(-4);
    const masked = '•'.repeat(accountNumber.length - 4);
    return masked + lastFour;
  },
};

// Secure storage utilities
export const secureStorage = {
  // Store encrypted data
  async setEncryptedItem(key: string, data: any): Promise<void> {
    try {
      const dataString = JSON.stringify(data);
      const encrypted = await encryptionUtils.encrypt(dataString);
      localStorage.setItem(`encrypted_${key}`, JSON.stringify(encrypted));
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      throw error;
    }
  },

  // Retrieve and decrypt data
  async getEncryptedItem(key: string): Promise<any | null> {
    try {
      const encryptedString = localStorage.getItem(`encrypted_${key}`);
      if (!encryptedString) return null;

      const encrypted: EncryptedData = JSON.parse(encryptedString);
      const decryptedString = await encryptionUtils.decrypt(encrypted);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Failed to retrieve encrypted data:', error);
      return null;
    }
  },

  // Remove encrypted data
  removeEncryptedItem(key: string): void {
    localStorage.removeItem(`encrypted_${key}`);
  },
};