# 디자인 QA — 04. 결과 페이지 · 추가금 케어 탭

> 작성일: 2026-05-28 · 상태: **🟢 1차 디자이너 피드백 반영 완료**
> 진행 방식: **타겟 피드백 fix log**
> 대상 코드: `src/components/result/tabs/tab-care.tsx`

## 1. 디자이너 피드백 (2026-05-28)

| ID | 위치 | 피드백 | 결정 |
|:---:|---|---|:---:|
| F1 | 토글 row — 자동 적용 배지 | 모바일에서 배지가 sub 텍스트 가림 → 라벨 옆 inline + 행간 조정 | ✅ 수정 (2회) |
| F2 | 토글 row — 항목 아이콘 | 25개 모두 시계 모양으로 직관성 없음 → 같은 결, 다른 모양 아이콘으로 | ✅ 수정 |

레퍼런스: `IMG_4138.PNG`, `IMG_4139.PNG` (사용자 첨부 — Downloads 폴더)

## 2. 문제 진단

현재 row 구조 (변경 전):
```
[아이콘] [텍스트 column flex-1] [자동 적용 배지] [토글]
            ├─ 라벨 (truncate)
            └─ sub: "+419만원 · 생화 데코 ..." (truncate ← 배지가 가림)
```

배지가 텍스트 column **옆** 형제 요소라, `flex-1` 가용폭에서 배지가 차지하는 만큼 sub가 잘림.

## 3. 옵션 탐색 (사용자 결정 — A++ 통일)

7개 옵션 중 A++ 선택 — 라벨 옆 inline 배지, sub 별도 줄 풀폭. mobile/desktop 통일.

이유:
- `result-view.tsx:79`의 `max-w-[576px]` 때문에 데스크톱도 폭이 모바일과 같음 → 분기 의미 없음
- 디자인 시스템 일관성 유지

## 4. 적용 diff (2회 조정)

**2차 조정 (디자이너 추가 피드백 — 라벨/배지 줄과 sub 줄 행간이 좁아 숨막힘)**:
```diff
- <div className="flex min-w-0 flex-1 flex-col">
+ <div className="flex min-w-0 flex-1 flex-col gap-1">
```
배지 `py-0.5`로 라벨 줄 박스가 살짝 큰 상태 + sub와 gap 0이라 붙어 보이던 문제 해소. 두 줄 사이 4px gap 확보.

### 1차 diff

```diff
- <div className="flex min-w-0 flex-1 flex-col">
-   <span className="truncate text-sm font-semibold text-[#171717]">{t.label}</span>
-   <span className="truncate text-xs text-[#737373]">{price} · {desc}</span>
- </div>
- {isAutoApplied && (
-   <span className="shrink-0 rounded-full bg-[rgba(170,199,225,0.22)] px-2 py-0.5 text-[10px] font-semibold text-[#7499BA]" title="...">
-     자동 적용
-   </span>
- )}
- <button>...</button>

+ <div className="flex min-w-0 flex-1 flex-col">
+   <div className="flex items-center gap-2">
+     <span className="truncate text-sm font-semibold text-[#171717]">{t.label}</span>
+     {isAutoApplied && (
+       <span className="shrink-0 rounded-full bg-[rgba(170,199,225,0.22)] px-2 py-0.5 text-[10px] font-semibold text-[#7499BA]" title="...">
+         자동 적용
+       </span>
+     )}
+   </div>
+   <span className="truncate text-xs text-[#737373]">{price} · {desc}</span>
+ </div>
+ <button>...</button>
```

## F2. 25개 토글 아이콘 매핑 (lucide-react)

기존 모든 row의 Clock SVG 제거 → `lucide-react` 도입 후 토글 ID별 매핑:

| 그룹 | 토글 → 아이콘 |
|---|---|
| 스튜디오 (5) | 원본 구매 → `HardDrive` · 담당자 지정 → `UserCheck` · 서브 스냅 → `Images` · 야외 촬영 → `Trees` · 얼리스타트 → `Sunrise` |
| 드레스 (6) | 드레스 지정 → `Tag` · 본식 헬퍼 → `HandHelping` · 2부 드레스 → `Repeat` · 퍼스트웨어 → `Shirt` · 가봉 스냅 → `Scissors` · 턱시도 대여 → `User` |
| 메이크업 (2) | 혼주 메이크업 → `Users` · 헤어변형 → `Brush` |
| 예식장 (12) | 생화 꽃장식 → `Flower2` · 부케 → `Flower` · 플라워 샤워 → `Sparkles` · 포토테이블 → `Frame` · 웨딩 케이크 → `Cake` · 본식 사회자 → `Mic` · 주례 → `BookOpen` · 축하공연 섭외 → `Music` · 본식 도우미 → `UserPlus` · 폐백 음식 → `Utensils` · 폐백 수모 → `Crown` · 한복 대여 → `Palette` |

모두 동일한 outline 스타일(stroke-width 2, color `#7499BA`, size 16) — 디자인 결 통일.

## 5. 변경 후 row 구조

```
[아이콘] [텍스트 column flex-1]               [토글]
            ├─ 라벨 [자동 적용]
            └─ sub: "+419만원 · 생화 데코 (지역별 단가)" (풀폭)
```

- 배지 크기 그대로 (`text-[10px]`, padding 동일)
- sub 가용폭: 기존 대비 ~+60~70px (배지 자리만큼 회수)
- row 높이 동일

## 6. Ripple Effect

- `tab-care.tsx` 안에서만 사용 → 다른 탭 영향 없음
- 토글 25개 모두 같은 패턴 적용 — 일관성 유지

## 7. 자가 검증

- [x] `npm run lint` 통과
- [x] `npm run build` 통과
- [ ] Vercel preview에서 확인 (사용자) — 25 토글 중 자동 적용된 row + 아닌 row 모두
- [x] `텍스트 스타일 현황.md § 7-3` 갱신

## 8. 롤백

```
git revert <hash>
```

데스크톱이 별로면 모바일만 적용으로 후속 변경 (sub가 데스크톱에서 잘리는 문제는 모바일 분기로 가도 동일하게 남음 — `max-w-[576px]` 변경 별도 검토 필요).
