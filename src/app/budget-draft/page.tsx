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
  HONEYMOON_OPTIONS,
  STANDARD_MEAL_PRICES,
  calculateBudget,
  isVenueDisabled,
} from '@/lib/budget-data';

const TOTAL_STEPS = 6;
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
        if (parsed.result && parsed.selections) {
          setResult(parsed.result as BudgetResult);
          setSelections(parsed.selections as StepSelections);
        } else {
          setResult(parsed as BudgetResult);
        }
        setStep(TOTAL_STEPS);
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
        {isResult && (
          <button onClick={reset} className="text-sm font-medium text-[#6A7282]">
            ← 다시 하기
          </button>
        )}
        {!isResult && step > 0 && (
          <button onClick={back} className="text-sm font-medium text-[#6A7282]">
            ← 이전
          </button>
        )}
      </header>

      {/* Progress — Figma: labels + 8px bar, track #E5E7EB, fill #AAC7E1 */}
      {!isResult && (
        <div className="mx-auto w-full max-w-[576px] px-6 pt-6">
          <div className="flex items-center justify-between pb-2">
            <span className="text-sm text-[#6A7282]">단계 {step + 1} / {TOTAL_STEPS}</span>
            <span className="text-sm text-[#6A7282]">{progressPct}% 완료</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#E5E7EB]">
            <div
              className="h-2 rounded-full bg-[#AAC7E1] transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className={`mx-auto flex w-full flex-1 flex-col px-6 ${isResult ? 'max-w-[1040px]' : 'max-w-[576px] pb-32 sm:pb-0'}`}>
        {step === 0 && <Step1 value={selections.region} onChange={updateRegion} />}
        {step === 1 && (
          <Step2
            region={selections.region}
            venue={selections.venueType}
            season={selections.season}
            onVenueChange={(v) => update('venueType', v)}
            onSeasonChange={(v) => update('season', v)}
          />
        )}
        {step === 2 && (
          <Step3
            studio={selections.studioTier}
            dress={selections.dressTier}
            makeup={selections.makeupTier}
            onStudioChange={(v) => update('studioTier', v)}
            onDressChange={(v) => update('dressTier', v)}
            onMakeupChange={(v) => update('makeupTier', v)}
          />
        )}
        {step === 3 && (
          <Step4
            guest={selections.guestCount}
            meal={selections.mealCost}
            region={selections.region}
            venueType={selections.venueType}
            onGuestChange={(v) => update('guestCount', v)}
            onMealChange={(v) => update('mealCost', v)}
          />
        )}
        {step === 4 && (
          <Step5
            yemul={selections.yemulTier}
            yemulBudget={selections.yemulBudget}
            onYemulChange={(v) => update('yemulTier', v)}
            onYemulBudgetChange={(v) => update('yemulBudget', v)}
          />
        )}
        {step === 5 && (
          <Step6
            choice={selections.honeymoonChoice}
            budget={selections.honeymoonBudget}
            onChoiceChange={(v) => update('honeymoonChoice', v)}
            onBudgetChange={(v) => update('honeymoonBudget', v)}
          />
        )}
        {isResult && result && <ResultView result={result} selections={selections} onReset={reset} />}
      </main>

      {/* Bottom Button — mobile: fixed floating bar / desktop: inline */}
      {!isResult && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E7EB] bg-[#F9FAFB]/90 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          <div className="mx-auto w-full max-w-[576px] sm:px-6 sm:pb-8 sm:pt-4">
            <button
              onClick={next}
              className="w-full rounded-[14px] bg-[#373737] py-4 text-lg font-medium text-white active:scale-[0.99]"
            >
              {step === TOTAL_STEPS - 1 ? '예산 결과 보기' : '다음으로'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared Components ──

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="space-y-1.5 pb-2 pt-8">
      <p className="text-sm text-[#6A7282]">STEP {step}</p>
      <h1 className="text-[30px] font-bold leading-9 text-[#373737]">{title}</h1>
      <p className="text-base text-[#6A7282]">{subtitle}</p>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <p className="pb-2 pt-5 text-xs font-medium text-[#6A7282]">{label}</p>;
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
  desc: string;
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
        className="flex w-full cursor-not-allowed items-center justify-between rounded-[14px] border-2 border-[#F3F4F6] bg-[#F9FAFB] p-5 text-left"
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
      className={`flex w-full items-center justify-between rounded-[14px] border-2 p-5 text-left transition-all ${
        selected
          ? 'border-[#AAC7E1] bg-[rgba(170,199,225,0.3)]'
          : 'border-[#E5E7EB] bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${
            selected ? 'bg-[#AAC7E1] text-white' : 'bg-transparent'
          }`}
        >
          {selected ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : isSkip ? (
            <span className="text-[#D1D5DC]">✕</span>
          ) : null}
        </div>
        <span className={`text-lg font-medium ${selected ? 'text-[#101828]' : 'text-[#364153]'}`}>
          {label}
        </span>
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
      <StepHeader step={1} title="어디서 결혼하시나요?" subtitle="지역을 선택하면 지역별 시세가 반영됩니다" />
      <div className="flex flex-col gap-3 pt-4">
        {REGION_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={value === o.value} label={o.label} desc={o.desc} icon={o.icon} onClick={() => onChange(o.value)} />
        ))}
      </div>
    </div>
  );
}

function Step2({
  region, venue, season, onVenueChange, onSeasonChange,
}: {
  region: Region; venue: VenueType; season: Season;
  onVenueChange: (v: VenueType) => void; onSeasonChange: (v: Season) => void;
}) {
  return (
    <div>
      <StepHeader step={2} title="어떤 예식을 생각하세요?" subtitle="예식장 유형과 시기를 선택해주세요" />
      <SectionLabel label="예식장 유형" />
      <div className="flex flex-col gap-3">
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
      <SectionLabel label="예식 시기" />
      <div className="flex flex-col gap-3">
        {SEASON_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={season === o.value} label={o.label} desc={o.desc} icon={o.icon} onClick={() => onSeasonChange(o.value)} />
        ))}
      </div>
    </div>
  );
}

function TierSelector({ label, icon, value, onChange }: { label: string; icon: string; value: Tier; onChange: (v: Tier) => void }) {
  const tiers: Tier[] = ['simple', 'standard', 'luxury'];
  return (
    <>
      <SectionLabel label={label} />
      <div className="flex flex-col gap-3">
        {tiers.map((t) => (
          <OptionCard
            key={t}
            selected={value === t}
            label={TIER_LABELS[t].label}
            desc={TIER_LABELS[t].desc}
            icon={icon}
            onClick={() => onChange(t)}
          />
        ))}
      </div>
    </>
  );
}

function Step3({
  studio, dress, makeup, onStudioChange, onDressChange, onMakeupChange,
}: {
  studio: Tier; dress: Tier; makeup: Tier;
  onStudioChange: (v: Tier) => void; onDressChange: (v: Tier) => void; onMakeupChange: (v: Tier) => void;
}) {
  return (
    <div>
      <StepHeader step={3} title="스드메는 어떻게 하실 건가요?" subtitle="스튜디오, 드레스, 메이크업 등급을 선택해주세요" />
      <TierSelector label="스튜디오" icon="" value={studio} onChange={onStudioChange} />
      <TierSelector label="드레스" icon="" value={dress} onChange={onDressChange} />
      <TierSelector label="메이크업" icon="" value={makeup} onChange={onMakeupChange} />
    </div>
  );
}

function Step4({
  guest, meal, region, venueType, onGuestChange, onMealChange,
}: {
  guest: number; meal: number; region: Region; venueType: VenueType;
  onGuestChange: (v: number) => void; onMealChange: (v: number) => void;
}) {
  const [customGuest, setCustomGuest] = useState(false);
  const standardMeal = STANDARD_MEAL_PRICES[region]?.[venueType];
  const isPreset = MEAL_OPTIONS.some((o) => o.value === meal);

  // 표준 가격으로 초기값 세팅 (Step4 첫 진입 시)
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current && standardMeal) {
      initialized.current = true;
      onMealChange(Math.round(standardMeal));
    }
  }, []);

  return (
    <div>
      <StepHeader step={4} title="식사는 어떻게 하실 건가요?" subtitle="예상 인원과 식사 비용을 선택해주세요" />
      <SectionLabel label="예상 보증인원" />
      <div className="flex flex-col gap-3">
        {GUEST_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={!customGuest && guest === o.value}
            label={o.label}
            desc={o.desc}
            icon={o.icon}
            onClick={() => { setCustomGuest(false); onGuestChange(o.value); }}
          />
        ))}
        {customGuest ? (
          <div className="flex items-center justify-between rounded-[14px] border-2 border-[#AAC7E1] bg-[rgba(170,199,225,0.3)] p-5">
            <span className="text-base font-medium text-[#364153]">보증인원</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={guest}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); onGuestChange(Number(v) || 0); }}
                className="w-28 rounded-lg border border-[#D1D5DC] bg-white px-4 py-2.5 text-right text-lg font-semibold outline-none focus:border-[#AAC7E1]"
              />
              <span className="text-base text-[#6A7282]">명</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setCustomGuest(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed border-[#E5E7EB] bg-white p-5 text-sm font-medium text-[#6A7282]"
          >
            직접 입력
          </button>
        )}
      </div>
      <SectionLabel label="1인당 식사 비용" />
      <div className="flex flex-col gap-3">
        {/* 직접 입력 (표준 가격 세팅) — 첫 번째 항목 */}
        <div className={`flex items-center justify-between rounded-[14px] border-2 p-5 transition-all ${
          !isPreset ? 'border-[#AAC7E1] bg-[rgba(170,199,225,0.3)]' : 'border-[#E5E7EB] bg-white'
        }`}>
          <div>
            <span className={`text-base font-medium ${!isPreset ? 'text-[#101828]' : 'text-[#364153]'}`}>
              직접 입력
            </span>
            {standardMeal && (
              <p className="text-xs text-[#6A7282]">
                표준 가격: {standardMeal.toLocaleString()}만원
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={meal}
              onChange={(e) => {
                const v = e.target.value.replace(/[^0-9]/g, '');
                onMealChange(Number(v) || 0);
              }}
              className="w-28 rounded-lg border border-[#D1D5DC] bg-white px-4 py-2.5 text-right text-lg font-semibold outline-none focus:border-[#AAC7E1]"
            />
            <span className="text-base text-[#6A7282]">만원</span>
          </div>
        </div>
        {/* 프리셋 옵션 */}
        {MEAL_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={meal === o.value}
            label={o.label}
            desc={o.desc}
            icon={o.icon}
            onClick={() => onMealChange(o.value)}
          />
        ))}
      </div>
    </div>
  );
}

function Step5({
  yemul, yemulBudget, onYemulChange, onYemulBudgetChange,
}: {
  yemul: YemulTier; yemulBudget: number;
  onYemulChange: (v: YemulTier) => void; onYemulBudgetChange: (v: number) => void;
}) {
  return (
    <div>
      <StepHeader step={5} title="예물은 어떻게 하실 건가요?" subtitle="생략해도 괜찮아요, 선택은 자유입니다" />
      <SectionLabel label="예물" />
      <div className="flex flex-col gap-3">
        {YEMUL_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={yemul === o.value} label={o.label} desc={o.desc} icon={o.icon} isSkip={o.value === 'skip'} onClick={() => onYemulChange(o.value)} />
        ))}
        {/* 직접 입력 옵션 */}
        {yemul === 'custom' ? (
          <div className="flex items-center justify-between rounded-[14px] border-2 border-[#AAC7E1] bg-[rgba(170,199,225,0.3)] p-5">
            <span className="text-base font-medium text-[#101828]">직접 입력</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={yemulBudget}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); onYemulBudgetChange(Number(v) || 0); }}
                className="w-28 rounded-lg border border-[#D1D5DC] bg-white px-4 py-2.5 text-right text-lg font-semibold outline-none focus:border-[#AAC7E1]"
              />
              <span className="text-base text-[#6A7282]">만원</span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onYemulChange('custom')}
            className="flex w-full items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed border-[#E5E7EB] bg-white p-5 text-base font-medium text-[#6A7282]"
          >
            직접 입력
          </button>
        )}
      </div>
    </div>
  );
}

function Step6({
  choice, budget, onChoiceChange, onBudgetChange,
}: {
  choice: HoneymoonChoice; budget: number;
  onChoiceChange: (v: HoneymoonChoice) => void; onBudgetChange: (v: number) => void;
}) {
  return (
    <div>
      <StepHeader step={6} title="신혼여행은 계획하고 있나요?" subtitle="마지막 단계예요! 거의 다 왔어요" />
      <div className="flex flex-col gap-3 pt-6">
        {choice === 'yes' ? (
          <div className="flex items-center justify-between rounded-[14px] border-2 border-[#AAC7E1] bg-[rgba(170,199,225,0.3)] p-5">
            <span className="text-base font-medium text-[#101828]">신혼여행 갈 예정</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={budget}
                onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); onBudgetChange(Number(v) || 0); }}
                className="w-28 rounded-lg border border-[#D1D5DC] bg-white px-4 py-2.5 text-right text-lg font-semibold outline-none focus:border-[#AAC7E1]"
              />
              <span className="text-base text-[#6A7282]">만원</span>
            </div>
          </div>
        ) : (
          <OptionCard
            selected={false}
            label="신혼여행 갈 예정"
            desc="기본 예산 1,000만원"
            icon=""
            onClick={() => onChoiceChange('yes')}
          />
        )}

        <OptionCard
          selected={choice === 'no'}
          label="생략"
          desc="신혼여행 없이 진행"
          icon=""
          isSkip
          onClick={() => onChoiceChange('no')}
        />
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

  // Pie chart SVG segments with white borders
  const pieSegments = includedItems.reduce<Array<{ color: string; startAngle: number; endAngle: number }>>((acc, item) => {
    const angle = result.total > 0 ? (item.amount / result.total) * 360 : 0;
    const start = acc.length > 0 ? acc[acc.length - 1].endAngle : -90;
    acc.push({ color: item.color, startAngle: start, endAngle: start + angle });
    return acc;
  }, []);

  const maxAmount = Math.max(...includedItems.map((i) => i.amount));

  return (
    <div className="flex-1 pb-12 pt-8">
      {/* Top section — Figma: Card 670px + Statistics 320px, gap ~43px */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-10">
        {/* Card — Total amount (Figma: 670.82x443, left) */}
        <div
          className="flex min-h-[300px] flex-[2.1] flex-col items-center justify-center rounded-[19px] bg-[#FDFDFD] px-6 py-10 sm:min-h-[443px] sm:px-14"
          style={{ boxShadow: '0px 19px 56px rgba(69, 69, 80, 0.1)' }}
        >
          {/* Header — border-bottom 2.33px solid rgba(163,163,163,0.2) */}
          <div className="flex w-full items-center justify-between pb-5" style={{ borderBottom: '2.33px solid rgba(163, 163, 163, 0.2)' }}>
            <span className="text-lg font-medium text-[#656575] sm:text-2xl lg:text-[32px] lg:leading-[44px]">결혼 예상 비용</span>
            <span className="rounded-md bg-[#F4F5F7] px-3 py-1.5 text-xs font-normal text-[#656575] sm:px-5 sm:py-2.5 sm:text-base">
              총합
            </span>
          </div>
          {/* Amount — Figma: Pretendard 700 65px */}
          <p className="mt-6 whitespace-nowrap text-center text-2xl font-bold text-[#01150C] sm:mt-7 sm:text-[40px] sm:leading-[1.4] lg:text-[52px]">
            {(result.total * 10000).toLocaleString()}원
          </p>
          {/* Selection summary — Figma: Pretendard 500 33px, #525256 */}
          <p className="mt-2 text-center text-sm font-medium text-[#525256] sm:text-base lg:text-lg">
            {summarizeSelections(selections)}
          </p>
        </div>

        {/* Statistics — Pie chart + legend (Figma: 319.45x442.88, right) */}
        <div
          className="flex flex-1 flex-col items-center rounded-[10px] bg-[#FDFDFD] p-6 sm:max-w-[320px] sm:p-7"
          style={{ boxShadow: '0px 9px 28px rgba(69, 69, 80, 0.1)' }}
        >
          {/* Donut chart — ring style, white gaps between segments */}
          <svg viewBox="0 0 200 200" className="h-[160px] w-[160px] shrink-0 sm:h-[175px] sm:w-[175px]">
            {pieSegments.map((seg, i) => {
              const cx = 100, cy = 100, r = 70;
              const startRad = (seg.startAngle * Math.PI) / 180;
              const endRad = (seg.endAngle * Math.PI) / 180;
              const x1 = cx + r * Math.cos(startRad);
              const y1 = cy + r * Math.sin(startRad);
              const x2 = cx + r * Math.cos(endRad);
              const y2 = cy + r * Math.sin(endRad);
              const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
              return (
                <path
                  key={i}
                  d={`M${x1},${y1} A${r},${r} 0 ${largeArc} 1 ${x2},${y2}`}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="30"
                  strokeLinecap="butt"
                />
              );
            })}
          </svg>

          {/* Legend — Figma: Inter 19px, #1A1919, circle 19px */}
          <div className="mt-7 flex w-full flex-col gap-2.5">
            {includedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="h-[19px] w-[19px] shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[15px] text-[#1A1919] sm:text-[19px]">{item.label}</span>
                </div>
                <span className="text-[15px] text-[#1A1919] sm:text-[19px]">
                  {Math.round((item.amount / result.total) * 100)}%
                </span>
              </div>
            ))}
            {skippedItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="h-[19px] w-[19px] shrink-0 rounded-full bg-[#D1D5DC]" />
                  <span className="text-[15px] text-[#A3A3A3] sm:text-[19px]">{item.label}</span>
                </div>
                <span className="text-[15px] text-[#A3A3A3] sm:text-[19px]">미포함</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item detail section — Figma: "항목별 예산", 1016px, border-bottom separated */}
      <div className="mt-10">
        <h2 className="text-xl font-medium text-[#101828] sm:text-2xl">항목별 예산</h2>
        <div className="mt-8 flex flex-col">
          {includedItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 border-b border-[#E5E7EB] py-5 first:pt-0">
              {/* Row: label + amount */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="h-6 w-6 shrink-0 rounded-[6px]"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-lg font-medium text-[#101828] sm:text-xl">{item.label}</span>
                </div>
                <div className="text-right">
                  <p className="tabular-nums text-lg text-[#101828] sm:text-2xl">
                    {(item.amount * 10000).toLocaleString()}원
                  </p>
                  <p className="text-sm text-[#6A7282]">
                    {Math.round((item.amount / result.total) * 100)}%
                  </p>
                </div>
              </div>
              {/* Bar */}
              <div className="h-2 w-full rounded-full bg-[#F3F4F6]">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${(item.amount / maxAmount) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
          {skippedItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-[#E5E7EB] py-5">
              <div className="flex items-center gap-3">
                <span className="h-6 w-6 shrink-0 rounded-[6px] bg-[#E5E7EB]" />
                <span className="text-lg font-medium text-[#A3A3A3] sm:text-xl">{item.label}</span>
              </div>
              <span className="text-lg text-[#A3A3A3]">미포함</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-8 text-center text-xs leading-relaxed text-[#6A7282]/50">
        ※ 위 예산은 최근 시장 평균 데이터를 기반으로 한 참고용 추정치입니다.
        <br />
        실제 비용은 업체 시기 협상에 따라 다를 수 있습니다.
      </p>

      {/* CTAs — Figma: 672px, 78px height, border-radius 24px */}
      <div className="mx-auto mt-10 flex w-full max-w-[672px] flex-col gap-3">
        <button
          onClick={onReset}
          className="flex h-[78px] w-full items-center justify-center rounded-3xl bg-[#373737] text-xl font-medium text-white active:scale-[0.99]"
        >
          조건 바꿔서 재계산하기
        </button>
        <button
          onClick={handleShare}
          className="flex h-[78px] w-full items-center justify-center gap-3 rounded-3xl border border-[#E5E7EB] bg-white text-xl font-medium text-[#101828] active:scale-[0.99]"
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
