# OG 이미지 및 소셜 공유 최적화

## Summary
SNS 공유 시 미리보기 카드에 표시될 OG 이미지를 코드 기반으로 생성하고, metadataBase를 설정하여 소셜 공유 환경을 완성.
2026-04-17 세션에서 결과 페이지 "결과 공유하기" 버튼 구현(native share + clipboard fallback)과 OG 이미지를 리브랜딩 디자인(커플 일러스트 + 한글 세리프 로고)으로 전면 교체.

## Context
- **Background**: follow-up에서 OG 이미지 미설정 확인 → CTO Council에서 우선순위 높은 작업으로 판단
- **Requirements**: 프로젝트 브랜딩(#FF8400) 반영, 서비스명/핵심 키워드 포함, 1200x630 규격
- **Decisions**: next/og의 ImageResponse로 코드 기반 동적 생성 (정적 이미지 파일 대신); metadataBase에 환경변수 fallback 패턴 적용
- **Constraints**: 커스텀 도메인 미확정 상태라 Vercel 기본 도메인으로 임시 설정

## Timeline

### 2026-04-13
**Focus**: OG 이미지 생성 + metadataBase 설정 + 배포
- follow-up으로 전체 pending task 상태 검토 (9개 중 2개 완료 확인)
- GA 설정 검토 — .env.local, layout.tsx, Vercel 환경변수 모두 정상 확인
- `src/app/opengraph-image.tsx` 생성 (next/og ImageResponse, 프로젝트 컬러 + 서비스명 + 핵심 키워드 3개)
- `layout.tsx`에 metadataBase 추가 (NEXT_PUBLIC_SITE_URL 환경변수 fallback)
- feat/og-image 브랜치 → PR #7 → main 머지 → Vercel 프로덕션 배포 완료

**Learned**: Next.js App Router에서 opengraph-image.tsx를 app/ 루트에 두면 사이트 전체 기본 OG 이미지가 자동 적용됨; 하위 폴더에 별도 파일을 두면 페이지별 맞춤 OG도 가능

### 2026-04-17
**Focus**: 결과 공유 기능 + OG 이미지 리브랜딩 디자인 적용
- 밈테스트/카카오페이/토스 스타일 공유 텍스트 패턴 조사 후 B안(정보형) 채택: `💍 + 금액 + 선택 요약 + CTA + URL`
- `src/lib/share.ts` 신규: `buildShareText()` + `shareResult()` — `navigator.share` → clipboard fallback, 반환값 `native | clipboard | aborted | failed`
- `budget-draft/page.tsx:713` 공유 버튼 onClick 연결 + fixed bottom 토스트(2초 자동 해제)
- GA 이벤트 `share_result` 추가 (method 파라미터로 수집)
- OG 이미지 전면 교체: 기존 오렌지 그라디언트 + 💰 이모지(리브랜딩 전 잔재) → A안 일러스트 각인형 (커플 일러스트 380×380 + 버짓로드 한글 세리프 로고 270×80 + "결혼 예산, 3분에 완성" 태그라인, `#F9FAFB` 배경)
- `next/og` ImageResponse에 `readFile` + base64 방식으로 public 에셋 로드 (네트워크 의존성 제거)
- PR #13 squash merge → 프로덕션 배포 (15초 만에 Ready)
- 카카오톡에서 새 OG 정상 확인, 텔레그램은 구버전 캐시 지속

**Learned**: `next/og`의 `<img>`는 명시적 `width`+`height` props 필수 — `style.width: 'auto'` 미지원 (Satori). 플랫폼별 OG 캐시는 독립이라 카톡/텔레그램/FB 각각 따로 갱신 필요(텔레그램은 `@WebpageBot`)

## Pending
- [x] 커스텀 도메인 확정 후 metadataBase URL 업데이트 ✔️ 2026-04-14 (budgetroad.vercel.app)
- [x] 배포 사이트에서 SNS 공유 미리보기 실제 테스트 (카카오톡) ✔️ 2026-04-17
- [ ] 텔레그램 OG 캐시 `@WebpageBot`으로 갱신 (구버전 잔재)
- [ ] GA `share_result` 이벤트 수집 확인

## Notes
- PR: https://github.com/mch9/wedding-budget/pull/7 (v1), #13 (v2 — share + illustration OG)
- OG 이미지 엔드포인트: /opengraph-image (빌드 시 정적 생성)
- 공유 텍스트 예시: `💍 내 결혼 예산 초안\n약 48,150,000원\n서울 (강남 외), 컨벤션, 스탠다드, ...\n\n나도 만들어보기 →\nhttps://budgetroad.vercel.app`
