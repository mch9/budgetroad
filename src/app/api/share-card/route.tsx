import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { NextRequest } from 'next/server';

// 결과 공유 카드 (1080×1920, 9:16). hex 전용 — Tailwind oklch 토큰이 렌더러에 닿지 않아 안전.
// 클라이언트가 현재 결과를 쿼리로 전달: persona, total(만원), cats="라벨:금액,..."
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const persona = sp.get('persona') || '우리 커플';
  const total = Number(sp.get('total') || 0);
  const cats = (sp.get('cats') || '')
    .split(',')
    .filter(Boolean)
    .map((s) => {
      const [label, amt] = s.split(':');
      return { label, amt: Number(amt) || 0 };
    })
    .sort((a, b) => b.amt - a.amt)
    .slice(0, 4);

  const [logo, couple] = await Promise.all([
    readFile(path.join(process.cwd(), 'public/brand/logo-ko-transparent.png')),
    readFile(path.join(process.cwd(), 'public/couple-illustration.png')),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;
  const coupleSrc = `data:image/png;base64,${couple.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#F9FAFB',
          padding: '96px 84px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={300} height={89} alt="" />
          <div style={{ display: 'flex', marginTop: 26, fontSize: 34, color: '#373737', opacity: 0.55 }}>
            우리 커플 결혼 예산 초안
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coupleSrc} width={340} height={340} alt="" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, color: '#7499BA' }}>{persona}</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', marginTop: 8 }}>
            <span style={{ fontSize: 116, fontWeight: 800, color: '#373737' }}>{total.toLocaleString()}</span>
            <span style={{ fontSize: 46, color: '#373737', marginLeft: 12, marginBottom: 20 }}>만원</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {cats.map((c, i) => (
            <div
              key={c.label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 36,
                color: '#373737',
                padding: '18px 0',
                borderTop: i === 0 ? '2px solid rgba(55,55,55,0.12)' : 'none',
                borderBottom: '2px solid rgba(55,55,55,0.12)',
              }}
            >
              <span style={{ display: 'flex', opacity: 0.7 }}>{c.label}</span>
              <span style={{ display: 'flex', fontWeight: 700 }}>{c.amt.toLocaleString()}만원</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', fontSize: 30, color: '#373737', opacity: 0.45 }}>
          budgetroad.vercel.app
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}
