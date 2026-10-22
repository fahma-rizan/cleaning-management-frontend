export const isValidFullName = (name: string): boolean => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length >= 2;
};

export const EMAIL_RULE = 'Enter a valid email address.';
export const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
};

// Sri Lankan mobile numbers only — matches the backend's authoritative rule
// (validators/authValidators.js). Accepts local (0771234567) and
// international (+94771234567 / 94771234567) forms, and tolerates the spaced
// formatting normalizePhoneNumber() produces (e.g. "077 123 4567").
const SL_MOBILE_REGEX = /^(?:\+94|94|0)(70|71|72|74|75|76|77|78)\d{7}$/;
export const PHONE_RULE = 'Enter a valid Sri Lankan mobile number (e.g. 0771234567 or +94771234567).';

export const isValidPhone = (phone: string): boolean => {
  const compact = phone.replace(/\s+/g, "");
  return SL_MOBILE_REGEX.test(compact);
};

export const isValidNIC = (nic: string): boolean => {
  const trimmed = nic.trim().toUpperCase();
  const oldFormat = /^[0-9]{9}[VX]$/;   // e.g. 123456789V
  const newFormat = /^[0-9]{12}$/;      // e.g. 200012345678
  return oldFormat.test(trimmed) || newFormat.test(trimmed);
};

// Matches validators/authValidators.js's PASSWORD_REGEX exactly — the
// backend is authoritative, this is UX-only (real-time feedback).
export const PASSWORD_RULE = 'Min 8 characters, with uppercase, lowercase, a number and a special character.';
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
export const isValidPassword = (password: string): boolean => PASSWORD_REGEX.test(password);

export const PASSWORD_CHECKLIST = [
  { key: 'length',    label: 'At least 8 characters',      test: (p: string) => p.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter (A-Z)',  test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter (a-z)',  test: (p: string) => /[a-z]/.test(p) },
  { key: 'number',    label: 'One number (0-9)',            test: (p: string) => /\d/.test(p) },
  { key: 'special',   label: 'One special character (!@#$%^&*)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;