'use client';

import {
  HardDrive, UserCheck, Images, Trees, Sunrise,
  Tag, HandHelping, Repeat, Shirt, Scissors, User,
  Users, UserRound,
  Flower2, Flower, Sparkles, Frame, Cake,
  Mic, BookOpen, Music, UserPlus, Utensils, Crown, Palette,
  GalleryHorizontal, Layers, Smartphone, RefreshCw, Clock,
  Camera, Brush, CalendarX, MapPin, Film, Wand2,
  type LucideIcon,
} from 'lucide-react';

import type { ResultPayload, ToggleId, ToggleState, ToggleGroup } from '@/lib/budget-engine';
import { TOGGLES_META, TOGGLE_PRICES } from '@/lib/budget-engine';

// 토글 아이콘 매핑 — 같은 outline 결, 각 항목별 다른 아이콘
const TOGGLE_ICONS: Record<ToggleId, LucideIcon> = {
  '원본 구매': HardDrive,
  '담당자 지정': UserCheck,
  '서브 스냅': Images,
  '야외 촬영': Trees,
  '얼리스타트': Sunrise,
  '앨범페이지 추가': GalleryHorizontal,
  '드레스 추가': Layers,
  '모바일 사진 제공': Smartphone,
  '수정본구매비': RefreshCw,
  '촬영시간 추가': Clock,
  '드레스 지정': Tag,
  '본식 헬퍼': HandHelping,
  '2부 드레스': Repeat,
  '퍼스트웨어': Shirt,
  '가봉 스냅': Scissors,
  '턱시도 대여': User,
  '촬영 헬퍼': Camera,
  '혼주 메이크업': Users,
  '본식 이후 헤어변형': UserRound,
  '웨딩 촬영 헤어변형': UserRound,
  '신랑 메이크업': Brush,
  '휴무일 진행비': CalendarX,
  '촬영 출장비': MapPin,
  '헤어피스 시술': Wand2,
  '생화 꽃장식': Flower2,
  '부케': Flower,
  '플라워 샤워': Sparkles,
  '포토테이블': Frame,
  '웨딩 케이크': Cake,
  '본식 원판 구매': Film,
  '본식 사회자': Mic,
  '주례': BookOpen,
  '축하공연 섭외': Music,
  '본식 도우미': UserPlus,
  '폐백 음식': Utensils,
  '폐백 수모': Crown,
  '한복 대여': Palette,
};

type Props = {
  result: ResultPayload;
  toggles: ToggleState;
  setToggle: (id: ToggleId, on: boolean) => void;
  setAllToggles: (on: boolean) => void;
};

const GROUP_ORDER: ToggleGroup[] = ['예식장', '스튜디오', '드레스'];

export function TabCare({ result, toggles, setToggle, setAllToggles }: Props) {
  const grouped: Record<ToggleGroup, typeof TOGGLES_META> = {
    예식장: [],
    스튜디오: [],
    드레스: [],
  };
  for (const t of TOGGLES_META) grouped[t.group].push(t);

  const allOn = Object.values(toggles).every((v) => v);
  const allOff = Object.values(toggles).every((v) => !v);

  return (
    <div className="flex flex-col gap-4 px-5 pb-6 pt-5">
      {/* 컨트롤 바 */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium text-[#737373]">전체 옵션</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setAllToggles(false)}
            className={`text-sm text-[#373737] ${allOff ? 'font-bold' : 'font-normal'}`}
          >
            전체 끄기
          </button>
          <button
            type="button"
            onClick={() => setAllToggles(true)}
            className={`text-sm text-[#7499BA] ${allOn ? 'font-bold' : 'font-normal'}`}
          >
            전체 켜기
          </button>
        </div>
      </div>

      {/* 4 그룹 */}
      {GROUP_ORDER.map((group) => (
        <section key={group} className="flex flex-col gap-2">
          <h3 className="px-1 pt-2 text-sm font-semibold text-[#373737]">{group}</h3>
          <div className="overflow-hidden rounded-2xl border border-[rgba(170,199,225,0.4)] bg-white">
            {grouped[group].map((t, idx) => {
              const on = toggles[t.id];
              const isDefaultOn = result.vars.toggleDefaults[t.id] === true;
              const isAutoApplied = on && isDefaultOn;
              const rawPrice =
                TOGGLE_PRICES[t.id]?.[result.vars.region]?.[result.vars.season] ?? null;
              const price = rawPrice !== null ? rawPrice * (t.priceMultiplier ?? 1) : null;
              const Icon = TOGGLE_ICONS[t.id];
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
                    <Icon size={16} color="#7499BA" strokeWidth={2} aria-hidden />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <span className="min-w-0 truncate text-sm font-semibold text-[#171717]">{t.label}</span>
                      {price !== null && (
                        <span className="shrink-0 text-xs font-semibold text-[#7499BA]">+{price.toLocaleString()}만원</span>
                      )}
                      {isAutoApplied && (
                        <span
                          className="shrink-0 rounded-full bg-[rgba(170,199,225,0.22)] px-2 py-0.5 text-[10px] font-semibold text-[#7499BA]"
                          title="유형별 기본 추천으로 자동 적용된 항목이에요"
                        >
                          자동 적용
                        </span>
                      )}
                    </div>
                    <span className="text-xs leading-4 text-[#737373]">{t.desc}</span>
                  </div>
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
