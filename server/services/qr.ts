import { customAlphabet } from 'nanoid';

// Generate QR code content for storage units
const generateId = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export function generateQRCode(): string {
  return `SU-${generateId()}`;
}

export function validateQRCode(qrCode: string): boolean {
  // Simple validation for our QR code format
  return /^SU-[A-Z0-9]{8}$/.test(qrCode);
}

export function generateStorageUnitName(location: string, qrCode: string): string {
  const suffix = qrCode.split('-')[1] || 'XXX';
  return `${location} Storage #${suffix}`;
}
