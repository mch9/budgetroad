# OG 이미지 및 소셜 공유 최적화

## Summary
SNS 공유 시 미리보기 카드에 표시될 OG 이미지를 코드 기반으로 생성하고, metadataBase를 설정하여 소셜 공유 환경을 완성.

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

## Pending
- [x] 커스텀 도메인 확정 후 metadataBase URL 업데이트 ✔️ 2026-04-14 (budgetroad.vercel.app)
- [ ] 배포 사이트에서 SNS 공유 미리보기 실제 테스트 (카카오톡, 슬랙 등)

## Notes
- PR: https://github.com/mch9/wedding-budget/pull/7
- OG 이미지 엔드포인트: /opengraph-image (빌드 시 정적 생성)
