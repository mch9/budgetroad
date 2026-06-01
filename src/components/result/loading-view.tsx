'use client';

import { useEffect, useState } from 'react';

type Props = { onComplete: () => void };

type StepState = 'pending' | 'active' | 'done';

const STEPS_DATA = [
  { title: '예산을 계산하고 있어요', desc: '선택하신 옵션을 기반으로 총 예산을 산출 중이에요' },
  { title: '맞춤 추천을 분석 중이에요', desc: '두 분의 우선순위에 맞는 패키지를 찾고 있어요' },
  { title: '설계서를 완성하고 있어요', desc: '결과 화면을 예쁘게 다듬는 중이에요' },
];

// 1.0초 × 3단계 + 0.5초 페이드 = 3.5초
const STEP_DURATION_MS = 1000;
const FADE_OUT_MS = 500;

export function LoadingView({ onComplete }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= STEPS_DATA.length; i++) {
      timers.push(setTimeout(() => setActiveIdx(i), STEP_DURATION_MS * i));
    }
    timers.push(
      setTimeout(
        () => onComplete(),
        STEP_DURATION_MS * STEPS_DATA.length + FADE_OUT_MS
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  function getState(idx: number): StepState {
    if (idx < activeIdx) return 'done';
    if (idx === activeIdx) return 'active';
    return 'pending';
  }

  return (
    <div className="flex min-h-dvh flex-col items-center bg-[#F9FAFB] px-6 pb-20 pt-16">
      <div
        className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl wiggle-anim"
        style={{
          background: 'linear-gradient(135deg, #CEE7FE 0%, #AAC7E1 100%)',
          boxShadow:
            '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        </svg>
      </div>

      <h1 className="pb-2 text-xl font-semibold leading-7 text-[#171717]">
        설계서를 준비하고 있어요
      </h1>
      <p className="pb-10 text-base leading-6 text-[#737373]">잠시만 기다려 주세요</p>

      <div className="flex w-full max-w-[361px] flex-col gap-3">
        {STEPS_DATA.map((s, idx) => (
          <StepCard key={idx} state={getState(idx)} title={s.title} desc={s.desc} />
        ))}
      </div>
    </div>
  );
}

function StepCard({
  state,
  title,
  desc,
}: {
  state: StepState;
  title: string;
  desc: string;
}) {
  const containerClass = {
    pending: 'bg-white/60 border-[#E5E5E5]',
    active:
      'bg-white border-[#AAC7E1] shadow-[0_4px_18px_rgba(170,199,225,0.5)]',
    done: 'bg-[rgba(170,199,225,0.18)] border-[#AAC7E1]',
  }[state];

  const titleColor = state === 'pending' ? 'text-[#A1A1A1]' : 'text-[#171717]';
  const descColor = state === 'pending' ? 'text-[#A1A1A1]' : 'text-[#737373]';

  const iconBg = state === 'pending' ? 'bg-[#F3F4F6]' : 'bg-[#E2EBF3]';

  return (
    <div
      className={`flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-300 ${containerClass}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
      >
        {state === 'done' ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M5 10L8.5 13.5L15 6.5"
              stroke="#AAC7E1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : state === 'active' ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="animate-spin"
            aria-hidden
          >
            <circle cx="10" cy="10" r="8" stroke="#E2EBF3" strokeWidth="2.5" />
            <path
              d="M10 2 A 8 8 0 0 1 18 10"
              stroke="#AAC7E1"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <div className="h-2 w-2 rounded-full bg-[#A1A1A1]" />
        )}
      </div>

      <div className="flex min-w-0 flex-col">
        <span className={`text-[15px] font-semibold leading-5 ${titleColor}`}>
          {title}
        </span>
        <span className={`mt-0.5 text-xs leading-4 ${descColor}`}>{desc}</span>
      </div>
    </div>
  );
}
