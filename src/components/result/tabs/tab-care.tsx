'use client';

import type { ResultPayload, ToggleId, ToggleState, ToggleGroup } from '@/lib/budget-engine';
import { TOGGLES_META, TOGGLE_PRICES } from '@/lib/budget-engine';

type Props = {
  result: ResultPayload;
  toggles: ToggleState;
  setToggle: (id: ToggleId, on: boolean) => void;
  setAllToggles: (on: boolean) => void;
};

const GROUP_ORDER: ToggleGroup[] = ['예식장', '스튜디오', '드레스', '메이크업'];

export function TabCare({ result, toggles, setToggle, setAllToggles }: Props) {
  const grouped: Record<ToggleGroup, typeof TOGGLES_META> = {
    예식장: [],
    스튜디오: [],
    드레스: [],
    메이크업: [],
  };
  for (const t of TOGGLES_META) grouped[t.group].push(t);

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-5">
      {/* 컨트롤 바 — 좌 모두 끄기(검정 secondary) / 우 전체 켜기(액센트 primary) */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={() => setAllToggles(false)}
          className="text-sm font-medium text-[#373737]"
        >
          모두 끄기
        </button>
        <button
          type="button"
          onClick={() => setAllToggles(true)}
          className="text-sm font-bold text-[#7499BA]"
        >
          전체 켜기
        </button>
      </div>

      {/* 4 그룹 */}
      {GROUP_ORDER.map((group) => (
        <section key={group} className="flex flex-col gap-2">
          <h3 className="px-1 pt-2 text-sm font-semibold text-[#373737]">{group}</h3>
          <div className="overflow-hidden rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white">
            {grouped[group].map((t, idx) => {
              const on = toggles[t.id];
              const isDefaultOn = t.defaultByType[result.vars.persona] === true;
              const isAutoApplied = on && isDefaultOn;
              const price =
                TOGGLE_PRICES[t.id]?.[result.vars.region]?.[result.vars.season] ?? null;
              return (
                <div
                  key={t.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    idx > 0 ? 'border-t border-[#F5F5F5]' : ''
                  }`}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'rgba(170,199,225,0.3)' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7499BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-[#171717]">{t.label}</span>
                    <span className="truncate text-xs text-[#737373]">
                      {price !== null ? `+${price.toLocaleString()}만원` : '가격 미정'} · {t.desc}
                    </span>
                  </div>
                  {isAutoApplied && (
                    <span
                      className="shrink-0 rounded-full bg-[rgba(170,199,225,0.22)] px-2 py-0.5 text-[10px] font-semibold text-[#7499BA]"
                      title="유형별 기본 추천으로 자동 적용된 항목이에요"
                    >
                      자동 적용
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setToggle(t.id, !on)}
                    aria-pressed={on}
                    aria-label={`${t.label} ${on ? '끄기' : '켜기'}`}
                    className={`relative h-7 w-12 shrink-0 appearance-none rounded-full p-0 transition-colors ${
                      on ? 'bg-[#AAC7E1]' : 'bg-[#E5E5E5]'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                        on ? 'translate-x-[20px]' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* 놓치기 쉬운 추가 비용 정보 (placeholder) */}
      <div className="mt-2 rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white p-4">
        <h4 className="pb-2 text-sm font-semibold text-[#373737]">놓치기 쉬운 추가 비용</h4>
        <p className="text-xs leading-5 text-[#525252]">
          유형과 충돌하는 항목을 켜두면 권장 예산을 넘기 쉬워요. 종합 설계서 탭의 진단을 참고하세요.
        </p>
      </div>
    </div>
  );
}
