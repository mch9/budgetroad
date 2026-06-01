# 디자인 QA — 03. 결과 페이지 · 항목별 내역 탭

> 작성일: 2026-05-28 · 상태: **🟢 1차 디자이너 피드백 반영 완료**
> 진행 방식: **타겟 피드백 fix log**
> 대상 코드: `src/components/result/tabs/tab-itemized.tsx`

## 1. 디자이너 피드백 (2026-05-28)

| ID | 위치 | 피드백 | 결정 |
|:---:|---|---|:---:|
| F1 | 펼친 산출 근거 표 — 세부 정보 | "100명 × 7만원" 같은 sub 폰트 ↑ "넘 작음 키워야 될 듯" | ✅ 수정 |
| F2 | 동일 — key/값 | "식대와 이미 색상으로 강조값 구분되니까 폰트 크기 비슷하거나 같아도 될 듯" | ✅ 수정 |
| F3 | 지출 항목들 — 카테고리 아이콘 | 단색 사각형만 있어서 직관적이지 않음 → 카테고리별 아이콘 적용 (팀원 전체 의견) | ✅ 수정 |
| F4 | 도넛 + 레전드 — 데스크톱 layout | 모바일 세로 stack은 좋은데 데스크톱에서는 공간이 남아 어색 → 데스크톱만 좌우 분할 (도넛 좌 / 레전드 우) | ✅ 수정 |

## 2. 적용 diff

### F3. 카테고리 아이콘 적용 (지출 항목들 row)

```diff
- <span
-   className="h-8 w-8 shrink-0 rounded-lg"
-   style={{ backgroundColor: CATEGORY_COLORS[cat] }}
- />
+ <img
+   src={CATEGORY_ICONS[cat]}
+   alt=""
+   aria-hidden
+   className="h-8 w-8 shrink-0"
+ />
```

매핑 (`CATEGORY_ICONS` 신규):
| 카테고리 | 아이콘 |
|---|---|
| 예식장 | `/icons/category/venue.svg` |
| 스드메 | `/icons/category/sdm.svg` |
| 예물·예단 | `/icons/category/yedan.svg` |
| 혼수 | `/icons/category/furniture.svg` |
| 신혼여행 | `/icons/category/honeymoon.svg` |

각 SVG: 32×32, 둥근 사각형 배경(`#AAC7E1` 30% opacity) + 카테고리 픽토그램. 디자인 시스템 액센트 컬러로 통일. 도넛/legend의 5색은 별도 유지(시각 hierarchy 보존).

### 세부 표 전체 폰트 ↑

| 위치 | 변경 전 | 변경 후 |
|---|---|---|
| 행 key (`식대`, `대관`) | 12 (`text-xs`) | **14** (`text-sm`) |
| 행 sub (`100명 × 7만원`) | 10 (`text-[10px]`) | **12** (`text-xs`) |
| 행 값 (`1,575만원`, `+223만원`) | 12 | **14** |
| 소계 라벨 | 12 | **14** |
| 소계 값 | 14 (`text-sm`) | **16** (`text-base`) |
| 스드메 안내 (지역·시즌) | 11 (`text-[11px]`) | **12** (`text-xs`) |
| 기타 카테고리 본문 | 12 / lh 20 | **14 / lh 24** |

색상은 그대로 (`#525252`, `#A1A1A1`, `#7499BA`). 강조값과 일반값이 색상으로 구분되니 폰트 사이즈가 같아져도 hierarchy 유지.

## 3. Ripple Effect

- Row / TotalRow / CategoryBreakdown은 `tab-itemized.tsx` 안에서만 사용 → 다른 탭 영향 없음
- 카테고리 row의 접힌 상태 (큰 `예식장` 라벨 + 금액)는 손대지 않음

## 4. 자가 검증

- [x] `npm run lint` 통과
- [x] `npm run build` 통과
- [ ] Vercel preview에서 확인 (사용자)
- [x] `텍스트 스타일 현황.md § 6-3` 갱신

## 5. 롤백

```
git revert <hash>
```
