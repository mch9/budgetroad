# CI/CD 파이프라인 및 Vercel 배포 설정

## Summary
GitHub 리포 생성, GitHub Actions CI/CD 파이프라인(lint→build→deploy) 구성, Vercel 프로덕션 배포, Slack 알림 연동까지 전체 DevOps 파이프라인을 완성한 세션.

## Context
- **Background**: MVP 프론트엔드 구현 완료 후, 코드를 GitHub에 올리고 자동 검사/배포 시스템을 구축하는 단계
- **Requirements**: main 브랜치 push 시 자동 lint→build→deploy, 각 단계별 Slack 알림
- **Decisions**: action-slack@v3 사용; Slack webhook은 env로 전달(with가 아닌 env); squash merge 기본 설정; GitHub Free 플랜이라 branch protection 대신 CLAUDE.md 규칙으로 대체
- **Constraints**: GitHub Free 비공개 저장소에서는 branch protection 미지원; vercel link 시 GitHub 자동 연결 실패(수동 CLI 배포로 우회)

## Timeline

### 2026-04-11
**Focus**: GitHub 리포 + CI/CD + Vercel 배포 전체 파이프라인 구축
- GitHub CLI 로그인 및 비공개 저장소 생성 (mch9/wedding-budget)
- master→main 브랜치 리네임 후 push
- squash merge 기본, merge 후 브랜치 자동 삭제 설정
- GitHub Actions CI 워크플로우 생성 (lint→build→deploy)
- Slack Incoming Webhook 설정 및 GitHub Secrets 등록
- CI 첫 실행: lint 에러(cumulativeDeg) + Slack webhook_url 설정 오류 발견 → 수정
- Vercel CLI 설치, 로그인, 프로젝트 연결, 프로덕션 배포 완료
- GitHub Actions에 자동 deploy job 추가 (Vercel Token/Org ID/Project ID Secrets 등록)
- 전체 파이프라인 성공 확인 (lint ✅ → build ✅ → deploy ✅ → Slack ✅)
- 워크숍 스킬(0~10번) 정리 삭제, 프로젝트 최종 확인 완료

**Learned**: action-slack@v3의 webhook_url은 `with`가 아닌 `env.SLACK_WEBHOOK_URL`로 전달해야 함

## Pending
- [ ] GitHub 리포에 Vercel Git 연결 (대시보드에서 수동 연결 필요)
- [ ] GA 측정 ID 환경변수 설정 (`NEXT_PUBLIC_GA_ID`)
- [ ] OG 이미지 제작 및 추가
- [ ] 커스텀 도메인 연결 (필요 시)

## Notes
- 배포 URL: https://wedding-budget-chi.vercel.app
- GitHub: https://github.com/mch9/wedding-budget
- Vercel Project ID: prj_EshVRNvQcXeRYYRjuVBSydUPpXzp
- Slack Webhook 채널: Wedding Budget 워크스페이스
