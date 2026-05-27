// 5유형 정적 설정 — 베이스·정합성 밴드·OFF-TYPE·기타 추정
// 출처: docs/Result Page Calculation Algorithm.md STAGE 3·5·6
// 탐색미결정은 표준실용 fallback

import type { PersonaType } from '../../onboarding-v6';
import type { ToggleId } from '../types';

export type TypeConfig = {
  title: string;
  desc: string;
  tags: string[];
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

// 알고리즘 v2 STAGE 3 표 그대로
export const TYPE_CONFIGS: Record<PersonaType, TypeConfig> = {
  전통격식: {
    title: '전통 격식형',
    desc: '양가가 함께 신경 쓰는 격식 있는 결혼식을 지향합니다.',
    tags: ['#격식_중시', '#양가_조화', '#하객_만족'],
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
    title: '표준 실용형',
    desc: '하객 만족과 합리적 예산의 균형을 추구합니다.',
    tags: ['#합리적_선택', '#하객_배려', '#실속_있는_준비'],
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
    title: '감성 연출형',
    desc: '사진·영상·분위기로 오래 남는 결혼식을 원합니다.',
    tags: ['#분위기_중시', '#사진_영상_중요', '#선택적_투자'],
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
    title: '본질 미니멀형',
    desc: '필수만 갖춘 간결한 결혼식을 선호합니다.',
    tags: ['#본질만', '#신혼생활_우선', '#실속'],
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
    title: '탐색 미결정형',
    desc: '아직 우선순위가 정해지지 않았어요. 차근차근 알아봐요.',
    tags: ['#탐색_중', '#균형'],
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
