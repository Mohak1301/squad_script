const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/;

export const cleanText = (value, maxLength = 200) =>
  typeof value === "string" ? value.trim().slice(0, maxLength) : "";

export const normalizeEmail = (value) => cleanText(value, 254).toLowerCase();
export const isValidEmail = (value) => EMAIL_PATTERN.test(value);
export const isValidUsername = (value) => USERNAME_PATTERN.test(value);
export const isStrongPassword = (value) =>
  typeof value === "string" && value.length >= 8 && value.length <= 128 &&
  /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);

export const publicUser = (user) => ({
  username: user.username,
  name: user.name,
  email: user.email,
  isVerified: user.isVerified,
});
