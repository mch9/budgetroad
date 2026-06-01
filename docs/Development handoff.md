- 개발핸드오프
    
    # 버짓로드 개발 핸드오프 문서
    
    결혼 취향 진단 + 예산 설계서 서비스 — 백엔드·프론트엔드 구현 명세
    
    ---
    
    ## 0. 아키텍처 요약
    
    ```
    [프론트엔드 React]  ──GET /questions──▶  [백엔드 API]  ──▶  [계산 엔진(순수함수)]
           │            ──POST /diagnose──▶                          │
           │            ◀──결과+계산컨텍스트──                      ▼
           │                                                    [DB: pricing 등]
           └─ 토글 ON/OFF → 클라이언트에서 즉시 재계산 (서버 왕복 X)
    ```
    
    - **계산 엔진은 결정론적 규칙 기반.** LLM 사용 안 함 (분류·계산·진단 전부 규칙). 같은 입력 → 같은 결과.
    - **토글 재계산은 클라이언트.** `/diagnose` 응답에 단가·기본값·밴드를 담은 계산 컨텍스트를 함께 내려, 토글 시 로컬 재계산.
    - **권장 스택:** 백엔드 Node(Express/NestJS) 또는 Python(FastAPI) · DB PostgreSQL · 프론트 React(Next.js). 계산 엔진은 BE·FE 공유 가능한 순수 모듈(TS 권장).
    
    ---
    
    ## 1. 데이터베이스 스키마
    
    ### 1-1. questions (질문)
    
    ```
    questions
      id            TEXT PK        -- 'q1','q2',...,'t2','m1','m5'
      order_no      INT            -- 노출 순서 1~13
      group         TEXT           -- 'type' | 'tag' | 'modifier'
      axis          TEXT NULL      -- 'A' | 'B' (type 질문만)
      text          TEXT
      hint          TEXT NULL
    options
      id            SERIAL PK
      question_id   TEXT FK
      order_no      INT
      label         TEXT
      score_a       INT NULL       -- type 질문: 축A 가중치
      score_b       INT NULL       -- type 질문: 축B 가중치
      tag           TEXT NULL      -- tag 질문: '무드집착' 등
      value         JSONB NULL     -- modifier 질문: 숫자 또는 지역키
    ```
    
    ### 1-2. pricing (가격 DB — 업로드 CSV 구조)
    
    ```
    pricing
      id            SERIAL PK
      region        TEXT           -- '서울','수도권','광역시','지방','전국' ...
      month         TEXT           -- 시기 '4월' (시즌 보정용)
      category      TEXT           -- '스튜디오','드레스','메이크업','예식장'
      item          TEXT           -- 항목명
      item_type     TEXT           -- '필수' | '선택'
      p10 p25 mid p75 p90  INT     -- 하위10/하위25/중간값/상위25/상위10
    ```
    
    ※ 기본값은 `mid`(중간값) 사용. 스튜디오 선택 항목 단가는 현재 이상치(3만 균일) → 재확인 후 반영.
    
    ### 1-3. type_config (유형 설정)
    
    ```
    type_config
      id            TEXT PK        -- 'trad','std','exp','mini','none'
      title         TEXT           -- '전통 격식형'
      desc          TEXT
      tags          JSONB          -- ['#격식_중시', ...]
      base_dress    TEXT           -- 'full'(본식+촬영) | 'bon'(본식만)
      base_makeup   TEXT           -- 'won'|'bu'|'sil' (원장/부원장/실장)
      base_bonsik   TEXT           -- 'venue'(예식장연계80) | 'pro'(외부150,추정)
      default_on    JSONB          -- 기본 ON 토글 항목 id 배열
      band_min      INT            -- 정합성 진단 하한 (core)
      band_max      INT            -- 정합성 진단 상한
      off_type      JSONB          -- 성향 충돌 항목 id 배열
      yemul honsu honeymoon  INT   -- 기타 추정값 (DB 확보 시 교체)
    ```
    
    ### 1-4. toggle_items (추가금 항목)
    
    ```
    toggle_items
      id            TEXT PK        -- '드레스 지정','생화 꽃장식' ...
      category      TEXT           -- '스튜디오'|'드레스'|'메이크업'|'예식장 연출'|'예식장 진행·가족'
      price         INT            -- 만원 (생화는 region_profiles에서 지역별)
      is_estimate   BOOL           -- 추정 단가 여부(스튜디오 옵션 true)
      desc          TEXT NULL      -- 사용자 설명 ('드레스 지정' = 기본 외 드레스 선택비)
      region_priced BOOL           -- 생화처럼 지역별 단가면 true
    ```
    
    ### 1-5. region_profiles (지역 프로파일)
    
    ```
    region_profiles
      region        TEXT PK        -- '서울','수도권','광역시','지방'
      sdm_coef      DECIMAL        -- 스드메 지역계수
      bojeung       INT            -- 보증인원
      per_head      INT            -- 1인당 식대
      daegwan       INT            -- 대관비용
      base_meal     INT            -- 기본식대 총금액
      flower        INT            -- 생화꽃장식 단가
    ```
    
    초기 시드값:
    
    | region | sdm_coef | bojeung | per_head | daegwan | base_meal | flower |
    | --- | --- | --- | --- | --- | --- | --- |
    | 서울 | 1.09 | 200 | 8 | 590 | 1540 | 550 |
    | 수도권 | 1.01 | 200 | 7 | 550 | 1450 | 450 |
    | 광역시 | 1.00 | 200 | 5 | 280 | 940 | 150 |
    | 지방 | 0.95 | 200 | 5 | 250 | 900 | 100 |
    
    ---
    
    ## 2. API 명세
    
    ### 2-1. GET /api/v1/questions
    
    질문지 전체 반환 (프론트가 렌더).
    
    ```json
    {
      "questions": [
        { "id":"q1","group":"type","axis":"B","text":"추가로 100만 원을...","hint":null,
          "options":[
            {"label":"하객 식사 퀄리티","scoreA":0,"scoreB":2},
            {"label":"사진·영상 퀄리티","scoreA":0,"scoreB":-2},
            {"label":"혼주·폐백 양가 항목","scoreA":1,"scoreB":1},
            {"label":"신혼집·신혼여행","scoreA":-1,"scoreB":-2}
          ]},
        { "id":"t2","group":"tag","text":"드레스 지정비가 붙는다면?","hint":"지정비 = 기본 외 드레스 선택 추가금",
          "options":[{"label":"...","tag":"무드집착"},{"label":"...","tag":"현실타협"},{"label":"...","tag":"최소비용"}]},
        { "id":"m1","group":"modifier","text":"전체 예산은?","hint":"양가 지원 포함",
          "options":[{"label":"2천 미만","value":1800},{"label":"2~3.5천","value":2750},{"label":"3.5~5천","value":4250},{"label":"5천+","value":5500}]},
        { "id":"m5","group":"modifier","text":"예식 지역은?",
          "options":[{"label":"서울","value":"서울"},{"label":"수도권","value":"수도권"},{"label":"광역시","value":"광역시"},{"label":"지방","value":"지방"}]}
      ]
    }
    ```
    
    ### 2-2. POST /api/v1/diagnose
    
    **요청**
    
    ```json
    { "answers": { "q1":0,"q2":1,"q3":0,"q4":1,"q7":2,"q8":0,
                   "t2":0,"t5":0,"t7":2,"m1":1,"m2":1,"m3":0,"m5":"수도권" } }
    ```
    
    (값 = 선택한 옵션 인덱스, m5는 지역키)
    
    **응답** (결과 페이지 + 클라이언트 재계산 컨텍스트)
    
    ```json
    {
      "type": {"id":"mini","title":"본질 미니멀형","desc":"...","tags":["#본질만","#신혼생활_우선"]},
      "axisScore": {"a":-3,"b":-4},
      "venue": {
        "form":"레스토랑 · 스몰 베뉴", "alt":"또는 셀프·하우스 웨딩",
        "reasons":[
          {"label":"유형 · 본질미니멀","text":"보증인원 부담 적은 소규모가 핵심"},
          {"label":"하객 · 40명","text":"보증인원 낮은 공간이 유리해요"},
          {"label":"태그 · 생활우선","text":"대관·보증 부담 적은 실속형 공간"}
        ],
        "pricingAvailable": false
      },
      "budget": {
        "total": 2480, "core": 1680, "target": 1800, "diff": 680, "overTarget": true,
        "categories": {"venue":1730,"studio":140,"dress":146,"makeup":64,"yemul":150,"honsu":600,"honeymoon":300},
        "venueDetail": {"meal":1450,"daegwan":550,"jangsik":0,"bonsik":80,"venueOpt":0,
                        "guests":40,"bojeung":200,"perHead":7,"belowBojeung":true}
      },
      "diagnosis": {
        "status":"warn",
        "headline":"미니멀 지향과 웨딩홀 구조가 안 맞아요",
        "body":"하객 40명인데 보증인원 200명을 채워야 해 기본식대+대관이 그대로... 추천 스몰 베뉴로 가야 진짜 미니멀 예산이 됩니다."
      },
      "advice": {
        "save":[{"title":"추천한 스몰 베뉴로 변경","desc":"식대+대관 2000만 → 절반 이하","amount":null}],
        "invest":[{"title":"신혼집·자산 안정","desc":"결혼식보다 이후 생활에 무게"}]
      },
      "warnings": {"yangga": false},
      "todos": [{"rank":1,"title":"올인원·스몰 베뉴 비교","desc":"보증인원 낮은 곳 우선 탐색"}],
      "calcContext": {
        "region": {"sdmCoef":1.01,"bojeung":200,"perHead":7,"daegwan":550,"baseMeal":1450,"flower":450},
        "base": {"studio":139,"dress":145,"makeup":63,"bonsik":80},
        "band": {"min":1000,"max":2200},
        "offType": ["드레스 지정","가봉 스냅","퍼스트웨어","서브 스냅","원본 구매","2부 드레스","생화 꽃장식"],
        "etc": {"yemul":150,"honsu":600,"honeymoon":300},
        "guests":40, "target":1800,
        "toggles": [
          {"id":"드레스 지정","category":"드레스","price":100,"isEstimate":false,"isOn":false,"desc":"기본 외 드레스 선택비"},
          {"id":"생화 꽃장식","category":"예식장 연출","price":450,"isEstimate":false,"isOn":false,"regionPriced":true}
        ]
      }
    }
    ```
    
    ### 2-3. GET /api/v1/pricing (선택)
    
    지역·항목 단가 조회 (관리/디버그용).
    
    ---
    
    ## 3. 계산 엔진 (8단계 · 순수 함수)
    
    `diagnose(answers, db) → result` 형태의 결정론적 함수. 별도 상세 스펙은 `결과페이지_계산알고리즘_v2.md` 참조. 핵심 함수 분리:
    
    ```
    scoreType(answers)        → {a, b}                     # STAGE 1
    classifyType(a, b)        → typeId                      # STAGE 2
    setupVars(answers, type)  → {region, guests, target, yangga, base, toggleDefaults}  # STAGE 3
    recommendVenue(...)       → {form, alt, reasons}        # STAGE 4
    calcBudget(...)           → {core, total, categories, venueDetail}  # STAGE 5
    diagnose Consistency(...) → {status, headline, body}    # STAGE 6
    buildAdvice(...)          → {save, invest}              # STAGE 7
    assembleResult(...)       → 응답 JSON                   # STAGE 8
    ```
    
    ### 핵심 공식
    
    ```
    유형 분류: |a|<=1 & |b|<=1 → none / a>=0,b>=0 → trad / a<0,b>=0 → std
              / a>=0,b<0 → exp / else → mini
    식대: guests>=bojeung ? guests*perHead (대관0) : baseMeal + daegwan
    스드메 = (139 + dressBase + makeupBase + ON옵션) * sdmCoef
    예식장 = 식대 + 대관 + 0(기본장식) + bonsik + ON연출·진행 (생화=지역단가)
    core  = 스드메 + 예식장
    total = core + 기타(예물+혼수+신혼여행)
    진단: mini & guests<bojeung → WARN / core>band.max → OVER
         / core<band.min → UNDER / else → FIT
    ```
    
    ---
    
    ## 4. 프론트엔드 구조
    
    ### 4-1. 화면 플로우
    
    ```
    /  진입(브랜드+시작)
     → /quiz   질문 13문항 (스텝 or 스크롤, 진행률 표시)
     → POST /diagnose
     → /result 결과 (3탭: 종합설계서 / 항목별내역 / 추가금케어)
    ```
    
    ### 4-2. 컴포넌트 트리
    
    ```
    <App>
      <QuizFlow>
        <ProgressBar/>
        <QuestionCard question option선택/>      # 13개 반복
        <SubmitButton/>                          # 13개 응답 시 활성
      <ResultPage result={diagnoseResponse}>
        <Tabs/>
        [종합설계서]
          <TypeHero/>            # 유형 제목·설명·태그
          <VenueCard/>           # 추천 식장 형태 + 대안 + 이유  ★
          <BudgetHero/>          # 총합 + 목표 대비
          <DiagnosisCard/>       # 정합성 진단 (status 색상)
          <ReasonList/> <SaveList/> <InvestList/> <YanggaWarn/> <TodoList/>
        [항목별내역]
          <VenueCalcBox/> <CategoryBreakdown/> <TotalRow/>
        [추가금케어]
          <ToggleList/>          # 카테고리별 토글 (desc 표시)
          <RiskList/>
          <StickyTotal/>         # 실시간 총액
    ```
    
    ### 4-3. 상태 관리
    
    ```
    answers:  { [questionId]: optionIndex }     # 퀴즈 단계
    result:   POST /diagnose 응답 전체           # 결과 진입 시 1회
    toggleState: { [itemId]: boolean }           # calcContext.toggles로 초기화
    ```
    
    ### 4-4. 토글 실시간 재계산 (클라이언트)
    
    `calcContext`를 받아 `recalc(toggleState, calcContext)` 로컬 함수로 즉시 계산:
    
    ```
    변경 발생 → recalc() → { core, total } 갱신
             → 진단 재평가(WARN/OVER/UNDER/FIT) → DiagnosisCard·SaveList 갱신
             → StickyTotal·BudgetHero 갱신
    ```
    
    서버 왕복 없음. 엔진 로직(STAGE 5·6·7)을 BE·FE 공유 모듈로 두면 중복 제거.
    
    ---
    
    ## 5. 구현 순서 (권장)
    
    1. **계산 엔진(순수 함수) + 단위 테스트** — answers 픽스처로 4유형·미결정·WARN 케이스 검증
    2. **DB 시드** — questions / type_config / region_profiles / toggle_items / pricing(CSV 임포트)
    3. **API** — GET /questions, POST /diagnose (엔진 호출 + calcContext 동봉)
    4. **프론트 퀴즈 플로우** — 질문 렌더 + 응답 수집 + 제출
    5. **프론트 결과 3탭** — 응답 렌더
    6. **클라이언트 토글 재계산** — 공유 엔진 모듈로 로컬 갱신
    7. **세션/저장**(선택) — 결과 공유 링크, 재방문
    
    ---
    
    ## 6. 미해결 데이터 (개발 전 확정 권장)
    
    | 항목 | 현재 | 필요 조치 |
    | --- | --- | --- |
    | 스튜디오 선택 항목 단가 | 추정(3만 이상치) | 리서치팀 재확인 |
    | 식장 형태별 가격 | 일반 웨딩홀만 | 호텔/하우스/스몰베뉴 프로파일 추가 → 추천 형태별 정확 예산 |
    | 예물·혼수·신혼여행 | 유형별 추정 | 실데이터 확보 시 type_config 교체 |
    | Q2 태그 방향 | 내용 기준 보정 적용 | 원 의도 최종 확인 |
    | 진단 밴드 수치 | 초기 추정값 | 실사용 데이터로 보정 |
    
    ---
    
    ## 7. AI 개발 시 주의
    
    - 계산·분류·진단은 **반드시 결정론적 코드**로 구현. LLM에 맡기면 같은 입력에 다른 결과가 나와 신뢰 붕괴.
    - LLM은 **조언 문구 자연스럽게 다듬기**에만 선택적으로 사용 가능 (템플릿 결과를 입력으로). 금액·형태·유형은 절대 LLM 생성 금지.
    - AI 코딩 도구에는 이 문서 + `결과페이지_계산알고리즘_v2.md` + 응답 스키마를 함께 전달하고, "계산 엔진을 순수 함수 + 테스트로 먼저" 지시.
    
    ---
    
    *프로토타입(final_prototype_with_venue)의 JS 로직이 곧 이 엔진의 레퍼런스 구현입니다.*