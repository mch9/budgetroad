import { ImageResponse } from 'next/og';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

const bGlyph = readFileSync(
  join(process.cwd(), 'public', 'brand', 'b-glyph.png'),
);
const bGlyphSrc = `data:image/png;base64,${bGlyph.toString('base64')}`;

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FFFFFF',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bGlyphSrc} width={136} height={136} alt="" />
      </div>
    ),
    { ...size },
  );
}
