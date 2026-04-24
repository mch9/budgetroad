'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';
import { shareResult } from '@/lib/share';
import {
  type Region,
  type VenueType,
  type Season,
  type Tier,
  type YemulTier,
  type HoneymoonChoice,
  type StepSelections,
  type BudgetResult,
  DEFAULT_SELECTIONS,
  REGION_OPTIONS,
  VENUE_OPTIONS,
  SEASON_OPTIONS,
  TIER_LABELS,
  GUEST_OPTIONS,
  MEAL_OPTIONS,
  YEMUL_OPTIONS,
  STANDARD_MEAL_PRICES,
  STUDIO_TIER_OPTIONS,
  DRESS_TIER_OPTIONS,
  MAKEUP_TIER_OPTIONS,
  calculateBudget,
  isVenueDisabled,
} from '@/lib/budget-data';

const TOTAL_STEPS = 10;
const RESULT_STORAGE_KEY = 'budgetroad_result';

export default function BudgetDraftPage() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<StepSelections>(DEFAULT_SELECTIONS);
  const [result, setResult] = useState<BudgetResult | null>(null);
  const [enteredAt] = useState(() => Date.now());
  const inputStarted = useRef(false);

  // Restore result from sessionStorage on mount. setState inside this effect
  // is intentional — lazy useState initializer would break SSR hydration
  // because sessionStorage is unavailable on the server.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    trackEvent('budget_draft_entered');
    try {
      const saved = sessionStorage.getItem(RESULT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // selections가 있으면 result는 항상 fresh로 재계산 (구 버전 캐시된 result 무시)
        if (parsed.selections) {
          const restored = parsed.selections as StepSelections;
          setSelections(restored);
          setResult(calculateBudget(restored));
          setStep(TOTAL_STEPS);
        } else if (parsed.result) {
          // selections 없는 옛날 포맷: 그대로 사용 (세부 내역은 없음)
          setResult(parsed as BudgetResult);
          setStep(TOTAL_STEPS);
        }
      }
    } catch { /* ignore */ }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function trackFirstInput() {
    if (inputStarted.current) return;
    inputStarted.current = true;
    const elapsed = Math.round((Date.now() - enteredAt) / 1000);
    trackEvent('input_started', { time_to_start_sec: elapsed });
  }

  function update<K extends keyof StepSelections>(key: K, value: StepSelections[K]) {
    trackFirstInput();
    setSelections((prev) => ({ ...prev, [key]: value }));
  }

  function updateRegion(v: Region) {
    trackFirstInput();
    setSelections((prev) => ({
      ...prev,
      region: v,
      venueType: isVenueDisabled(v, prev.venueType) ? 'convention' : prev.venueType,
    }));
  }

  function next() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const r = calculateBudget(selections);
      trackEvent('result_viewed', {
        total_amount: r.total,
        region: selections.region,
        venue_type: selections.venueType,
        season: selections.season,
        studio_tier: selections.studioTier,
        dress_tier: selections.dressTier,
        makeup_tier: selections.makeupTier,
        guest_count: selections.guestCount,
        meal_cost: selections.mealCost,
        yemul_tier: selections.yemulTier,
        honeymoon_choice: selections.honeymoonChoice,
      });
      setResult(r);
      setStep(TOTAL_STEPS);
      sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify({ result: r, selections }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function back() {
    if (step > 0) {
      trackEvent('back_clicked', { from_step: step + 1 });
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function reset() {
    setStep(0);
    setSelections(DEFAULT_SELECTIONS);
    setResult(null);
    sessionStorage.removeItem(RESULT_STORAGE_KEY);
  }

  const isResult = step === TOTAL_STEPS;
  const progressPct = Math.round(((step + 1) / TOTAL_STEPS) * 100);

  return (
    <div className="flex min-h-dvh flex-col bg-[#F9FAFB]">
      {/* Header — Figma: 87px, border-bottom 1px solid #E5E7EB */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#E5E7EB] bg-[#F9FAFB]/80 px-6 backdrop-blur-sm sm:h-[87px] sm:px-8">
        <Link href="/">
          <img
            src="/brand/logo-ko-nav.png"
            alt="버짓로드"
            className="h-[28px] w-auto sm:h-[36px]"
          />
        </Link>
      </header>

      {/* Progress — Figma: labels + 8px bar, track #E5E7EB, fill #AAC7E1 */}
      {!isResult && (
        <div className="mx-auto w-full max-w-[576px] px-6 pt-6">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm text-[#6A7282]">단계 {step + 1} / {TOTAL_STEPS}</span>
            <span className="text-sm text-[#6A7282]">{progressPct}% 완료</span>
          </div>
          <div className="flex w-full gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? 'bg-[#AAC7E1]' : 'bg-[#E5E7EB]'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <main className={`mx-auto flex w-full flex-1 flex-col px-6 ${isResult ? 'max-w-[1040px]' : 'max-w-[576px]'}`}>
        {step === 0 && <Step1 value={selections.region} onChange={updateRegion} />}
        {step === 1 && (
          <Step2
            region={selections.region}
            venue={selections.venueType}
            onVenueChange={(v) => update('venueType', v)}
          />
        )}
        {step === 2 && (
          <SeasonStep
            season={selections.season}
            onSeasonChange={(v) => update('season', v)}
          />
        )}
        {step === 3 && (
          <StudioStep
            value={selections.studioTier}
            onChange={(v) => update('studioTier', v)}
          />
        )}
        {step === 4 && (
          <DressStep
            value={selections.dressTier}
            onChange={(v) => update('dressTier', v)}
          />
        )}
        {step === 5 && (
          <MakeupStep
            value={selections.makeupTier}
            onChange={(v) => update('makeupTier', v)}
          />
        )}
        {step === 6 && (
          <GuestStep
            value={selections.guestCount}
            onChange={(v) => update('guestCount', v)}
          />
        )}
        {step === 7 && (
          <MealStep
            region={selections.region}
            venueType={selections.venueType}
            value={selections.mealCost}
            onChange={(v) => update('mealCost', v)}
          />
        )}
        {step === 8 && (
          <YemulStep
            value={selections.yemulTier}
            onChange={(v) => update('yemulTier', v)}
          />
        )}
        {step === 9 && (
          <HoneymoonStep
            choice={selections.honeymoonChoice}
            budget={selections.honeymoonBudget}
            onChoiceChange={(v) => update('honeymoonChoice', v)}
            onBudgetChange={(v) => update('honeymoonBudget', v)}
          />
        )}
        {isResult && result && <ResultView result={result} selections={selections} onReset={reset} />}
      </main>

      {/* Bottom Navigation — chevron + '이전' / '다음' + chevron */}
      {!isResult && (
        <nav className="sticky bottom-0 z-10 border-t border-[#E5E7EB] bg-[#F9FAFB]/90 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[576px] items-center justify-between px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              onClick={back}
              disabled={step === 0}
              className="flex h-14 items-center gap-2 text-base font-bold text-[#6A7282] transition-opacity disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              이전
            </button>
            <button
              onClick={next}
              className="flex h-14 items-center gap-2 text-base font-bold text-[#373737]"
            >
              {step === TOTAL_STEPS - 1 ? '예산 결과 보기' : '다음'}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

// ── Shared Components ──

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="space-y-1.5 pb-2 pt-8">
      <p className="text-sm text-[#6A7282]">STEP {step}</p>
      <h1 className="text-[30px] font-bold leading-9 text-[#373737]">{title}</h1>
      {subtitle && <p className="text-base text-[#6A7282]">{subtitle}</p>}
    </div>
  );
}

function OptionCard<T extends string | number>({
  selected,
  label,
  desc,
  icon,
  isSkip,
  disabled,
  onClick,
}: {
  selected: boolean;
  label: string;
  desc?: string;
  icon: string;
  isSkip?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled
        className="flex min-h-[94px] w-full cursor-not-allowed items-center justify-between rounded-[14px] border-2 border-[#F3F4F6] bg-[#F9FAFB] p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 shrink-0" />
          <span className="text-lg font-medium text-[#9CA3AF]">{label}</span>
        </div>
        <span className="rounded-full bg-[#F3F4F6] px-2.5 py-1 text-xs text-[#9CA3AF]">
          데이터 없음
        </span>
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`flex min-h-[94px] w-full items-center justify-between rounded-[14px] border-2 p-5 text-left transition-all ${
        selected
          ? 'border-[#AAC7E1] bg-[rgba(170,199,225,0.3)]'
          : 'border-[#E5E7EB] bg-white'
      }`}
    >
      <div className="flex flex-col">
        <span className={`text-lg font-medium ${selected ? 'text-[#101828]' : 'text-[#364153]'}`}>
          {label}
        </span>
        {desc && (
          <span className="mt-0.5 text-sm text-[#6A7282]">{desc}</span>
        )}
      </div>
      {selected ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#AAC7E1]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 10L8.5 13.5L15 6.5" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-full border-2 border-[#D1D5DC] bg-white" />
      )}
    </button>
  );
}

// ── Steps ──

function Step1({ value, onChange }: { value: Region; onChange: (v: Region) => void }) {
  return (
    <div>
      <StepHeader step={1} title="어디서 결혼하고 싶으신가요?" subtitle="지역을 선택하면 지역별 시세가 반영됩니다" />
      <div className="flex flex-col gap-3 pt-4">
        {REGION_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={value === o.value} label={o.label} desc={o.desc} icon={o.icon} onClick={() => onChange(o.value)} />
        ))}
      </div>
    </div>
  );
}

function Step2({
  region, venue, onVenueChange,
}: {
  region: Region; venue: VenueType;
  onVenueChange: (v: VenueType) => void;
}) {
  return (
    <div>
      <StepHeader step={2} title="어떤 분위기의 예식을 원하시나요?" />
      <div className="flex flex-col gap-3 pt-4">
        {VENUE_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={venue === o.value}
            label={o.label}
            desc={o.desc}
            icon={o.icon}
            disabled={isVenueDisabled(region, o.value)}
            onClick={() => onVenueChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

function StudioStep({ value, onChange }: { value: Tier; onChange: (v: Tier) => void }) {
  return (
    <div>
      <StepHeader step={4} title="스튜디오 촬영은 어느 정도로 생각하시나요?" subtitle="(본식 + 앨범 촬영 포함)" />
      <div className="flex flex-col gap-3 pt-4">
        {STUDIO_TIER_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={value === o.value}
            label={o.label}
            desc={o.desc}
            icon=""
            onClick={() => onChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

function DressStep({ value, onChange }: { value: Tier; onChange: (v: Tier) => void }) {
  return (
    <div>
      <StepHeader step={5} title="드레스는 어느 정도로 생각하시나요?" subtitle="(본식 + 앨범 촬영 포함)" />
      <div className="flex flex-col gap-3 pt-4">
        {DRESS_TIER_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={value === o.value}
            label={o.label}
            desc={o.desc}
            icon=""
            onClick={() => onChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

function MakeupStep({ value, onChange }: { value: Tier; onChange: (v: Tier) => void }) {
  return (
    <div>
      <StepHeader step={6} title="메이크업 · 헤어는 어느 정도로 생각하시나요?" subtitle="(본식 + 앨범 촬영 포함)" />
      <div className="flex flex-col gap-3 pt-4">
        {MAKEUP_TIER_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={value === o.value}
            label={o.label}
            desc={o.desc}
            icon=""
            onClick={() => onChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

function GuestStep({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <StepHeader step={7} title="하객은 몇 분 정도 예상하시나요?" />
      <div className="flex flex-col gap-3 pt-4">
        {GUEST_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={value === o.value}
            label={o.label}
            icon={o.icon}
            onClick={() => onChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

function MealStep({
  region, venueType, value, onChange,
}: {
  region: Region; venueType: VenueType; value: number;
  onChange: (v: number) => void;
}) {
  const standardMeal = STANDARD_MEAL_PRICES[region]?.[venueType];
  const regionLabel = REGION_OPTIONS.find((o) => o.value === region)?.label;
  const venueLabel = VENUE_OPTIONS.find((o) => o.value === venueType)?.label;
  const standardRounded = standardMeal ? Math.round(standardMeal) : null;
  const isStandardSelected = standardRounded !== null && value === standardRounded && !MEAL_OPTIONS.some((o) => o.value === value);

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && standardRounded !== null) {
      initialized.current = true;
      onChange(standardRounded);
    }
  }, []);

  return (
    <div>
      <StepHeader step={8} title="식사 비용은 1인당 어느 정도로 생각하시나요?" />

      {standardRounded !== null && (
        <button
          type="button"
          onClick={() => onChange(standardRounded)}
          className={`mt-4 flex w-full items-center justify-between rounded-[14px] border-2 p-5 text-left transition-all ${
            isStandardSelected
              ? 'border-[#AAC7E1] bg-[rgba(170,199,225,0.3)]'
              : 'border-[#E5E7EB] bg-white'
          }`}
        >
          <div className="flex flex-col">
            <span className={`text-lg font-medium ${isStandardSelected ? 'text-[#101828]' : 'text-[#364153]'}`}>
              평균값 사용
            </span>
            <span className="mt-0.5 text-sm text-[#6A7282]">
              {regionLabel} · {venueLabel} 기준 평균 식비 <strong className="font-semibold text-[#373737]">{standardRounded}만원</strong>
            </span>
          </div>
          {isStandardSelected ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#AAC7E1]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10L8.5 13.5L15 6.5" stroke="white" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          ) : (
            <div className="h-6 w-6 shrink-0 rounded-full border-2 border-[#D1D5DC] bg-white" />
          )}
        </button>
      )}

      <p className="pb-2 pt-6 text-sm font-medium text-[#6A7282]">직접 선택하고 싶다면</p>

      <div className="flex flex-col gap-3">
        {MEAL_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={!isStandardSelected && value === o.value}
            label={o.label}
            desc={o.desc}
            icon={o.icon}
            onClick={() => onChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

function YemulStep({ value, onChange }: { value: YemulTier; onChange: (v: YemulTier) => void }) {
  return (
    <div>
      <StepHeader step={9} title="예물은 어떻게 하실건가요?" />
      <div className="flex flex-col gap-3 pt-4">
        {YEMUL_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={value === o.value}
            label={o.label}
            desc={o.desc}
            icon={o.icon}
            onClick={() => onChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

function HoneymoonStep({
  choice, budget, onChoiceChange, onBudgetChange,
}: {
  choice: HoneymoonChoice; budget: number;
  onChoiceChange: (v: HoneymoonChoice) => void; onBudgetChange: (v: number) => void;
}) {
  return (
    <div>
      <StepHeader step={10} title="신혼여행은 계획하고 있나요?" />
      <div className="flex flex-col gap-3 pt-4">
        {choice === 'yes' ? (
          <div className="flex h-[94px] items-center justify-between rounded-[14px] border-2 border-[#AAC7E1] bg-[rgba(170,199,225,0.3)] px-5">
            <span className="text-lg font-medium text-[#101828]">신혼여행 갈 예정</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={budget}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); onBudgetChange(Number(v) || 0); }}
                className="h-[42px] w-[118px] rounded-[9px] border border-[#D1D5DC] bg-white px-3 text-right text-lg font-semibold outline-none focus:border-[#AAC7E1]"
              />
              <span className="text-base text-[#6A7282]">만원</span>
            </div>
          </div>
        ) : (
          <OptionCard
            selected={false}
            label="신혼여행 갈 예정"
            icon="✈️"
            onClick={() => onChoiceChange('yes')}
          />
        )}
        <OptionCard
          selected={choice === 'no'}
          label="미루거나 생략"
          icon="✕"
          onClick={() => onChoiceChange('no')}
        />
      </div>
    </div>
  );
}

function SeasonStep({ season, onSeasonChange }: { season: Season; onSeasonChange: (v: Season) => void }) {
  return (
    <div>
      <StepHeader step={3} title="어느 시기에 예식을 올리고 싶으신가요?" />
      <div className="flex flex-col gap-3 pt-4">
        {SEASON_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={season === o.value}
            label={o.label}
            desc={o.desc}
            icon={o.icon}
            onClick={() => onSeasonChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}


// ── Result ──

function summarizeSelections(s: StepSelections): string {
  const region = REGION_OPTIONS.find((o) => o.value === s.region)?.label ?? '';
  const venue = VENUE_OPTIONS.find((o) => o.value === s.venueType)?.label ?? '';
  const tier = TIER_LABELS[s.studioTier]?.label ?? '';
  const guest = `${s.guestCount}명`;
  const yemul = s.yemulTier === 'custom' ? `예물 ${s.yemulBudget.toLocaleString()}만원` : (YEMUL_OPTIONS.find((o) => o.value === s.yemulTier)?.label ?? '');
  const honeymoon = s.honeymoonChoice === 'yes' ? '신혼여행 포함' : '신혼여행 없음';
  return [region, venue, tier, guest, yemul, honeymoon].join(', ');
}

function ResultView({ result, selections, onReset }: { result: BudgetResult; selections: StepSelections; onReset: () => void }) {
  const includedItems = result.items.filter((i) => !i.skipped);
  const skippedItems = result.items.filter((i) => i.skipped);
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  async function handleShare() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://budgetroad.vercel.app';
    const method = await shareResult({
      totalWon: result.total * 10000,
      summary: summarizeSelections(selections),
      siteUrl,
    });
    trackEvent('share_result', { method });
    if (method === 'clipboard') {
      setToast('링크가 복사되었어요');
    } else if (method === 'failed') {
      setToast('공유에 실패했어요');
    }
  }

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(id);
  }, [toast]);

  const maxAmount = Math.max(...includedItems.map((i) => i.amount));

  // "선택한 조건" 카드용 필드 계산
  const venueLabel = VENUE_OPTIONS.find((o) => o.value === selections.venueType)?.label ?? '';
  const regionLabel = REGION_OPTIONS.find((o) => o.value === selections.region)?.label ?? '';
  const seasonLabel = SEASON_OPTIONS.find((o) => o.value === selections.season)?.label ?? '';
  const yemulLabel = YEMUL_OPTIONS.find((o) => o.value === selections.yemulTier)?.label ?? '';
  const isStandardMeal = !MEAL_OPTIONS.some((o) => o.value === selections.mealCost);
  const mealLabel = isStandardMeal
    ? '지역·예식 기준 평균'
    : `${(selections.mealCost * 10000).toLocaleString()}원`;
  const honeymoonLabel = selections.honeymoonChoice === 'yes'
    ? `${selections.honeymoonBudget.toLocaleString()}만원`
    : '포함 안 함';

  const conditionFields: Array<[string, string]> = [
    ['예식 유형', venueLabel],
    ['지역', regionLabel],
    ['예식 날', seasonLabel],
    ['스튜디오', TIER_LABELS[selections.studioTier].label],
    ['드레스', TIER_LABELS[selections.dressTier].label],
    ['메이크업', TIER_LABELS[selections.makeupTier].label],
    ['보증 인원', `${selections.guestCount}명`],
    ['1인당 식비', mealLabel],
    ['예물', yemulLabel],
    ['신혼여행', honeymoonLabel],
  ];

  return (
    <div className="flex-1 pb-12 pt-8">
      {/* 상단 2-col — 결혼 예상 비용 + 선택한 조건 */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-10">
        {/* 결혼 예상 비용 */}
        <div
          className="flex flex-[1.27] flex-col items-center justify-center rounded-[11.4px] bg-[#FDFDFD] px-[34px] py-[34px] sm:rounded-[19px] sm:px-14 sm:py-[46px]"
          style={{ boxShadow: '0px 11.4px 34px rgba(69, 69, 80, 0.1)' }}
        >
          <div className="flex w-full items-center justify-between pb-[17px] sm:pb-7" style={{ borderBottom: '1.1px solid #BCBCBC' }}>
            <span className="text-[25.6px] font-medium leading-[34px] text-[#656575] lg:text-[42px] lg:leading-[56px]">
              결혼 예상 비용
            </span>
            <span className="shrink-0 rounded-[3px] bg-[#F4F5F7] px-[11px] py-[6px] text-[17px] font-normal leading-[23px] text-[#656575] sm:rounded-[10px] lg:px-[18px] lg:py-[9px] lg:text-[28px] lg:leading-[37px]">
              총합
            </span>
          </div>
          <p className="mt-[17px] whitespace-nowrap text-center text-[40px] font-bold leading-[57px] text-[#01150C] sm:mt-7 lg:text-[65px] lg:leading-[93px]">
            {(result.total * 10000).toLocaleString()}원
          </p>
        </div>

        {/* 선택한 조건 */}
        <div
          className="flex flex-1 flex-col rounded-[18.6px] bg-[#FDFDFD] p-[25px] sm:max-w-[439px] sm:rounded-[24px] sm:p-[32px]"
          style={{ boxShadow: '0px 14.4px 43.3px rgba(69, 69, 80, 0.1)' }}
        >
          <h3 className="pb-[9px] text-[16px] font-bold leading-[22px] text-[#656575] sm:pb-3 sm:text-[21px] sm:leading-[29px]" style={{ borderBottom: '0.84px solid #BCBCBC' }}>
            선택한 조건
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 sm:mt-4 sm:gap-y-[15px]">
            {conditionFields.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-[5px] sm:gap-[7px]">
                <p className="text-[11px] font-normal leading-[17px] text-[#6A7282] sm:text-[13.57px] sm:leading-[22px]">{label}</p>
                <p className="text-[12px] font-bold leading-[18px] text-[#101828] sm:text-[15.5px] sm:leading-[24px]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 항목별 예산 */}
      <div className="mt-12 sm:mt-[50px]">
        <div className="pb-5" style={{ borderBottom: '1.1px solid #BCBCBC' }}>
          <h2 className="text-[32px] font-medium leading-[32px] text-[#101828]">항목별 예산</h2>
        </div>
        <div className="mt-6 flex flex-col gap-6">
          {includedItems.map((item) => {
            const isOpen = expanded.has(item.id);
            const percent = Math.round((item.amount / result.total) * 100);
            const percentFixed = ((item.amount / result.total) * 100).toFixed(1);
            return (
              <div key={item.id} className="flex flex-col gap-4">
                {/* 헤더 */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(item.id)}
                  className="flex w-full items-start justify-between text-left"
                >
                  <div className="flex items-center gap-3 pt-1">
                    <span className="h-6 w-6 shrink-0 rounded-md" style={{ backgroundColor: item.color }} />
                    <span className="text-2xl font-semibold leading-[28px] text-[#101828]">{item.label}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-3">
                      <p className="tabular-nums text-2xl font-semibold leading-[32px] text-[#101828]">
                        {(item.amount * 10000).toLocaleString()}원
                      </p>
                      <svg
                        width="20" height="20" viewBox="0 0 20 20" fill="none"
                        className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      >
                        <path d="M5 7.5L10 12.5L15 7.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <p className="tabular-nums text-sm font-normal text-[#6A7282]">{percentFixed}%</p>
                  </div>
                </button>
                {/* Progress bar */}
                <div className="h-5 w-full overflow-hidden rounded-full bg-[#F3F4F6]">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(percent, 4)}%`, backgroundColor: item.color }} />
                </div>
                {/* 펼친 세부 박스 */}
                {isOpen && item.details && item.details.length > 0 && (
                  <div className="flex flex-col gap-3 rounded-[10px] bg-[#F3F4F6] px-6 py-4">
                    {item.details.map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between">
                        <span className="text-xl font-medium leading-[28px] text-[#101828]">{k}</span>
                        <span className="text-xl font-normal leading-[32px] text-[#101828]">{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {skippedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 shrink-0 rounded-md bg-[#E5E7EB]" />
                <span className="text-xl font-semibold text-[#A3A3A3] sm:text-2xl">{item.label}</span>
              </div>
              <span className="text-base text-[#A3A3A3]">미포함</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-12 text-center text-xs leading-relaxed text-[#6A7282]/50">
        ※ 위 예산은 최근 시장 평균 데이터를 기반으로 한 참고용 추정치입니다.
        <br />
        실제 비용은 업체 시기 협상에 따라 다를 수 있습니다.
      </p>

      {/* CTAs — 좌: 다시하기 (primary 검정) / 우: 결과 공유하기 (secondary 흰) */}
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-[37px]">
        <button
          onClick={onReset}
          className="flex min-h-[78px] flex-1 items-center justify-center gap-3 rounded-3xl border border-[#E5E7EB] bg-[#373737] text-xl font-medium text-white active:scale-[0.99]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 21v-5h5" />
          </svg>
          다시하기
        </button>
        <button
          onClick={handleShare}
          className="flex min-h-[78px] flex-1 items-center justify-center gap-3 rounded-3xl border border-[#E5E7EB] bg-white text-xl font-medium text-[#101828] active:scale-[0.99]"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#364153" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6" />
            <path d="M9 21H3v-6" />
            <path d="M21 3l-7 7" />
            <path d="M3 21l7-7" />
          </svg>
          결과 공유하기
        </button>
      </div>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center">
          <div className="rounded-full bg-[#373737] px-5 py-3 text-sm text-white shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
