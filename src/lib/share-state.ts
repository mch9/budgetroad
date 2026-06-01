// 결과 공유용 URL 인코딩 — 답변(14문항) + 토글(추가금 옵션)을 짧은 문자열로.
// 결과는 diagnose(answers, toggles)로 결정론적이라 이 둘만 있으면 100% 재구성 가능.
// 버전 prefix('6')로 추후 스키마 변경 시 옛 링크 무효화 가드.
import { STEPS, EMPTY_ANSWERS, type OnboardingAnswers, type ChoiceId } from './onboarding-v6';
import { TOGGLES_META, type ToggleState } from './budget-engine';

const VERSION = '6';
const QID_ORDER = STEPS.map((s) => s.id); // 14문항 고정 순서
const TID_ORDER = TOGGLES_META.map((m) => m.id); // 토글 고정 순서
const CHOICES: ChoiceId[] = ['A', 'B', 'C', 'D'];

export function encodeShare(answers: OnboardingAnswers, toggles: ToggleState): string {
  const a = QID_ORDER.map((id) => answers[id] ?? '_').join('');
  let mask = 0;
  TID_ORDER.forEach((id, i) => {
    if (toggles[id]) mask += 2 ** i;
  });
  return `${VERSION}${a}.${mask.toString(36)}`;
}

export function decodeShare(
  code: string | null,
): { answers: OnboardingAnswers; toggles: ToggleState } | null {
  if (!code || code[0] !== VERSION) return null;
  const [a, t] = code.slice(1).split('.');
  if (!a || a.length !== QID_ORDER.length) return null;
  const answers: OnboardingAnswers = { ...EMPTY_ANSWERS };
  for (let i = 0; i < QID_ORDER.length; i++) {
    const c = a[i] as ChoiceId;
    if (!CHOICES.includes(c)) return null; // 미완성·손상 코드
    answers[QID_ORDER[i]] = c;
  }
  const mask = t ? parseInt(t, 36) : 0;
  const toggles = {} as ToggleState;
  TID_ORDER.forEach((id, i) => {
    toggles[id] = Number.isFinite(mask) && Math.floor(mask / 2 ** i) % 2 === 1;
  });
  return { answers, toggles };
}
