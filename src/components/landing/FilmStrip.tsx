'use client';

const ILLUSTRATIONS = [
  '/illustrations/couple-01.svg',
  '/illustrations/couple-02.svg',
  '/illustrations/couple-03.svg',
  '/illustrations/couple-04.svg',
  '/illustrations/couple-05.svg',
  '/illustrations/couple-06.svg',
];

// 배열을 2배 복사 → translateX(-50%) 으로 끊김 없는 루프
const DOUBLED = [...ILLUSTRATIONS, ...ILLUSTRATIONS];

export function FilmStrip() {
  return (
    <div
      className="w-full overflow-hidden"
      style={{
        maskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      <div
        className="flex"
        style={{
          gap: '6px',
          width: 'max-content',
          animation: 'film-scroll 28s linear infinite',
        }}
      >
        {DOUBLED.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            aria-hidden="true"
            style={{
              width: 'calc(33.333vw - 4px)',
              height: 'calc(33.333vw - 4px)',
              flexShrink: 0,
              display: 'block',
            }}
          />
        ))}
      </div>
    </div>
  );
}
