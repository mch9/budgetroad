---
name: find-context
description: >
  현재 대화 주제에 대해 .omniscitus/history와 docs/prd 문서를 스캔하여
  과거 의사결정(why)과 교훈(lessons learned)만 추려 리포트.
  Trigger on "find-context", "과거 맥락", "이전에 왜", "맥락 찾아줘",
  "이전 결정 찾아줘", "과거 교훈".
argument-hint: "[topic] or empty to use current context"
---

# Find Context — Past Decisions & Lessons

현재 대화 주제에 대한 과거 기록을 찾아, **의사결정(Why)**과 **교훈(Lessons Learned)**만 추려서 리포트하는 skill. 기능 설명이나 작업 목록은 버리고, 결정의 근거와 배운 점만 남긴다.

## When to Use

- 사용자가 `/find-context`를 입력했을 때
- "이전에 왜 X로 결정했지?", "이 주제 관련 과거 기록 있나?" 같은 질문
- 새로운 결정을 내리기 전 동일/유사 주제 선행 작업 확인하고 싶을 때

## 검색 대상

| 경로 | 내용 |
|------|------|
| `.omniscitus/history/_index.yaml` | 전체 history 요약 인덱스 (먼저 읽기) |
| `.omniscitus/history/{devops,product,web}/*.md` | 완료된 작업 기록 |
| `.omniscitus/history/_weekly/*.md` | 주간 요약 |
| `docs/prd/**/*.md` | PRD 문서 (의사결정 근거 다수 포함) |
| `docs/prd/ROADMAP.md` | 경험 로드맵 |

## Instructions

### Step 1: 주제 포착

1. **argument가 있으면**: 그대로 주제로 사용, 바로 Step 2로.
2. **없으면**: 현재 대화 맥락에서 핵심 주제를 1~2문장으로 추출하고 사용자에게 확인:

```
이 주제로 과거 맥락을 찾을까요?
> {추출한 주제}
```

사용자가 수정하면 반영. 확정된 후에만 Step 2로 진행.

### Step 2: 후보 스캔 (Read 최소화)

후보를 선별할 때 **파일 전체를 Read하지 말고 인덱스/파일명/제목으로 매칭**한다.

1. `.omniscitus/history/_index.yaml` Read (1회)
   - `topic`, `title`, `summary` 필드를 주제와 매칭
2. `docs/prd/**/*.md`를 Glob으로 수집
   - 경로/파일명 키워드 매칭
3. `.omniscitus/history/_weekly/*.md`를 Glob으로 수집하여 주제 키워드가 포함된 주만 후보에 포함

관련성 높은 순으로 **최대 5개**만 Step 3로 넘김. 후보 0개면 Step 5로 점프.

### Step 3: 상세 Read + 추출

선별된 후보를 Read하여 아래 두 종류 정보만 추출:

- **Why (의사결정)**: "~로 결정", "~를 선택", "~대신 ~", "이유:" 같은 표현 주변의 문맥
- **Lessons (교훈)**: "문제", "실패", "주의", "다음엔", "피해야", "~에서 배운 것", "시행착오" 같은 표현 주변의 문맥

**버릴 것**: 단순 기능 설명, 작업 체크리스트, 구현 완료 로그, 일반 요약.

### Step 4: 리포트 작성

아래 포맷으로 출력:

```
📌 주제: {확정된 주제}

## 발견된 의사결정 (Why)
- **[{파일경로} § {섹션}]**
  > {원문 인용 — 짧게, 그대로}

## 교훈 (Lessons Learned)
- **[{파일경로} § {섹션}]**
  > {원문 인용 — 짧게, 그대로}

## 참고만 할 문서 (관련 약함)
- {파일경로} — {한 줄 이유}

---
검토: history {H}개 · prd {P}개 · weekly {W}개
```

섹션별로 항목이 0개면 해당 섹션은 통째로 생략한다.

### Step 5: 매칭 없음 케이스

```
📌 주제: {주제}

❌ 관련 과거 기록 없음.

검색 범위: history {N}개 / prd {M}개 / weekly {W}개

새로운 주제로 보입니다. 결정 후 `/wrap-up`으로 기록해두면
다음번 /find-context가 이 맥락을 잡을 수 있어요.
```

## Rules

- **원문 인용 필수**: 요약·의역은 환각 위험. 해당 문장을 그대로 짧게 따옴.
- **출처 명시 필수**: `{파일경로}` 또는 `{파일경로} § {섹션}` 형식.
- **분류 엄격**: why/lessons에 해당 안 되는 내용은 리포트에 넣지 않음. 억지로 채우지 말 것.
- **Read 상한 5개**: 후보 많으면 관련성 높은 상위 5개만 상세 Read.
- **읽기 전용**: 이 skill은 리포트만 출력. 파일 수정·생성 금지.
- **주제 확정 후 진행**: argument 없을 때 Step 1 확인을 건너뛰지 않음.
- **추론 덧붙이지 않기**: "이걸 지금 상황에 적용하면..." 같은 skill 자체의 해석은 보태지 않는다. 판단은 사용자 몫.
