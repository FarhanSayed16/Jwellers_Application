/**
 * India phone normalize/validate → E.164 (+91XXXXXXXXXX).
 */
export function normalizeIndiaPhone(input: string): string | null {
  const raw = input.trim().replace(/[\s\-()]/g, '');
  let digits = raw.startsWith('+') ? raw.slice(1) : raw;
  digits = digits.replace(/\D/g, '');

  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91') && /^91[6-9]\d{9}$/.test(digits)) {
    return `+${digits}`;
  }
  return null;
}

/** Mask for logs/audit: +91******3210 */
export function maskPhone(e164: string): string {
  if (e164.length < 6) return '***';
  return `${e164.slice(0, 3)}******${e164.slice(-4)}`;
}
