import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/chatgpt';

export async function GET(req: Request) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await refreshAccessToken();
  if (token) {
    return NextResponse.json({ success: true, message: 'Token refreshed' });
  }
  return NextResponse.json({ success: false, error: 'Failed to refresh' }, { status: 500 });
}
