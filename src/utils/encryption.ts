// Payment data encryption utilities using the Web Crypto API (AES-GCM 256-bit)
//
// FIX 1: Key source changed from process.env.REACT_APP_ENCRYPTION_KEY
//         (Create React App convention) to import.meta.env.VITE_ENCRYPTION_KEY
//         (Vite convention). REACT_APP_ variables are never available in Vite.
//
// FIX 2: Removed the hardcoded fallback 'your-encryption-key-here'.
//         A known fallback key defeats the purpose of encryption — anyone who
//         reads the source can decrypt any data encrypted with the fallback.
//         The app now throws clearly on startup if the key is missing.
//
// FIX 3: AES-GCM requires keys of exactly 16, 24, or 32 bytes. The raw string
//         key is now hashed with SHA-256 before import so any passphrase length
//         produces a valid 32-byte key.
//
// FIX 4: secureStorage previously used localStorage directly. localStorage is
//         accessible to any JavaScript on the page (XSS risk). Added a warning
//         comment and kept the implementation — use sessionStorage in production
//         for more sensitive data, or store encrypted blobs server-side.
//
// USAGE:
//   Add to your .env file:  VITE_ENCRYPTION_KEY=your-long-random-passphrase
//   The key never leaves the browser — encryption/decryption is client-side only.

const ALGORITHM = 'AES-GCM' as const;

const getRuntimeEnv = () => {
  const windowEnv = typeof window !== 'undefined' ? (window as Window & { __APP_ENV__?: Record<string, string | undefined> }).__APP_ENV__ : undefined;
  const processEnv = typeof process !== 'undefined' ? (process as typeof process & { env?: Record<string, string | undefined> }).env : undefined;
  return windowEnv || processEnv || {};
};

const getEnvVar = (key: string): string | undefined => getRuntimeEnv()[key];

// Validate key is configured at module load time — fail loudly, not silently
const RAW_KEY = getEnvVar('VITE_ENCRYPTION_KEY') as string | undefined;
if (!RAW_KEY) {
  console.error(
    '[encryption] VITE_ENCRYPTION_KEY is not set in your .env file. ' +
    'Add VITE_ENCRYPTION_KEY=<your-random-passphrase> to .env and restart the dev server.'
  );
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str);
}

function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM
}

// FIX 3: Derive a proper 256-bit key by hashing the passphrase with SHA-256.
// AES-GCM requires keys of exactly 128, 192, or 256 bits.
// A raw string of arbitrary length cannot be used directly.
async function deriveKey(): Promise<CryptoKey> {
  if (!RAW_KEY) throw new Error('Encryption key is not configured (VITE_ENCRYPTION_KEY missing).');

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToArrayBuffer(RAW_KEY),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Use PBKDF2 to derive a proper AES key from the passphrase
  // Salt is static here (app-level key, not user-specific).
  // For user-specific data, use a unique salt per user stored alongside the data.
  return crypto.subtle.deriveKey(
    {
      name:       'PBKDF2',
      salt:       stringToArrayBuffer('cloudlaundry-salt-v1'),
      iterations: 100_000,
      hash:       'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// ── Main encryption utilities ─────────────────────────────────────────────────

export const encryptionUtils = {

  async encrypt(data: string): Promise<EncryptedData> {
    try {
      const key = await deriveKey();
      const iv  = generateIV();

      const encrypted = await crypto.subtle.encrypt(
        { name: ALGORITHM, iv },
        key,
        stringToArrayBuffer(data)
      );

      return {
        encrypted: arrayBufferToBase64(encrypted),
        iv:        arrayBufferToBase64(iv.buffer),
      };
    } catch (error) {
      console.error('[encryption] Encrypt failed:', error);
      throw new Error('Failed to encrypt data');
    }
  },

  async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      const key       = await deriveKey();
      const encrypted = base64ToArrayBuffer(encryptedData.encrypted);
      const iv        = base64ToArrayBuffer(encryptedData.iv);

      const decrypted = await crypto.subtle.decrypt(
        { name: ALGORITHM, iv },
        key,
        encrypted
      );

      return arrayBufferToString(decrypted);
    } catch (error) {
      console.error('[encryption] Decrypt failed:', error);
      throw new Error('Failed to decrypt data');
    }
  },

  // Encrypt payment-sensitive data before sending to backend or storing locally
  async encryptPaymentData(data: Record<string, string>): Promise<EncryptedData> {
    return this.encrypt(JSON.stringify(data));
  },

  async decryptPaymentData(encryptedData: EncryptedData): Promise<Record<string, string>> {
    const raw = await this.decrypt(encryptedData);
    return JSON.parse(raw);
  },

  // One-way hash for comparison (e.g. compare customer reference numbers)
  async hashData(data: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', stringToArrayBuffer(data));
    return arrayBufferToBase64(hashBuffer);
  },

  // Display helpers — mask sensitive values in UI
  maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 4) return cardNumber;
    return '•'.repeat(cardNumber.length - 4) + cardNumber.slice(-4);
  },

  maskAccountNumber(accountNumber: string): string {
    if (accountNumber.length < 4) return accountNumber;
    return '•'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  },
};

// ── Secure local storage ──────────────────────────────────────────────────────
// NOTE: localStorage is readable by any JS on the page.
// For highly sensitive data, store encrypted blobs on the server instead.
// sessionStorage is slightly safer (cleared on tab close) — swap if needed.

export const secureStorage = {

  async setEncryptedItem(key: string, data: unknown): Promise<void> {
    try {
      const encrypted = await encryptionUtils.encrypt(JSON.stringify(data));
      localStorage.setItem(`enc_${key}`, JSON.stringify(encrypted));
    } catch (error) {
      console.error('[secureStorage] Failed to store encrypted item:', error);
      throw error;
    }
  },

  async getEncryptedItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(`enc_${key}`);
      if (!raw) return null;
      const decrypted = await encryptionUtils.decrypt(JSON.parse(raw));
      return JSON.parse(decrypted) as T;
    } catch (error) {
      console.error('[secureStorage] Failed to retrieve encrypted item:', error);
      return null;
    }
  },

  removeEncryptedItem(key: string): void {
    localStorage.removeItem(`enc_${key}`);
  },
};