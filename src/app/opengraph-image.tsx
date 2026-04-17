import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';
export const alt = '버짓로드 - 내 결혼 예산 초안 만들기';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OgImage() {
  const [illustration, logo] = await Promise.all([
    readFile(path.join(process.cwd(), 'public/couple-illustration.png')),
    readFile(path.join(process.cwd(), 'public/brand/logo-ko-transparent.png')),
  ]);
  const illustrationSrc = `data:image/png;base64,${illustration.toString('base64')}`;
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F9FAFB',
        }}
      >
        <img
          src={illustrationSrc}
          width={380}
          height={380}
          alt=""
          style={{ marginBottom: '36px' }}
        />
        <img
          src={logoSrc}
          width={270}
          height={80}
          alt="버짓로드"
          style={{ marginBottom: '18px' }}
        />
        <div
          style={{
            fontSize: '30px',
            color: '#373737',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          결혼 예산, 3분에 완성
        </div>
      </div>
    ),
    { ...size },
  );
}
