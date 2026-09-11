const COMMON = new Set([
  'password',
  'password123',
  '1234567890',
  'qwertyuiop',
  'changeme123',
  'adminadmin',
  'welcome123',
]);

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 10) {
    return 'Password must be at least 10 characters';
  }
  if (COMMON.has(password.toLowerCase())) {
    return 'Password is too common';
  }
  return null;
}
