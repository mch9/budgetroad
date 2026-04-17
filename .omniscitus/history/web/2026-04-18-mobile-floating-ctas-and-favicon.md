# 모바일 플로팅 CTA + 파비콘 리브랜딩

**Participants**: claude, mincheol.kim

## Summary
디자인 피드백 기반으로 랜딩·STEP 플로우의 CTA 버튼을 모바일에서 하단 플로팅 바로 고정하고,
오렌지 "W" 잔재 파비콘을 Figma 세리프 B 로고 기반(흰 원 + 검정 B)으로 교체.

## Context
- **Background**: 디자이너가 "모바일에서는 매 스텝마다 버튼이 같은 위치(엄지 zone)에 있어야 근육기억으로 탭하기 편하다"고 피드백. 또한 리브랜딩 후에도 파비콘이 초기 오렌지 "W" 상태로 남아있어 브랜드 identity 불일치
- **Requirements**: 데스크탑은 기존 inline 배치 유지 + 모바일(sm 미만)만 fixed 하단 바. iOS safe-area-inset-bottom 대응. 파비콘은 다크/라이트 브라우저 탭 모두 대응
- **Decisions**:
  - 플로팅 바 공통 패턴: `fixed inset-x-0 bottom-0 z-40 border-t bg-[#F9FAFB]/90 backdrop-blur-md pb-[calc(1rem+env(safe-area-inset-bottom))] sm:static sm:inset-x-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none`
  - 결과 페이지의 "결과 공유하기" 버튼은 **플로팅 대상에서 제외** — 스텝 CTA와 성격 다름 (진행 vs 확인 후 액션). 결과 확인 중 하단 방해 방지
  - 파비콘 디자인: 흰 원(`borderRadius:999`) + 중앙에 B 글리프 PNG + 투명 모서리. 초기의 다크 외곽은 사용자 피드백으로 제거
  - B 글리프 출처: 사용자가 Figma에서 직접 다듬어 export한 PNG (2170×2170) → PIL `getbbox()`로 투명 여백 trim (1144×1328) → 정사각 패딩 → 512×512 리사이즈 → `public/brand/b-glyph.png` (108KB)
  - B 크기: 원 대비 75% (icon 24px / apple-icon 136px). 원 테두리와 적절한 여백
  - Sans-serif B 실험은 백업 후 rollback — 세리프가 브랜드 identity에 부합
- **Constraints**:
  - B 글리프 원본이 Picsart에서 편집된 비트맵 PNG라 **벡터 SVG 변환 근본적으로 불가능** (Figma에서 RECTANGLE with IMAGE-FILL 노드로 import된 상태)
  - 16~32px 파비콘에서 세리프(특히 Didone 계열) 얇은 획이 sub-pixel 이하로 내려가 뭉개짐 — 디자인적 한계
  - Chrome 파비콘은 `Favicons` SQLite DB에 저장돼 `Cmd+Shift+R`로 무효화 안 됨. Cmd+Q 앱 완전 재시작 필요

## Timeline

### 2026-04-18
**Focus**: 모바일 플로팅 CTA 3곳 적용 + 파비콘 세리프 B 리브랜딩
- 플로팅 바: `src/app/cta-link.tsx`, `src/app/page.tsx`(main `pb-32 sm:py-12`), `src/app/budget-draft/page.tsx`(Bottom Button 영역 + main `pb-32 sm:pb-0`, 결과 페이지 제외)
- 파비콘 1차 시도: next/og ImageResponse + 시스템 serif "B" 렌더 → 사용자 피드백 "원본 로고와 느낌 다름"
- Figma API(file `ln357t0WYrrMCjyQ9ncQ0N`) 노드 구조 분석: Ellipse 2(351:32, VECTOR ✓) + B(424:50, RECTANGLE + IMAGE-FILL ✗). 로고의 "원"은 벡터, "B"는 원본부터 비트맵
- B glyph 획득 경로 3회 시도: (1) Figma SVG export → 914KB PNG 껍데기 SVG, (2) Figma API `/v1/images` 자동 export → 2074 원본, (3) 사용자가 Figma에서 다듬어 export한 2170 PNG — 최종 채택
- PIL `getbbox()` 기반 trim: 2170→1144×1328 실제 영역 crop → 정사각화 → 512 리사이즈
- `src/app/icon.tsx`, `src/app/apple-icon.tsx` 작성: readFileSync + base64 data URL로 b-glyph.png 인라인, 흰 원 + 중앙 `<img>` 배치
- B 크기 반복 조정: 초기 18/108(너무 작음) → 24/136(75%, 확정) — PNG 자체 투명 여백 때문에 실제 렌더 크기가 지정값보다 작아 보임 → PIL trim이 근본 해결
- Sans-serif B 실험 + 백업(`.claude/temp/backups/*.serif-B.bak`): rollback 결정
- Chrome 파비콘 캐시 진단: 탭 ≠ 주소바 파비콘(서로 다른 버전) → SQLite DB 위치별 독립 캐시 확인

**Learned**:
- `sm:static`만으론 fixed 효과 완전 원복 안 됨 — `inset-x-0`/`bg-*`/`backdrop-blur-*`/`border-t`를 각각 `sm:*-auto`/`sm:bg-transparent`/`sm:backdrop-blur-none`/`sm:border-0`로 개별 무효화해야 데스크탑에서 흔적 없음
- Figma 노드 타입이 export 결과를 결정: `ELLIPSE`→진짜 벡터 SVG(<circle>), `RECTANGLE+IMAGE-FILL`→PNG 껍데기 SVG(`<pattern>` + `<image>` 중첩). 확장자 `.svg`여도 내용이 벡터인지 확인 필요
- macOS Preview는 투명 영역을 **흰색으로 렌더**해서 "흰 원 + 투명"이 합쳐져 "원이 안 보이는 착시" 발생. 실제 탭 렌더 확인은 다크 배경에 composite해야 정확
- Satori의 `<img>`는 base64 data URL이 안정적. `readFileSync` + `Buffer.toString('base64')`로 인라인 필수 (외부 URL은 빌드 실패 리스크)
- 작은 파비콘에서 세리프는 근본적으로 한계 — 로고와 파비콘을 분리 디자인하는 게 업계 표준 (NYT, Vogue 등)

## Pending
- [ ] Chrome 탭 파비콘 캐시 털고 최종 육안 확인 (사용자 Cmd+Q 재시작 필요)
- [ ] 파비콘용 별도 단순화 심벌 또는 sans-serif/slab-serif 버전 추후 검토 (작은 크기 판독성 vs 브랜드 일관성 trade-off, 중단됨)
- [ ] `.claude/temp/backups/*.serif-B.bak` 백업 파일 정리 (필요 없으면 삭제)

## Notes
- 주요 파일: `src/app/cta-link.tsx`, `src/app/page.tsx`, `src/app/budget-draft/page.tsx`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`, `public/brand/b-glyph.png`
- B glyph 원본: Figma file `ln357t0WYrrMCjyQ9ncQ0N`, node `424:50` (MVP UI 확정 페이지)
- 로고의 흰 원은 벡터(`Ellipse 2.svg` 166 bytes = `<circle>`), B는 비트맵 — 이후 벡터 요구 시 B 재제작 필요
- 배포 커밋: `9582255` (feat: mobile floating CTAs + favicon rebrand to B serif logo)
