export const isValidFullName = (name: string): boolean => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words.length >= 2;
};

export const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
};

export const isValidPhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length === 10;
};

export const isValidNIC = (nic: string): boolean => {
  const trimmed = nic.trim().toUpperCase();
  const oldFormat = /^[0-9]{9}[VX]$/;   // e.g. 123456789V
  const newFormat = /^[0-9]{12}$/;      // e.g. 200012345678
  return oldFormat.test(trimmed) || newFormat.test(trimmed);
};