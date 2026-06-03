import { NextRequest, NextResponse } from 'next/server';
import { resolveRange, runAnalytics } from '@/lib/analytics/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const range = resolveRange(sp.get('preset'), sp.get('from'), sp.get('to'));
  if (!range) {
    return NextResponse.json({ error: 'invalid date range' }, { status: 400 });
  }

  try {
    const data = await runAnalytics(range);
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[api/internal/analytics] query failed', message);
    return NextResponse.json(
      {
        error: 'query failed',
        detail: process.env.NODE_ENV !== 'production' ? message : undefined,
      },
      { status: 500 },
    );
  }
}
