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