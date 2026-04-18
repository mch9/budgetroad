# CI Lint 에러 + Slack 알림 스팸 해결

**Participants**: mincheol.kim, claude

## Summary
Slack과 GitHub commit 목록에 "Lint ❌ 실패"가 반복적으로 뜨던 원인을 추적해, React 19 새 lint 룰 2건과 notify-complete 잡의 상태 처리 버그 1건을 해결. PR #14, #15 연속 merge로 파이프라인 복구.

## Context
- **Background**: Slack 채널과 GitHub main commit 목록에 지속적으로 "Lint ❌ 실패" 알림이 뜨고 각 커밋에 빨간 X(1/5)가 찍힘. `f2561d72` ("feat: result sharing + OG image redesign") 이후 모든 main push/PR이 같은 증상.
- **Requirements**: (1) Lint CI 통과, (2) Slack 스팸 중지, (3) GitHub commit 체크를 녹색으로 복구. 과거 커밋의 X는 포기(retroactive 재실행 비현실적).
- **Decisions**:
  1. `useRef(Date.now())` → `useState(() => Date.now())` lazy initializer로 치환 (`react-hooks/purity` 룰 대응). `useState` lazy init는 컴포넌트 lifetime에 1번만 호출되므로 룰 예외로 인정됨.
  2. sessionStorage 복원 `useEffect`에 block-level `eslint-disable react-hooks/set-state-in-effect` 주석. lazy `useState(() => sessionStorage.getItem(...))` 대체 시 SSR hydration mismatch가 발생하므로 `useEffect` 패턴이 정공법이며 룰이 false positive.
  3. notify-complete 잡에 `if: always() && github.event_name == 'push'` 조건 추가 → PR 브랜치에서는 잡 자체를 skip (Slack 노이즈 제거).
  4. `status` 표현식을 `${{ needs.deploy.result == 'skipped' && needs.build.result || needs.deploy.result }}` 삼항으로 변경 → develop push(`deploy.result='skipped'`) 시 build 결과로 폴백.
- **Constraints**:
  - repo 설정이 squash merge만 허용 (allow_merge_commit/rebase=false) → 여러 fix 커밋이 단일 squash로 병합됨.
  - `action-slack@v3`는 `status` 값으로 `success`/`failure`/`cancelled`/`custom`만 수용 → `'skipped'`는 에러.
  - `'use client'` 페이지라도 Next.js가 서버에서 초기 렌더 → sessionStorage 기반 lazy init는 hydration error 위험.

## Timeline

### 2026-04-18
**Focus**: CI lint 에러 추적 → purity 룰 + set-state-in-effect 룰 + notify-complete 버그 순차 해결, 2개 PR 병합

- `gh run view`로 실패 로그 확인 → `src/app/budget-draft/page.tsx:36:28`의 `Date.now` impure 호출 에러 1건 발견
- 파일 전체 맥락 읽고 `enteredAt` ref의 용도(첫 입력까지 경과시간 GA 기록) 파악 → `useState` lazy init로 교체 (2곳 수정)
- 로컬 lint 재실행 → `react-hooks/set-state-in-effect` 에러가 새로 노출. CI 로그에는 이 에러가 안 뜨던 이유는 첫 error에서 lint가 멈췄기 때문이 아니라 `eslint-plugin-react-hooks` 버전 차이로 추정
- PR #14에 fix 2건을 올려놓고 CI push → 예상과 달리 CI에서도 `set-state-in-effect`가 에러로 뜸 (규칙 메시지는 로컬과 다름: "Calling setState synchronously within an effect can trigger cascading renders")
- sessionStorage 복원 블록은 SSR 호환 위해 effect가 정답이라 판단 → block-level `eslint-disable`/`enable` 주석으로 해결
- CI 성공 확인 후 PR #14 squash merge (`1409e8f`)
- 이어서 `notify-complete` 잡이 PR에서 실패하는 현상 확인 — `needs.deploy.result='skipped'`가 action-slack에 전달되어 에러. PR #15로 `if` 조건 + status 삼항 동시 수정
- PR #15 CI에서 "전체 완료 알림: SKIPPED" 확인 → squash merge (`8ef4611`)
- main에 녹색 체크 5/5 확인, local 정리

**Learned**:
- `react-hooks/purity`와 `react-hooks/set-state-in-effect`는 React 19에서 새로 도입된 룰. 버전 차이로 CI와 로컬이 다른 에러를 노출할 수 있음.
- `useRef(impureFn())`는 모두 `useState(() => impureFn())`로 교체 가능. mutable ref가 필요 없으면 더 idiomatic.
- GitHub Actions의 `||` 단락평가는 non-empty 문자열을 truthy로 보기 때문에 `'skipped' || 'success'` → `'skipped'`가 나옴. 폴백을 원하면 `X == 'skipped' && Y || X` 같은 명시적 삼항 필요.
- 과거 commit의 CI 상태는 GitHub가 retroactively 재계산하지 않음. "앞으로 녹색"이 최선이고 과거 X는 받아들여야 함.

## Pending
- [x] lint error 해결 (PR #14) ✔️
- [x] notify-complete 버그 해결 (PR #15) ✔️
- [x] main에 녹색 체크 확인 ✔️

## Notes
- 관련 커밋: `2ed4590`, `149e214` (lint fix) → squash `1409e8f`; `8702985`, `4c0d897` (notify-complete fix) → squash `8ef4611`
- 건드린 파일: `src/app/budget-draft/page.tsx`, `.github/workflows/ci.yml`
- 미해결 warnings (lint exit 0이라 CI 안 깨짐, 별도 정리 필요): `HONEYMOON_OPTIONS` 미사용 import, `<img>` vs `next/image`, `OptionCard`의 `T`/`desc`/`icon` prop 미사용, `apple-icon.tsx`/`icon.tsx`의 불필요 eslint-disable 주석, `page.tsx`의 `dash` 미사용 변수, Step4 `useEffect` 의존성 누락
- Node.js 20 actions deprecation 경고가 GitHub Actions에서 출력됨 — 2026-06-02 이후 강제 Node 24, 2026-09-16 Node 20 제거 예정. `actions/checkout`, `8398a7/action-slack` 업그레이드 필요
