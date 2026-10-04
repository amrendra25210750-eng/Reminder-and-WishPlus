import QRCode from 'qrcode';

/**
 * Normalizes phone number into WhatsApp international E.164 compatible format
 * without plus signs or special characters.
 */
export function normalizeWhatsAppNumber(rawPhone: string, defaultCountryCode: string = '91'): string {
  if (!rawPhone) return '';
  // Remove non-digit characters except leading plus
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.length === 10) {
    // 10-digit number without country code, prefix default
    const code = defaultCountryCode.replace(/\D/g, '');
    cleaned = `${code}${cleaned}`;
  }

  return cleaned;
}

/**
 * Masks a phone number for security and privacy display:
 * e.g. "+91 97778 •••••" or "97778•••••"
 */
export function maskPhoneNumber(phone: string, reveal: boolean = false): string {
  if (!phone) return '—';
  if (reveal) return phone;

  const trimmed = phone.trim();
  // If formatted like +919777837753 or 9777837753
  if (trimmed.startsWith('+91') && trimmed.length >= 13) {
    // e.g. +91 97778 •••••
    const prefix = trimmed.slice(0, 8); // "+9197778"
    return `${prefix.slice(0, 3)} ${prefix.slice(3)} •••••`;
  }

  if (trimmed.length === 10) {
    // e.g. 97778 •••••
    return `${trimmed.slice(0, 5)} •••••`;
  }

  if (trimmed.length > 5) {
    const visiblePart = trimmed.slice(0, Math.min(trimmed.length - 4, 6));
    const hiddenCount = Math.max(trimmed.length - visiblePart.length, 4);
    return `${visiblePart} ${'•'.repeat(hiddenCount)}`;
  }

  return '••••••••••';
}

/**
 * Builds the standard WhatsApp wa.me universal URL
 */
export function buildWhatsAppLink(phone: string, message: string, defaultCountryCode: string = '91'): string {
  const cleanPhone = normalizeWhatsAppNumber(phone, defaultCountryCode);
  const encodedText = encodeURIComponent(message);
  if (!cleanPhone) {
    return `https://wa.me/?text=${encodedText}`;
  }
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Builds WhatsApp Web direct URL
 */
export function buildWhatsAppWebLink(phone: string, message: string, defaultCountryCode: string = '91'): string {
  const cleanPhone = normalizeWhatsAppNumber(phone, defaultCountryCode);
  const encodedText = encodeURIComponent(message);
  if (!cleanPhone) {
    return `https://web.whatsapp.com/send?text=${encodedText}`;
  }
  return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}

/**
 * Generate QR code as Base64 Data URL for easy scanning on phone
 */
export async function generateWhatsAppQRCode(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: {
        dark: '#075E54', // WhatsApp dark emerald green
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return '';
  }
}
