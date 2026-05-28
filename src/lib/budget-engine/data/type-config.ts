// 5유형 정적 설정 — 베이스·정합성 밴드·OFF-TYPE·기타 추정
// 출처: docs/Result Page Calculation Algorithm.md STAGE 3·5·6
// 탐색미결정은 표준실용 fallback

import type { PersonaType } from '../../onboarding-v6';
import type { ToggleId } from '../types';

export type PersonaIllustrationKey =
  | 'traditional'
  | 'standard'
  | 'experience'
  | 'minimal'
  | 'undecided';

export type TypeConfig = {
  title: string;             // 예: "감성 연출형 웨딩 타입"
  desc: string;              // 4-5줄 긴 설명
  tags: string[];            // 5-6개 해시태그
  illustration: PersonaIllustrationKey;
  base: {
    dress: '본식만' | '본식촬영' | '촬영만';
    makeup: '실장' | '부원장' | '원장';
    bonsik: 'venue' | 'pro';        // 예식장 연계 / 외부 전문
    bonsikPrice: number;            // 본식 촬영 단가 (만원)
  };
  band: { min: number; max: number };
  offType: ToggleId[];              // 유형과 충돌하는 토글 (켜져있으면 해제 권유)
  etc: {
    yemul: number;                  // 예물·예단 추정 (만원)
    honsu: number;                  // 혼수 추정
    honeymoon: number;              // 신혼여행 추정
  };
};

// 알고리즘 v2 STAGE 3 표 + 임시 콘텐츠 (desc / tags). 추후 PM 보강 자리.
export const TYPE_CONFIGS: Record<PersonaType, TypeConfig> = {
  전통격식: {
    title: '전통 격식형 웨딩 타입',
    desc: '두 분은 양가가 함께 신경 쓰는 격식 있는 결혼식을 지향해요. 식사·꽃장식·혼주 케어처럼 하객 만족도와 직결되는 항목에 무게를 두고, 폐백·주례·축하공연 같은 전통 절차도 빠뜨리지 않는 방향이 잘 맞아요.',
    tags: ['#격식_중시', '#양가_조화', '#하객_만족', '#식사_퀄리티', '#전통_절차'],
    illustration: 'traditional',
    base: {
      dress: '본식촬영',
      makeup: '원장',
      bonsik: 'venue',
      bonsikPrice: 80,
    },
    band: { min: 3200, max: 5000 },
    offType: ['퍼스트웨어'],
    etc: { yemul: 500, honsu: 600, honeymoon: 400 },
  },
  표준실용: {
    title: '표준 실용형 웨딩 타입',
    desc: '두 분은 하객 만족과 합리적 예산의 균형을 추구하는 타입이에요. 스드메·식장은 무난한 중급으로, 꼭 필요한 항목엔 투자하고 부수적인 옵션은 과감하게 정리하는 방향이 잘 맞아요. 무리하지 않으면서도 완성도 있는 결혼식이 가능해요.',
    tags: ['#합리적_선택', '#하객_배려', '#실속_있는_준비', '#균형', '#무난한_완성도'],
    illustration: 'standard',
    base: {
      dress: '본식촬영',
      makeup: '부원장',
      bonsik: 'venue',
      bonsikPrice: 80,
    },
    band: { min: 2200, max: 3400 },
    offType: ['퍼스트웨어', '가봉 스냅', '생화 꽃장식'],
    etc: { yemul: 350, honsu: 600, honeymoon: 400 },
  },
  경험연출: {
    title: '감성 연출형 웨딩 타입',
    desc: '두 분은 사진과 분위기를 중요하게 생각하지만, 전체 예산은 과하게 넘기고 싶지 않은 타입이에요. 스드메·본식 스냅에는 적정 수준으로 투자하고, 예물·과한 연출에서는 비용을 조정하는 방향이 잘 맞아요.',
    tags: ['#분위기_중시', '#사진/영상_중요', '#예산_초과_경계', '#선택적_투자', '#실속_있는_준비'],
    illustration: 'experience',
    base: {
      dress: '본식촬영',
      makeup: '원장',
      bonsik: 'pro',
      bonsikPrice: 150,
    },
    band: { min: 2700, max: 4100 },
    offType: [],
    etc: { yemul: 250, honsu: 600, honeymoon: 450 },
  },
  본질미니멀: {
    title: '본질 미니멀형 웨딩 타입',
    desc: '두 분은 필수만 갖춘 간결한 결혼식을 선호하는 타입이에요. 화려한 연출이나 예물보다는 신혼집·자산 안정에 무게를 두고, 가족·가까운 지인만 모시는 작은 규모를 지향해요. 올인원 패키지처럼 명확한 옵션이 두 분에게 잘 맞아요.',
    tags: ['#본질만', '#신혼생활_우선', '#실속', '#소규모_지향', '#패키지_선호'],
    illustration: 'minimal',
    base: {
      dress: '본식만',
      makeup: '실장',
      bonsik: 'venue',
      bonsikPrice: 80,
    },
    band: { min: 1000, max: 2200 },
    offType: [
      '드레스 지정',
      '가봉 스냅',
      '퍼스트웨어',
      '서브 스냅',
      '원본 구매',
      '2부 드레스',
      '생화 꽃장식',
    ],
    etc: { yemul: 150, honsu: 600, honeymoon: 300 },
  },
  탐색미결정: {
    title: '탐색 미결정형 웨딩 타입',
    desc: '두 분은 아직 결혼식의 우선순위가 명확하게 정해지지 않은 타입이에요. 일단 표준 실용형의 합리적 평균으로 예산을 제안드리지만, 꼭 지킬 것 두 가지와 줄여도 되는 것 두 가지를 정하면 방향이 빨리 잡혀요. 전문가 상담을 받아보는 것도 추천드려요.',
    tags: ['#탐색_중', '#균형', '#우선순위_정리_필요', '#상담_추천', '#합리적_평균'],
    illustration: 'undecided',
    // 표준실용 fallback
    base: {
      dress: '본식촬영',
      makeup: '부원장',
      bonsik: 'venue',
      bonsikPrice: 80,
    },
    band: { min: 2200, max: 3400 },
    offType: ['퍼스트웨어', '가봉 스냅'],
    etc: { yemul: 350, honsu: 600, honeymoon: 400 },
  },
};
