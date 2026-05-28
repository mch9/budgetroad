# 디자인 QA — 02. 결과 페이지 · 종합 설계서 탭

> 작성일: 2026-05-28 · 상태: **🟢 1차 디자이너 피드백 반영 완료**
> 진행 방식: 정밀 전체 비교가 아닌 **타겟 피드백 fix log** (시간 절약)
> 대상 코드: `src/components/result/tabs/tab-comprehensive.tsx`

## 1. 디자이너 피드백 (2026-05-28)

| ID | 위치 | 피드백 | 결정 |
|:---:|---|---|:---:|
| F1 | 정합성 진단 카드 | 2번째 줄(headline)과 3번째 줄(body)이 떨어져 보임 → 깔끔하게 정렬된 한 묶음으로 | ✅ 수정 |
| F2 | 지금 당장 해야 할 준비 TOP 3 | "전체적인 폰트 크기 키우기 +2px 정도면 될 듯" | ✅ 수정 |

레퍼런스: `assets/02-comprehensive/` (사용자 첨부 — Downloads 폴더, 영구 보존 시 별도 이동)

## 2. 적용 diff

### F1. 정합성 진단 카드 (2회 조정)

**1차 (25b4d8a)**:
```diff
-      <p className="mt-2 text-sm leading-6">{result.consistency.body}</p>
+      <p className="mt-1 text-sm leading-6">{result.consistency.body}</p>
```
8px → 4px. body의 leading-6(24px)와 합쳐져 한 paragraph 느낌으로 통합.

**2차 추가 (디자이너 추가 피드백 — 1-2 간격과 2-3 간격이 시각상 다름)**:
```diff
-      <p className="mt-1 text-sm leading-6">{result.consistency.body}</p>
+      <p className="text-sm leading-6">{result.consistency.body}</p>
```
mt 자체 제거. 같은 4px도 line-height inner padding 누적 차이로 2-3이 더 떨어져 보이던 문제 해소.

### F2. 준비 TOP 3 — 전체 폰트 +2px

| 위치 | 변경 전 | 변경 후 |
|---|---|---|
| 카드 헤딩 | `text-base` (16) | `text-lg` (18) |
| 순위 칩 (1위~3위) | `h-7 w-7` + `text-xs` (12) | `h-8 w-8` + `text-sm` (14) |
| 항목 제목 | `text-sm` (14) | `text-base` (16) |
| 권장 시점 | `text-xs` (12) | `text-sm` (14) |
| 본문 노트 | `text-xs leading-5` (12/20) | `text-sm leading-6` (14/24) |
| 체크리스트 | `text-xs` (12) | `text-sm` (14) |

순위 칩은 폰트 14에 맞게 28→32px로 같이 키움.

## 3. Ripple Effect

- 정합성 진단 카드: 결과 페이지 한 곳만 사용 → ripple 없음
- TOP 3: 정적 컴포넌트, 다른 화면 영향 없음
- 다른 카드 헤딩(`이 예산이 나온 이유`, `여기에 더 투자`, `여기서 줄여도 OK`)은 **16px 유지** — 디자이너가 TOP 3만 지목

## 4. 자가 검증

- [x] `npm run lint` 통과
- [x] `npm run build` 통과
- [ ] Vercel preview에서 확인 (사용자)
- [x] `텍스트 스타일 현황.md § 5-4·5-6` 갱신

## 5. 롤백

```
git revert <hash>
```
