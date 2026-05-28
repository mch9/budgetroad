'use client';

import { useState } from 'react';
import { Frown, Annoyed, Meh, Smile, Laugh, type LucideIcon } from 'lucide-react';
import { trackEvent } from '@/lib/gtag';

type Rating = 1 | 2 | 3 | 4 | 5;

const FACES: { rating: Rating; Icon: LucideIcon; label: string }[] = [
  { rating: 1, Icon: Frown, label: '아쉬워요' },
  { rating: 2, Icon: Annoyed, label: '별로예요' },
  { rating: 3, Icon: Meh, label: '보통이에요' },
  { rating: 4, Icon: Smile, label: '도움됐어요' },
  { rating: 5, Icon: Laugh, label: '최고예요' },
];

const PROMPT_BY_RATING: Record<Rating, string> = {
  1: '어떤 점이 아쉬웠나요?',
  2: '어떤 점을 개선하면 좋을까요?',
  3: '어떤 부분이 부족했나요?',
  4: '어떤 점이 가장 도움됐나요?',
  5: '어떤 점이 가장 좋았나요?',
};

type Props = {
  context?: Record<string, string | number>;
};

export function FeedbackCard({ context = {} }: Props) {
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleRating(r: Rating) {
    setRating(r);
    trackEvent('feedback_rated', { rating: r, ...context });
  }

  function handleSubmit() {
    if (rating === null) return;
    if (comment.trim().length > 0) {
      trackEvent('feedback_submitted', {
        rating,
        comment: comment.trim(),
        ...context,
      });
    }
    setSubmitted(true);
  }

  function handleSkip() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <section className="rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white p-5 text-center">
        <p className="text-base font-bold text-[#171717]">
          소중한 피드백 감사합니다
        </p>
        <p className="mt-2 text-xs text-[#525252]">
          더 나은 결과를 위해 적용해갈게요.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white p-5">
      <h3 className="text-base font-bold text-[#171717]">
        이 결과가 도움이 되셨나요?
      </h3>
      <p className="mt-1 text-xs text-[#525252]">
        평가 한 줄이 다음 사용자에게 큰 도움이 됩니다.
      </p>
      <div className="mt-4 flex items-start justify-between gap-1">
        {FACES.map(({ rating: r, Icon, label }) => {
          const selected = rating === r;
          return (
            <button
              key={r}
              type="button"
              onClick={() => handleRating(r)}
              aria-label={label}
              aria-pressed={selected}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-all ${
                selected ? 'bg-[rgba(170,199,225,0.3)]' : 'hover:bg-[#F9FAFB]'
              }`}
            >
              <Icon
                size={selected ? 30 : 26}
                color={selected ? '#7499BA' : '#A1A1A1'}
                strokeWidth={selected ? 2.2 : 1.8}
              />
              <span
                className={`text-[10px] ${
                  selected ? 'font-semibold text-[#7499BA]' : 'text-[#737373]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
      {rating !== null && (
        <div className="mt-5 border-t border-[#F5F5F5] pt-4">
          <p className="pb-2 text-sm font-semibold text-[#373737]">
            {PROMPT_BY_RATING[rating]}
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="자유롭게 적어주세요 (선택)"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-[#E5E5E5] bg-white px-3 py-2 text-sm text-[#171717] placeholder:text-[#A1A1A1] focus:border-[#AAC7E1] focus:outline-none"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="px-3 py-2 text-xs font-medium text-[#737373]"
            >
              건너뛰기
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-full bg-[#7499BA] px-4 py-2 text-xs font-bold text-white"
            >
              보내기
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
