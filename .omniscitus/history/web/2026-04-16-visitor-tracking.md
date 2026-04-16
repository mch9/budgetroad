# 비로그인 방문자 식별 및 재방문 추적

## Summary
localStorage 기반 visitor ID를 도입하여 로그인 없이 재방문 사용자를 식별. GA 이벤트에 visitor_id와 is_returning 자동 포함.

## Context
- **Background**: 핵심 KPI 중 P(Revisited | Intent Created) 재방문율을 측정하려면 같은 사용자를 식별해야 하는데, 현재 로그인 기능이 없음
- **Requirements**: 첫 방문 vs 재방문 구분, GA에서 같은 사용자의 여러 세션을 묶어 분석 가능
- **Decisions**: localStorage + UUID 방식 선택 (Cookie/Fingerprinting 대비 구현 가장 단순, 서버 불필요, MVP에 적합)
- **Constraints**: 브라우저/기기 변경 시 다른 사용자로 인식됨 (로그인 없이는 모든 방식의 공통 한계)

## Timeline

### 2026-04-16
**Focus**: visitor ID 생성 + GA 이벤트 연동
- src/lib/visitor.ts 생성: getVisitorId() (UUID 생성/저장), isReturningVisitor() (재방문 판별)
- src/lib/gtag.ts 수정: 모든 trackEvent 호출에 visitor_id 자동 포함
- TrackPageEnter 수정: 페이지 진입 시 is_returning: "yes"/"no" 전송
- Google Search Console에 budgetroad.vercel.app 새 속성 등록 + 사이트맵 제출 안내

**Learned**: crypto.randomUUID()는 모든 모던 브라우저에서 네이티브 지원되어 UUID v4 생성에 외부 라이브러리 불필요

## Pending
- [ ] GA에서 visitor_id 커스텀 차원 설정 (GA4 관리 > 맞춤 정의)
- [ ] 재방문율 대시보드 구성
- [ ] 로그인 기능 추가 시 visitor_id와 계정 연결

## Notes
- visitor ID 저장 키: budgetroad_visitor_id
- 나중에 로그인을 붙이면 localStorage ID → 계정 매핑으로 자연 확장 가능
