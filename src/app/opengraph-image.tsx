import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '웨딩버젯 - 내 결혼 예산 초안 만들기';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
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
          background: 'linear-gradient(to bottom, #ffffff, #fff7ed)',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#FF8400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
            }}
          >
            💰
          </div>
          <span
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#FF8400',
            }}
          >
            웨딩버젯
          </span>
        </div>

        <div
          style={{
            fontSize: '52px',
            fontWeight: 800,
            color: '#1a1a1a',
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: '700px',
          }}
        >
          내 결혼, 대략 얼마나 들까?
        </div>

        <div
          style={{
            fontSize: '24px',
            color: '#737373',
            marginTop: '24px',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          결혼 유형만 선택하면 통계 기반 예산 초안을 자동 생성
        </div>

        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginTop: '40px',
            fontSize: '18px',
            color: '#a3a3a3',
          }}
        >
          <span>📊 통계 기반</span>
          <span>⏱ 3분 완성</span>
          <span>🔒 로그인 불필요</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
