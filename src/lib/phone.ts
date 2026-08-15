export const normalizePhoneNumber = (phone: string) => {
  const compact = phone.trim().replace(/[\s()-]/g, "");

  if (!compact) return "";

  if (compact.startsWith("+94")) {
    const digits = compact.slice(3).replace(/\D/g, "");
    if (digits.length === 9) {
      return `+94 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
  }

  if (compact.startsWith("94")) {
    const digits = compact.slice(2).replace(/\D/g, "");
    if (digits.length === 9) {
      return `+94 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
    }
  }

  if (compact.startsWith("0")) {
    const digits = compact.replace(/\D/g, "");
    if (digits.length === 10) {
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    }
  }

  return compact.replace(/\s+/g, " ");
};