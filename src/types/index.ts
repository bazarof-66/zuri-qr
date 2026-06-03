export type QRCodeType = 'static' | 'dynamic';
export type QRStatus = 'active' | 'paused' | 'deleted';
export type PlanTier = 'free' | 'pro';
export type DeviceType = 'ios' | 'android' | 'desktop' | 'unknown';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  plan: PlanTier;
  qrCount: number;
  maxQRCodes: number;
  createdAt: string;
}

export interface QRCode {
  id: string;
  userId?: string;
  ownerId: string;
  name: string;
  type: QRCodeType;
  destinationUrl: string;
  targetUrl: string;
  shortCode: string;
  colorFg: string;
  colorBg: string;
  status: QRStatus;
  scanCount: number;
  totalScans: number;
  lastScannedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Scan {
  id: string;
  qrCodeId: string;
  userId: string;
  country: string;
  city: string;
  deviceType: DeviceType;
  browserName: string;
  osName: string;
  scannedAt: string;
}

export interface DashboardStats {
  totalQRCodes: number;
  activeQRCodes: number;
  maxQRCodes: number;
  scansToday: number;
  scansThisMonth: number;
  scansYesterday: number;
  scansLastMonth: number;
  averageScanRate: number;
}

export interface DailyScan {
  date: string;
  count: number;
}
