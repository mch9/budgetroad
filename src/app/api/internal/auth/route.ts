import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, passwordToken, DASH_COOKIE } from '@/lib/analytics/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body?.password ?? '');

  if (!verifyPassword(password)) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DASH_COOKIE, passwordToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
