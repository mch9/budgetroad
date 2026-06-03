export type ChecklistTag = '중요' | '계약';

export type ToggleChecklistEntry =
  | { toggleId: string; type: 'highlight'; existingItemId: string }
  | { toggleId: string; type: 'inject'; groupId: string; sectionTitle: string; text: string };

// 25개 추가금 토글 → 체크리스트 매핑
// highlight: 이미 있는 항목에 "내 선택" 배지
// inject: 새 항목 삽입
export const TOGGLE_CHECKLIST_MAP: ToggleChecklistEntry[] = [
  { toggleId: '원본 구매',    type: 'inject',    groupId: 'group-sdm',           sectionTitle: '스냅·영상 계약', text: '스튜디오 원본 파일 구매하기' },
  { toggleId: '담당자 지정',  type: 'inject',    groupId: 'group-sdm',           sectionTitle: '스드메 계약',   text: '스튜디오 담당자 지정 계약하기' },
  { toggleId: '서브 스냅',    type: 'highlight', existingItemId: 'snap-3' },
  { toggleId: '야외 촬영',    type: 'highlight', existingItemId: 'photo-7' },
  { toggleId: '얼리스타트',   type: 'inject',    groupId: 'group-sdm',           sectionTitle: '스드메 계약',   text: '얼리스타트 시간대 추가 계약하기' },
  { toggleId: '드레스 지정',  type: 'inject',    groupId: 'group-sdm',           sectionTitle: '스드메 계약',   text: '원하는 드레스 지정 계약하기' },
  { toggleId: '본식 헬퍼',   type: 'inject',    groupId: 'group-ceremony-prep', sectionTitle: '의상·소품',    text: '본식 드레스 헬퍼 예약하기' },
  { toggleId: '2부 드레스',   type: 'highlight', existingItemId: 'prep-2' },
  { toggleId: '퍼스트웨어',   type: 'inject',    groupId: 'group-ceremony-prep', sectionTitle: '의상·소품',    text: '퍼스트웨어 준비하기' },
  { toggleId: '가봉 스냅',    type: 'inject',    groupId: 'group-photo',         sectionTitle: '촬영 준비',    text: '가봉 스냅 촬영 예약하기' },
  { toggleId: '턱시도 대여',  type: 'inject',    groupId: 'group-groom-parents', sectionTitle: '신랑 예복',    text: '턱시도 대여 계약하기' },
  { toggleId: '혼주 메이크업', type: 'highlight', existingItemId: 'parents-3' },
  { toggleId: '헤어변형',     type: 'highlight', existingItemId: 'photo-5' },
  { toggleId: '생화 꽃장식',  type: 'inject',    groupId: 'group-ceremony-prep', sectionTitle: '의상·소품',    text: '생화 꽃장식 업체 예약하기' },
  { toggleId: '부케',         type: 'highlight', existingItemId: 'prep-3' },
  { toggleId: '플라워 샤워',  type: 'inject',    groupId: 'group-ceremony-prep', sectionTitle: '예식 진행',    text: '플라워 샤워 연출 준비하기' },
  { toggleId: '포토테이블',   type: 'highlight', existingItemId: 'prep-17' },
  { toggleId: '웨딩 케이크',  type: 'inject',    groupId: 'group-ceremony-prep', sectionTitle: '의상·소품',    text: '웨딩 케이크 주문하기' },
  { toggleId: '본식 사회자',  type: 'highlight', existingItemId: 'prep-5' },
  { toggleId: '주례',         type: 'highlight', existingItemId: 'prep-5' },
  { toggleId: '축하공연 섭외', type: 'highlight', existingItemId: 'prep-7' },
  { toggleId: '본식 도우미',  type: 'inject',    groupId: 'group-ceremony-prep', sectionTitle: '예식 진행',    text: '본식 도우미 예약하기' },
  { toggleId: '폐백 음식',    type: 'highlight', existingItemId: 'prep-4' },
  { toggleId: '폐백 수모',    type: 'inject',    groupId: 'group-ceremony-prep', sectionTitle: '예식 진행',    text: '폐백 수모 섭외하기' },
  { toggleId: '한복 대여',    type: 'inject',    groupId: 'group-groom-parents', sectionTitle: '혼주',         text: '양가 한복 대여 계약하기' },
];

export type ChecklistItem = {
  id: string;
  text: string;
  tag?: ChecklistTag;
};

export type ChecklistSection = {
  title: string;
  items: ChecklistItem[];
};

export type ChecklistGroup = {
  id: string;
  title: string;
  timeLabel: string;
  sections: ChecklistSection[];
};

export const CHECKLIST_GROUPS: ChecklistGroup[] = [
  {
    id: 'group-start',
    title: '결혼 준비 시작',
    timeLabel: 'D-12~10개월',
    sections: [
      {
        title: '양가 인사 & 방향 결정',
        items: [
          { id: 'start-1', text: '양가 부모님께 첫인사' },
          { id: 'start-2', text: '상견례 일정 조율' },
          { id: 'start-3', text: '상견례' },
          { id: 'start-4', text: '결혼예산표 계획', tag: '중요' },
          { id: 'start-5', text: '결혼식 날짜 후보 확정' },
          { id: 'start-6', text: '예식 스타일 방향 합의' },
          { id: 'start-7', text: '예상 하객 수 논의', tag: '중요' },
          { id: 'start-8', text: '총 예산 상한선 협의' },
          { id: 'start-9', text: '항목별 우선순위 합의', tag: '중요' },
        ],
      },
    ],
  },
  {
    id: 'group-planner-hall',
    title: '웨딩플래너 & 웨딩홀',
    timeLabel: 'D-11~9개월',
    sections: [
      {
        title: '웨딩플래너',
        items: [
          { id: 'planner-1', text: '웨딩플래너 상담' },
          { id: 'planner-2', text: '웨딩플래너 동행 여부 결정' },
          { id: 'planner-3', text: '웨딩플래너 계약', tag: '계약' },
        ],
      },
      {
        title: '웨딩홀',
        items: [
          { id: 'hall-1', text: '희망 지역·시간대 정하기' },
          { id: 'hall-2', text: '식대 상한선 정하기', tag: '중요' },
          { id: 'hall-3', text: '보증 인원 기준 확인', tag: '중요' },
          { id: 'hall-4', text: '대관료 포함 범위 확인' },
          { id: 'hall-5', text: '폐백 진행 여부 확인' },
          { id: 'hall-6', text: '웨딩홀 투어', tag: '중요' },
          { id: 'hall-7', text: '웨딩홀 계약', tag: '계약' },
          { id: 'hall-8', text: '웨딩홀 시식' },
        ],
      },
    ],
  },
  {
    id: 'group-sdm',
    title: '스드메',
    timeLabel: 'D-10~8개월',
    sections: [
      {
        title: '스드메 계약',
        items: [
          { id: 'sdm-1', text: '패키지 vs 개별 계약 방향 결정' },
          { id: 'sdm-2', text: '스드메 상담' },
          { id: 'sdm-3', text: '스튜디오 후보 조사' },
          { id: 'sdm-4', text: '드레스샵 투어' },
          { id: 'sdm-5', text: '메이크업 업체 후보 조사' },
          { id: 'sdm-6', text: '스드메 계약', tag: '계약' },
        ],
      },
      {
        title: '스냅·영상 계약',
        items: [
          { id: 'snap-1', text: '본식스냅 계약', tag: '계약' },
          { id: 'snap-2', text: '본식DVD 계약', tag: '계약' },
          { id: 'snap-3', text: '서브스냅 계약', tag: '계약' },
          { id: 'snap-4', text: '아이폰스냅 계약', tag: '계약' },
        ],
      },
    ],
  },
  {
    id: 'group-photo',
    title: '스드메 촬영',
    timeLabel: 'D-9~6개월',
    sections: [
      {
        title: '촬영 준비',
        items: [
          { id: 'photo-1', text: '스튜디오 촬영 일정 예약' },
          { id: 'photo-2', text: '촬영드레스 가봉' },
          { id: 'photo-3', text: '스튜디오 촬영 준비' },
          { id: 'photo-4', text: '신랑 촬영 대여복 준비' },
          { id: 'photo-5', text: '촬영 헤어변형 예약' },
          { id: 'photo-6', text: '촬영 플라워디렉팅 예약' },
          { id: 'photo-7', text: '야외 웨딩스냅 촬영 일정 예약' },
        ],
      },
      {
        title: '촬영 진행',
        items: [
          { id: 'photo-8', text: '스튜디오 촬영' },
          { id: 'photo-9', text: '촬영 사진 셀렉' },
          { id: 'photo-10', text: '촬영 사진 보정' },
        ],
      },
    ],
  },
  {
    id: 'group-gift-home',
    title: '예물·예단',
    timeLabel: 'D-10~8개월',
    sections: [
      {
        title: '예물·예단',
        items: [
          { id: 'gift-1', text: '예물·예단 진행 여부 양가 합의' },
          { id: 'gift-2', text: '예단 범위·금액 합의' },
          { id: 'gift-3', text: '웨딩밴드 투어' },
          { id: 'gift-4', text: '웨딩밴드 계약', tag: '계약' },
        ],
      },
    ],
  },
  {
    id: 'group-groom-parents',
    title: '신랑·혼주 준비',
    timeLabel: 'D-8~6개월',
    sections: [
      {
        title: '신랑 예복',
        items: [
          { id: 'groom-1', text: '신랑 예복 계약', tag: '계약' },
          { id: 'groom-2', text: '신랑 예복 1차 가봉' },
          { id: 'groom-3', text: '신랑 예복 2차 가봉' },
          { id: 'groom-4', text: '신랑 예복 최종 가봉' },
        ],
      },
      {
        title: '혼주',
        items: [
          { id: 'parents-1', text: '혼주 한복 계약', tag: '계약' },
          { id: 'parents-2', text: '혼주 양복 계약', tag: '계약' },
          { id: 'parents-3', text: '혼주 메이크업 일정 예약' },
        ],
      },
    ],
  },
  {
    id: 'group-furnish-trip',
    title: '신혼여행',
    timeLabel: 'D-8~6개월',
    sections: [
      {
        title: '신혼여행',
        items: [
          { id: 'trip-1', text: '신혼여행 국가·도시 결정', tag: '중요' },
          { id: 'trip-2', text: '신혼여행 예약', tag: '계약' },
          { id: 'trip-3', text: '여행 일정 확정' },
          { id: 'trip-4', text: '신혼여행 점검' },
        ],
      },
    ],
  },
  {
    id: 'group-invitation',
    title: '청첩장·답례품',
    timeLabel: 'D-3~2개월',
    sections: [
      {
        title: '청첩장',
        items: [
          { id: 'inv-1', text: '하객 명단 정리' },
          { id: 'inv-2', text: '청첩장 디자인·업체 선정' },
          { id: 'inv-3', text: '청첩장 샘플 주문' },
          { id: 'inv-4', text: '청첩장 인쇄 주문', tag: '계약' },
          { id: 'inv-5', text: '모바일 청첩장 제작' },
          { id: 'inv-6', text: '모바일 청첩장 전달' },
          { id: 'inv-7', text: '청첩장 모임 시작' },
        ],
      },
      {
        title: '답례품',
        items: [
          { id: 'gift2-1', text: '답례품 종류 결정' },
          { id: 'gift2-2', text: '답례품 준비', tag: '계약' },
        ],
      },
    ],
  },
  {
    id: 'group-ceremony-prep',
    title: '본식 준비',
    timeLabel: 'D-2~1개월',
    sections: [
      {
        title: '의상·소품',
        items: [
          { id: 'prep-1', text: '본식드레스 가봉' },
          { id: 'prep-2', text: '2부(연회장) 의상 준비' },
          { id: 'prep-3', text: '부케(부토니아,코사지) 예약' },
          { id: 'prep-4', text: '폐백 및 이바지 음식 예약' },
        ],
      },
      {
        title: '예식 진행',
        items: [
          { id: 'prep-5', text: '주례/사회자 섭외' },
          { id: 'prep-6', text: '사회자 대본 준비' },
          { id: 'prep-7', text: '축가/축사/덕담 섭외' },
          { id: 'prep-8', text: '부케순이 섭외' },
          { id: 'prep-9', text: '가방순이 섭외' },
          { id: 'prep-10', text: '장거리 하객 버스 대절' },
        ],
      },
      {
        title: '영상·음향·서류',
        items: [
          { id: 'prep-11', text: '식전영상 제작' },
          { id: 'prep-12', text: '식전영상 웨딩홀 전달' },
          { id: 'prep-13', text: '본식음원 선정' },
          { id: 'prep-14', text: '본식음원 웨딩홀 전달' },
          { id: 'prep-15', text: '식순 준비' },
          { id: 'prep-16', text: '성혼선언문 준비' },
          { id: 'prep-17', text: '포토테이블용 사진, 액자 준비' },
        ],
      },
    ],
  },
  {
    id: 'group-final',
    title: '마무리 점검',
    timeLabel: 'D-1개월',
    sections: [
      {
        title: '최종 확인',
        items: [
          { id: 'fin-1', text: '예식장 최종 인원 확정', tag: '중요' },
          { id: 'fin-2', text: '스드메 최종 일정 확인' },
          { id: 'fin-3', text: '폐백·한복 최종 확인' },
          { id: 'fin-4', text: '신혼여행 짐 준비' },
          { id: 'fin-5', text: '혼인신고 서류 준비', tag: '중요' },
        ],
      },
    ],
  },
  {
    id: 'group-dday',
    title: '본식 & 이후',
    timeLabel: 'D-Day',
    sections: [
      {
        title: '본식',
        items: [
          { id: 'dday-1', text: '본식' },
        ],
      },
      {
        title: '이후 정리',
        items: [
          { id: 'dday-2', text: '예식비용 정산' },
          { id: 'dday-3', text: '사례비 전달' },
          { id: 'dday-4', text: '답례품 전달' },
          { id: 'dday-5', text: '감사인사 전달' },
        ],
      },
    ],
  },
];
