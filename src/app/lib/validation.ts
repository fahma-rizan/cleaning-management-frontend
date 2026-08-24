export const isValidFullName = (name: string): boolean => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length >= 2;
};

export const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
};

// Sri Lankan mobile numbers — accepts either the local "0771234567" form or
// the international "+94771234567" form (spaces/dashes allowed while typing,
// stripped before matching). Mirrors backend/utils/validators.js exactly —
// keep both in sync if the accepted prefixes ever change.
const LOCAL_PHONE_REGEX = /^0(70|71|72|74|75|76|77|78)\d{7}$/;
const INTL_PHONE_REGEX  = /^\+94(70|71|72|74|75|76|77|78)\d{7}$/;

export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[\s-]/g, "");
  return LOCAL_PHONE_REGEX.test(cleaned) || INTL_PHONE_REGEX.test(cleaned);
};

export const PHONE_FORMAT_HINT = "e.g. 0771234567 or +94771234567";

export const isValidNIC = (nic: string): boolean => {
  const trimmed = nic.trim().toUpperCase();
  const oldFormat = /^[0-9]{9}[VX]$/;   // e.g. 123456789V
  const newFormat = /^[0-9]{12}$/;      // e.g. 200012345678
  return oldFormat.test(trimmed) || newFormat.test(trimmed);
};

// Mirrors backend PASSWORD_REGEX in backend/utils/validators.js exactly —
// min 8 chars, at least 1 lowercase, 1 uppercase, 1 number, 1 special char.
export const PASSWORD_RULE = "Minimum 8 characters with uppercase, lowercase, number and special character.";

export interface PasswordChecks {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

export const getPasswordChecks = (password: string): PasswordChecks => ({
  length:    password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number:    /[0-9]/.test(password),
  special:   /[^A-Za-z0-9]/.test(password),
});

export const isValidPassword = (password: string): boolean => {
  const checks = getPasswordChecks(password);
  return Object.values(checks).every(Boolean);
};
