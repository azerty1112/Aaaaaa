import { kv } from '@vercel/kv';
import bcrypt from 'bcryptjs';

export interface AppSettings {
  sessionCookie: string;
  accessToken?: string;
  apiAccessKey?: string;
  adminPasswordHash?: string;
  defaultModel: string;
  rateLimitMaxRequests: number;
  rateLimitWindow: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  sessionCookie: '',
  accessToken: '',
  apiAccessKey: process.env.API_ACCESS_KEY || '',
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || '',
  defaultModel: 'gpt-4o',
  rateLimitMaxRequests: 10,
  rateLimitWindow: '1 m',
};

const SETTINGS_KEY = 'app_settings';

export async function getSettings(): Promise<AppSettings> {
  try {
    const stored = await kv.get<AppSettings>(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...stored };
    }
  } catch (error) {
    console.error('Error reading settings from KV:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

export async function updateSettings(newSettings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const updated = { ...current, ...newSettings };
  await kv.set(SETTINGS_KEY, updated);
  return updated;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const settings = await getSettings();
  if (!settings.adminPasswordHash) {
    // إذا لم يوجد hash، تحقق من كلمة المرور المباشرة من متغير البيئة إن وجد
    const envPassword = process.env.ADMIN_PASSWORD;
    if (envPassword) {
      return password === envPassword;
    }
    return false;
  }
  return bcrypt.compare(password, settings.adminPasswordHash);
}
