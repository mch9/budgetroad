import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = '버짓로드 - 내 결혼 예산 초안 만들기';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
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
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 50%, #FFF7ED 100%)',
          position: 'relative',
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #FF8400, #FFB366, #FF8400)',
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: '#FF8400',
            marginBottom: '32px',
            fontSize: '40px',
          }}
        >
          💰
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: '#1A1A1A',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
          }}
        >
          버짓로드
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#666666',
            marginBottom: '40px',
          }}
        >
          내 결혼 예산 초안 만들기
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {['유형 선택', '자동 계산', '3분 완성'].map((text) => (
            <div
              key={text}
              style={{
                padding: '10px 24px',
                borderRadius: '999px',
                background: '#FFF3E0',
                color: '#FF8400',
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {text}
            </div>
          ))}
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '16px',
            color: '#AAAAAA',
          }}
        >
          통계 기반 결혼 예산 자동 생성
        </div>
      </div>
    ),
    { ...size },
  );
}
