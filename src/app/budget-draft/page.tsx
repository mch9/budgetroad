'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/gtag';
import {
  type Region,
  type VenueType,
  type Season,
  type Tier,
  type YemulTier,
  type YedanChoice,
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
  YEDAN_OPTIONS,
  HONEYMOON_OPTIONS,
  calculateBudget,
} from '@/lib/budget-data';

const TOTAL_STEPS = 6;

export default function BudgetDraftPage() {
  const [step, setStep] = useState(0); // 0-5 = steps, 6 = result
  const [selections, setSelections] = useState<StepSelections>(DEFAULT_SELECTIONS);
  const [result, setResult] = useState<BudgetResult | null>(null);
  const enteredAt = useRef(Date.now());
  const inputStarted = useRef(false);

  useEffect(() => {
    trackEvent('budget_draft_entered');
  }, []);

  function trackFirstInput() {
    if (inputStarted.current) return;
    inputStarted.current = true;
    const elapsed = Math.round((Date.now() - enteredAt.current) / 1000);
    trackEvent('input_started', { time_to_start_sec: elapsed });
  }

  function update<K extends keyof StepSelections>(key: K, value: StepSelections[K]) {
    trackFirstInput();
    setSelections((prev) => ({ ...prev, [key]: value }));
  }

  function next() {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const r = calculateBudget(selections);
      trackEvent('result_viewed', { total_amount: r.total });
      setResult(r);
      setStep(TOTAL_STEPS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function back() {
    if (step > 0) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function reset() {
    setStep(0);
    setSelections(DEFAULT_SELECTIONS);
    setResult(null);
  }

  const isResult = step === TOTAL_STEPS;

  return (
    <div className="flex min-h-dvh flex-col bg-[#FFF8F0]">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between bg-white/80 px-6 backdrop-blur-sm">
        <Link href="/" className="text-lg font-extrabold text-primary">
          버젯로드
        </Link>
        {isResult && (
          <button onClick={reset} className="text-sm font-medium text-primary">
            ← 다시 하기
          </button>
        )}
        {!isResult && step > 0 && (
          <button onClick={back} className="text-sm font-medium text-muted-foreground">
            ← 이전
          </button>
        )}
      </header>

      {/* Progress */}
      {!isResult && (
        <div className="px-6">
          <div className="h-1 w-full rounded-full bg-gray-200">
            <div
              className="h-1 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex flex-1 flex-col">
        {step === 0 && <Step1 value={selections.region} onChange={(v) => update('region', v)} />}
        {step === 1 && (
          <Step2
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
            onGuestChange={(v) => update('guestCount', v)}
            onMealChange={(v) => update('mealCost', v)}
          />
        )}
        {step === 4 && (
          <Step5
            yemul={selections.yemulTier}
            yedan={selections.yedanChoice}
            onYemulChange={(v) => update('yemulTier', v)}
            onYedanChange={(v) => update('yedanChoice', v)}
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
        {isResult && result && <ResultView result={result} onReset={reset} />}
      </main>

      {/* Bottom Button */}
      {!isResult && (
        <div className="px-6 pb-8 pt-4">
          <button
            onClick={next}
            className="w-full rounded-2xl bg-primary py-4 text-base font-semibold text-white shadow-[0_4px_12px_rgba(255,132,0,0.25)] active:scale-[0.99]"
          >
            {step === TOTAL_STEPS - 1 ? '예산 결과 보기 →' : '다음'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Shared Components ──

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="space-y-2 px-6 pb-2 pt-8">
      <p className="text-sm font-semibold text-primary">STEP {step}</p>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return <p className="px-6 pb-2 pt-5 text-xs font-medium text-gray-400">{label}</p>;
}

function OptionCard<T extends string | number>({
  selected,
  label,
  desc,
  icon,
  isSkip,
  onClick,
}: {
  selected: boolean;
  label: string;
  desc: string;
  icon: string;
  isSkip?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all ${
        selected
          ? 'border-primary bg-orange-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
          selected ? 'bg-primary' : 'bg-gray-100'
        }`}
      >
        {isSkip ? (
          <span className={`text-base font-bold ${selected ? 'text-white' : 'text-gray-400'}`}>✕</span>
        ) : (
          icon
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold text-gray-900 ${selected ? 'font-bold' : ''}`}>{label}</p>
        <p className={`text-xs ${selected ? 'text-primary' : 'text-gray-400'}`}>{desc}</p>
      </div>
      <div
        className={`h-5 w-5 shrink-0 rounded-full border-2 ${
          selected ? 'border-primary bg-primary' : 'border-gray-300'
        }`}
      />
    </button>
  );
}

// ── Steps ──

function Step1({ value, onChange }: { value: Region; onChange: (v: Region) => void }) {
  return (
    <div>
      <StepHeader step={1} title="어디서 결혼하시나요?" subtitle="지역에 따라 예산 평균이 달라져요" />
      <div className="flex flex-col gap-3 px-6 pt-4">
        {REGION_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={value === o.value} label={o.label} desc={o.desc} icon={o.icon} onClick={() => onChange(o.value)} />
        ))}
      </div>
    </div>
  );
}

function Step2({
  venue, season, onVenueChange, onSeasonChange,
}: {
  venue: VenueType; season: Season;
  onVenueChange: (v: VenueType) => void; onSeasonChange: (v: Season) => void;
}) {
  return (
    <div>
      <StepHeader step={2} title="어떤 예식을 생각하세요?" subtitle="예식장 유형과 시기를 선택해주세요" />
      <SectionLabel label="예식장 유형" />
      <div className="flex flex-col gap-2.5 px-6">
        {VENUE_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={venue === o.value} label={o.label} desc={o.desc} icon={o.icon} onClick={() => onVenueChange(o.value)} />
        ))}
      </div>
      <SectionLabel label="예식 시기" />
      <div className="flex flex-col gap-2.5 px-6">
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
      <div className="flex flex-col gap-2.5 px-6">
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
      <TierSelector label="스튜디오" icon="📷" value={studio} onChange={onStudioChange} />
      <TierSelector label="드레스" icon="👗" value={dress} onChange={onDressChange} />
      <TierSelector label="메이크업" icon="💄" value={makeup} onChange={onMakeupChange} />
    </div>
  );
}

function Step4({
  guest, meal, onGuestChange, onMealChange,
}: {
  guest: number; meal: number;
  onGuestChange: (v: number) => void; onMealChange: (v: number) => void;
}) {
  const [customGuest, setCustomGuest] = useState(false);
  const [customMeal, setCustomMeal] = useState(false);

  return (
    <div>
      <StepHeader step={4} title="식사는 어떻게 하실 건가요?" subtitle="예상 인원과 식사 비용을 선택해주세요" />
      <SectionLabel label="예상 보증인원" />
      <div className="flex flex-col gap-2.5 px-6">
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
          <div className="flex items-center gap-2 rounded-xl border-2 border-primary bg-orange-50 p-3.5">
            <span className="text-sm text-gray-500">인원:</span>
            <input
              type="number"
              value={guest}
              onChange={(e) => onGuestChange(Number(e.target.value) || 100)}
              className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-center font-mono text-sm font-semibold outline-none focus:border-primary"
            />
            <span className="text-sm text-gray-500">명</span>
          </div>
        ) : (
          <button
            onClick={() => setCustomGuest(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-white p-3.5 text-sm font-medium text-gray-400"
          >
            ✏️ 직접 입력
          </button>
        )}
      </div>
      <SectionLabel label="1인당 식사 비용" />
      <div className="flex flex-col gap-2.5 px-6">
        {MEAL_OPTIONS.map((o) => (
          <OptionCard
            key={o.value}
            selected={!customMeal && meal === o.value}
            label={o.label}
            desc={o.desc}
            icon={o.icon}
            onClick={() => { setCustomMeal(false); onMealChange(o.value); }}
          />
        ))}
        {customMeal ? (
          <div className="flex items-center gap-2 rounded-xl border-2 border-primary bg-orange-50 p-3.5">
            <span className="text-sm text-gray-500">1인당:</span>
            <input
              type="number"
              value={meal}
              onChange={(e) => onMealChange(Number(e.target.value) || 5)}
              className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-center font-mono text-sm font-semibold outline-none focus:border-primary"
            />
            <span className="text-sm text-gray-500">만원</span>
          </div>
        ) : (
          <button
            onClick={() => setCustomMeal(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-white p-3.5 text-sm font-medium text-gray-400"
          >
            ✏️ 직접 입력
          </button>
        )}
      </div>
    </div>
  );
}

function Step5({
  yemul, yedan, onYemulChange, onYedanChange,
}: {
  yemul: YemulTier; yedan: YedanChoice;
  onYemulChange: (v: YemulTier) => void; onYedanChange: (v: YedanChoice) => void;
}) {
  return (
    <div>
      <StepHeader step={5} title="예물과 예단은요?" subtitle="생략해도 괜찮아요, 선택은 자유입니다" />
      <SectionLabel label="예물" />
      <div className="flex flex-col gap-2.5 px-6">
        {YEMUL_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={yemul === o.value} label={o.label} desc={o.desc} icon={o.icon} isSkip={o.value === 'skip'} onClick={() => onYemulChange(o.value)} />
        ))}
      </div>
      <SectionLabel label="예단" />
      <div className="flex flex-col gap-2.5 px-6">
        {YEDAN_OPTIONS.map((o) => (
          <OptionCard key={o.value} selected={yedan === o.value} label={o.label} desc={o.desc} icon={o.icon} isSkip={o.value === 'skip'} onClick={() => onYedanChange(o.value)} />
        ))}
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
      <div className="flex flex-col gap-2.5 px-6 pt-6">
        {/* 신혼여행 갈 예정 — 금액 수정 포함 */}
        <button
          onClick={() => onChoiceChange('yes')}
          className={`w-full rounded-xl border-2 p-3.5 text-left transition-all ${
            choice === 'yes' ? 'border-primary bg-orange-50' : 'border-gray-200 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${choice === 'yes' ? 'bg-primary' : 'bg-gray-100'}`}>
              ✈️
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-semibold text-gray-900 ${choice === 'yes' ? 'font-bold' : ''}`}>신혼여행 갈 예정</p>
              <p className={`text-xs ${choice === 'yes' ? 'text-primary' : 'text-gray-400'}`}>기본 예산 1,000만원</p>
            </div>
            <div className={`h-5 w-5 shrink-0 rounded-full border-2 ${choice === 'yes' ? 'border-primary bg-primary' : 'border-gray-300'}`} />
          </div>
          {choice === 'yes' && (
            <div className="mt-3 flex items-center justify-between rounded-lg border border-orange-200 bg-white px-3 py-2" onClick={(e) => e.stopPropagation()}>
              <span className="text-xs text-gray-400">예산 금액</span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => onBudgetChange(Number(e.target.value) || 500)}
                  className="w-20 rounded border border-gray-200 bg-white px-2 py-1 text-right font-mono text-sm font-semibold outline-none focus:border-primary"
                />
                <span className="text-xs text-gray-400">만원</span>
              </div>
            </div>
          )}
        </button>

        {/* 생략 */}
        <OptionCard
          selected={choice === 'no'}
          label="생략"
          desc="신혼여행 없이 진행"
          icon="✕"
          isSkip
          onClick={() => onChoiceChange('no')}
        />
      </div>
    </div>
  );
}

// ── Result ──

function ResultView({ result, onReset }: { result: BudgetResult; onReset: () => void }) {
  const includedItems = result.items.filter((i) => !i.skipped);
  const skippedItems = result.items.filter((i) => i.skipped);

  // Donut chart
  const conicSegments = includedItems
    .reduce<Array<{ color: string; start: number; end: number }>>((acc, item) => {
      const pct = result.total > 0 ? (item.amount / result.total) * 360 : 0;
      const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
      acc.push({ color: item.color, start, end: start + pct });
      return acc;
    }, []);

  const conicGradient = conicSegments
    .map((s) => `${s.color} ${s.start}deg ${s.end}deg`)
    .join(', ');

  const maxAmount = Math.max(...includedItems.map((i) => i.amount));

  return (
    <div className="flex-1 pb-8">
      {/* Progress full */}
      <div className="px-6">
        <div className="h-1 w-full rounded-full bg-primary" />
      </div>

      <div className="px-6 pb-2 pt-6 text-center">
        <h1 className="text-lg font-bold text-gray-900">예산 결과</h1>
      </div>

      {/* Chart Card */}
      <div className="px-5 pt-4">
        <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-8 shadow-sm">
          {/* Donut */}
          <div className="relative h-[200px] w-[200px]">
            <div
              className="h-full w-full rounded-full"
              style={{
                background: `conic-gradient(${conicGradient})`,
                WebkitMask: 'radial-gradient(circle, transparent 55%, black 56%)',
                mask: 'radial-gradient(circle, transparent 55%, black 56%)',
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-gray-400">총 예산</span>
              <span className="mt-1 font-mono text-2xl font-bold text-gray-900">
                {result.total.toLocaleString()}만원
              </span>
              <span className="mt-1 text-[10px] text-gray-300">
                {result.totalMin.toLocaleString()} ~ {result.totalMax.toLocaleString()}만
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 grid w-full grid-cols-2 gap-x-6 gap-y-2.5">
            {result.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-gray-900">{item.label}</span>
                <span className="ml-auto font-mono text-sm text-gray-400">
                  {item.skipped
                    ? '미포함'
                    : `${Math.round((item.amount / result.total) * 100)}%`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Card */}
      <div className="px-5 pt-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900">항목별 예산 상세</h2>
          <div className="mt-4 flex flex-col divide-y divide-gray-100">
            {includedItems.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
                <div className="flex items-center">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    {item.icon}
                  </div>
                  <span className="ml-2 text-sm font-semibold text-gray-900">{item.label}</span>
                  <span className="ml-auto font-mono text-base font-bold text-gray-900">
                    {item.amount.toLocaleString()}만원
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(item.amount / maxAmount) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                {item.range && (
                  <p className="text-right text-[11px] text-gray-300">{item.range}</p>
                )}
              </div>
            ))}
            {skippedItems.map((item) => (
              <div key={item.id} className="flex items-center py-4 last:pb-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm">
                  {item.icon}
                </div>
                <span className="ml-2 text-sm font-semibold text-gray-300">{item.label}</span>
                <span className="ml-auto text-sm text-gray-300">미포함</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="px-8 pt-5 text-center text-[11px] leading-relaxed text-gray-300">
        ※ 위 예산은 최근 시장 평균 데이터를 기반으로 한 참고용 추정치입니다.
        <br />
        실제 비용은 업체 시기 협상에 따라 다를 수 있습니다.
      </p>

      {/* CTAs */}
      <div className="flex flex-col gap-3 px-6 pt-6">
        <button
          onClick={onReset}
          className="w-full rounded-2xl bg-gray-900 py-4 text-base font-semibold text-white active:scale-[0.99]"
        >
          조건 바꿔서 재계산하기
        </button>
        <button className="w-full rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-500 active:scale-[0.99]">
          ↗ 결과 공유하기
        </button>
      </div>
    </div>
  );
}
