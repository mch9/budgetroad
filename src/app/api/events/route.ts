import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { visitor_id, event_name, properties } = await req.json();

    if (!visitor_id || !event_name) {
      return NextResponse.json(
        { error: 'visitor_id and event_name required' },
        { status: 400 },
      );
    }

    await prisma.event.create({
      data: {
        visitorId: visitor_id,
        eventName: event_name,
        properties: properties ?? null,
        isDev: process.env.NODE_ENV !== 'production',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as { code?: string; meta?: unknown };
    const host = process.env.DATABASE_URL
      ? new URL(process.env.DATABASE_URL).hostname
      : 'MISSING';
    console.error('[api/events] insert failed', {
      code: err.code,
      meta: err.meta,
      dbHost: host,
      message: e instanceof Error ? e.message : String(e),
    });
    return NextResponse.json({ error: 'insert failed' }, { status: 500 });
  }
}
