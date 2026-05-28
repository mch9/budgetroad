'use client';

import type { ResultPayload } from '@/lib/budget-engine';
import { TYPE_CONFIGS } from '@/lib/budget-engine';

type Props = { result: ResultPayload };

export function TabComprehensive({ result }: Props) {
  const config = TYPE_CONFIGS[result.vars.persona];

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-6">
      {/* 1) 타입 진단 카드 — 일러스트 + 헤딩 + 풍부 설명 + 해시태그 + 추천 식장 한 줄 */}
      <section className="rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white px-6 pb-6 pt-2">
        <PersonaIllustration illustration={config.illustration} />
        <div className="pt-2 text-left">
          <p className="text-xs font-semibold text-[#737373]">우리 커플은</p>
          <h2 className="mt-1 text-2xl font-bold leading-8 text-[#373737]">{config.title}</h2>
          <p className="mt-4 text-[15px] leading-7 text-[#373737]">{config.desc}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {config.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-[rgba(170,199,225,0.22)] px-3 py-1 text-xs font-semibold text-[#7499BA]"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-[rgba(170,199,225,0.18)] px-4 py-3">
            <span className="shrink-0 text-xs font-semibold text-[#7499BA]">추천 식장</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#171717]">{result.venue.form}</p>
              <p className="mt-0.5 text-xs text-[#737373]">대안 · {result.venue.alt}</p>
            </div>
          </div>
          {result.vars.persona === '본질미니멀' && (
            <p className="mt-3 text-xs leading-5 text-[#525252]">
              국가유산청·시구 공공시설 결혼식장 100만원대도 함께 검토해보세요
            </p>
          )}
        </div>
      </section>

      {/* 2) 예산 총 합계 + 이유 */}
      <section className="rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white p-5">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: 'rgba(170,199,225,0.3)' }}
            >
              <span className="text-xs">💰</span>
            </span>
            <span className="text-base text-[#0A0A0A]">예산 총 합계</span>
          </div>
          <span className="text-2xl font-bold tabular-nums text-[#171717]">
            {result.budget.total.toLocaleString()}{' '}
            <span className="text-sm font-normal text-[#737373]">만원</span>
          </span>
        </div>
        <div className="border-t border-[#E5E5E5] pt-4">
          <h3 className="pb-3 text-base font-bold text-[#373737]">이 예산이 나온 이유</h3>
          <ReasonList result={result} />
        </div>
        <p className="mt-4 text-xs text-[#A1A1A1]">
          지역 및 시즌에 따라 ±15% 변동이 있을 수 있어요.
        </p>
      </section>

      {/* 3) 정합성 진단 */}
      <DiagnosisCard result={result} />

      {/* 4) 여기에 더 투자 */}
      <section className="rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white p-5">
        <h3 className="pb-3 text-base font-bold text-[#171717]">여기에 더 투자하는 게 좋아요</h3>
        <ul className="flex flex-col gap-3">
          {result.advice.invest.map((item, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7499BA] text-[10px] font-bold text-white">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="text-sm font-semibold text-[#171717]">{item.title}</p>
                <p className="mt-0.5 text-xs leading-5 text-[#525252]">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 5) 여기서 줄여도 OK */}
      {result.advice.save.length > 0 && (
        <section className="rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white p-5">
          <h3 className="pb-3 text-base font-bold text-[#171717]">여기서 줄여도 괜찮아요</h3>
          <ul className="flex flex-col gap-3">
            {result.advice.save.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#AAC7E1] text-[10px] font-bold text-[#171717]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#171717]">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-[#525252]">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 추천 식장 별도 카드는 제거 — 위 타입 진단 카드 하단에 한 줄로 흡수.
          reasons는 향후 정식 디자인 도착 시 별도 영역으로 분리 예정. */}

      {/* 6) 준비 TOP 3 (정적) */}
      <section className="rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white p-5">
        <h3 className="pb-3 text-base font-bold text-[#171717]">지금 당장 해야 할 준비 TOP 3</h3>
        <ol className="flex flex-col gap-4">
          <TodoItem
            rank={1}
            title="웨딩홀 후보 3곳 정리하기"
            timing="이번 주 안에"
            note="결혼 예정 시기가 1년 이내이고 하객 수가 150명 이상이면 선택지가 빠르게 줄어들어요."
            checks={['희망 지역 2곳 정하기', '예상 하객 수 다시 확인하기', '원하는 예식 시간대 정하기', '식대 상한선 정하기']}
          />
          <TodoItem
            rank={2}
            title="커플 간 총 예산 상한선 합의하기"
            timing="웨딩홀 상담 전에"
            note="양가 의견 차이를 미리 정리해두면 진행이 훨씬 매끄러워요."
            checks={['총 예산 상한선 정하기', '부모님 지원 여부 확인하기', '절대 줄이고 싶지 않은 항목 정하기']}
          />
          <TodoItem
            rank={3}
            title="스드메 투자 기준 정하기"
            timing="웨딩홀 방향 확정 후"
            note="원하는 우선순위를 미리 정하면 추가금 결정도 빨라져요."
            checks={['드레스 우선인지 촬영 우선인지', '원본/수정본 포함 여부', '드레스 추가금 허용 범위']}
          />
        </ol>
      </section>
    </div>
  );
}

function ReasonList({ result }: { result: ResultPayload }) {
  const items: Array<{ title: string; desc: string }> = [
    {
      title: '하객 수가 예산의 가장 큰 기준',
      desc: `예상 ${result.vars.guests}명 기준으로 식대·대관이 계산됐어요.`,
    },
    {
      title: `${result.vars.region} ${result.vars.season === 'peak' ? '성수기' : '비성수기'} 시세 반영`,
      desc: '지역·시즌별 평균 단가를 그대로 적용했어요.',
    },
    {
      title: `${result.vars.persona} 유형 디폴트가 반영됐어요`,
      desc: '유형에 맞는 추가금 옵션이 자동으로 켜져 있어요. 케어 탭에서 자유롭게 조정하세요.',
    },
  ];
  return (
    <ol className="flex flex-col gap-3">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#7499BA] text-[10px] font-bold text-white">
            {String(i + 1).padStart(2, '0')}
          </span>
          <div>
            <p className="text-sm font-medium text-[#373737]">{it.title}</p>
            <p className="mt-0.5 text-xs leading-5 text-[#525252]">{it.desc}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function DiagnosisCard({ result }: { result: ResultPayload }) {
  const statusColor = {
    WARN: 'bg-[#FFF7E6] border-[#F5C158] text-[#A06800]',
    OVER: 'bg-[#FFF1F1] border-[#F0A1A1] text-[#A01818]',
    UNDER: 'bg-[#F0F7FF] border-[#AAC7E1] text-[#0A4A8A]',
    FIT: 'bg-[#F2FBF4] border-[#9DD4A8] text-[#1A6E2A]',
  }[result.consistency.status];

  const statusLabel = {
    WARN: '⚠️ 주의',
    OVER: '⬆ 초과',
    UNDER: '⬇ 여유',
    FIT: '✓ 적정',
  }[result.consistency.status];

  return (
    <section className={`rounded-2xl border-2 p-5 ${statusColor}`}>
      <div className="flex items-center gap-2 pb-1">
        <span className="text-xs font-bold">{statusLabel}</span>
        <span className="text-xs">진단</span>
      </div>
      <h3 className="text-base font-bold">{result.consistency.headline}</h3>
      <p className="mt-2 text-sm leading-6">{result.consistency.body}</p>
    </section>
  );
}

function TodoItem({
  rank,
  title,
  timing,
  note,
  checks,
}: {
  rank: number;
  title: string;
  timing: string;
  note: string;
  checks: string[];
}) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#373737] text-xs font-bold text-white">
        {rank}위
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold text-[#171717]">{title}</p>
        <p className="mt-0.5 text-xs text-[#7499BA]">권장 시점: {timing}</p>
        <p className="mt-2 text-xs leading-5 text-[#525252]">{note}</p>
        <ul className="mt-3 flex flex-col gap-1">
          {checks.map((c, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-[#525252]">
              <span className="text-[#AAC7E1]">●</span> {c}
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function PersonaIllustration({
  illustration,
}: {
  illustration: 'traditional' | 'standard' | 'experience' | 'minimal' | 'undecided';
}) {
  return (
    <img
      src={`/illustrations/persona-${illustration}.svg`}
      alt=""
      aria-hidden
      className="mx-auto block h-auto w-full max-w-[300px]"
    />
  );
}
