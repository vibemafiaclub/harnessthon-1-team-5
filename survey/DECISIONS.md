# DECISIONS — grill 세션 결정 기록

> `/grill-me` 세션 (2026-08-01). 한 문항씩 확정한 결과.
> 근거 id는 [`60-data/sources.jsonl`](./60-data/sources.jsonl), 주장 id는 [`70-analysis/claim_ledger.jsonl`](./70-analysis/claim_ledger.jsonl).
> 설계 반영: [`HARNESS_DESIGN_v2.md`](./HARNESS_DESIGN_v2.md)

---

## 확정된 결정 (5건)

### D1. DESIGN.md를 **부분 채택** — 토큰 + `components:` 바인딩까지

**결정**: 산출물 전체를 DESIGN.md에 종속시키지 않되, 토큰과 컴포넌트 바인딩은 DESIGN.md로 쓰고
`designmd lint`를 살아있는 게이트로 쓴다.

**왜 `components:`까지인가 — 실측이 결정했다**

| DESIGN.md 내용 | lint 결과 |
|---|---|
| 토큰만 (`components:` 없음) | **findings 0건, exit 0 — 게이트 무동작** |
| `components:` 포함 | `orphaned-tokens` + `contrast-ratio` + `broken-ref` 발화 |

`orphaned-tokens`는 "never referenced by **any component**", `contrast-ratio`는 같은 component의
`backgroundColor`+`textColor` 쌍에서만 계산한다. **게이트의 가치가 전부 `components:`에 걸려 있다.**

**근거**: clm_008·009·010 (전부 `verdict: confirmed`, 실행 증적 `70-analysis/execution-proofs/`)

**귀결**: `stage-designmd`의 done 정의 = **`designmd lint` errors=0 且 warnings=0**
(contrast는 severity가 warning이라 exit 0 → **우리가 warning을 실패로 취급**해야 함)

---

### D2. `stage-evaluate`를 **별도 단계로 신설** (조장 승인 사안 → 승인)

**결정**: `penpot-design/SKILL.md` 절차 4번 "자기점검"을 폐기하고 evaluator를 독립 sub agent로 분리.

**근거**
- `src_005` (Anthropic, 2026-03-24): *"When asked to evaluate work they've produced, agents tend to
  respond by **confidently praising the work**"* / *"**separating the agent doing the work from the agent
  judging it** proves to be a strong lever"*
- `src_014` (Anthropic, 2026-01-09)가 독립 수렴 → **clm_001 삼각검증**
- `src_022` (Böckeler 2×2): 우리 레포는 Sensors 행이 통째로 비어 있는 **`feedforward-only` 안티패턴**

---

### D3. **하네스 우선 — 디자인은 하네스가 내게 한다**

**결정**: TOP 3와 Best 1을 겨냥해 갈라치지 않는다. 좋은 하네스를 돌리면 좋은 디자인이 나온다를
검증하는 데 집중하고, evaluator threshold를 실제 품질 레버로 쓴다.

**맥락**: 채점 구조상 두 상은 **상호배타적**이다 — "Best 1 (**TOP 3 제외 후 선정**)".
행사 취지("하네스톤은 경쟁이 아닌, **공동 연구**를 목표로 합니다")와도 이 선택이 맞는다.

**귀결**: `stage-attribute`를 **설계만이 아니라 실제로 구현**한다. 손으로 화면을 다듬지 않는다.

---

### D4. evaluator threshold는 **단계적 상향**

**결정**

| 라운드 | 기준 |
|---|---|
| 1라운드 (통과 필수) | 정렬 90% · contrast 위반 0 · 기본명(`Board 1`) 0 · `designmd lint` errors 0 |
| 2라운드 (통과 시 상향) | 정렬 100% · 토큰 적용률 90% · 위계 깊이 2~4 · orphaned-tokens 0 |
| 예산 소진 시 | **마지막으로 통과한 상태로 확정**하고 정직하게 보고 |

**근거**
- `src_008b` (TAG): *"the full pipeline achieves **80%, not 100%**, because the generation-time
  **retry budget is bounded**"* — 100%를 요구하면 산출물이 안 나온다
- `src_008b` 실패 모드: **test oscillation**(경쟁 제약 사이 왕복), **retry budget 소진**("the most
  common termination mode for failed runs")
- `src_014`: *"agents regularly find **valid approaches that eval designers didn't anticipate**"* →
  구현 경로가 아니라 결과 속성만 검사

**무한루프 방지**: 같은 축이 2회 연속 FAIL → attribute 호출 대신 **사람에게 에스컬레이션**.
attribute가 같은 단계를 3회 지목 → 그 단계를 재작성 대상으로 승격.

---

### D5. sealed holdout PRD **3개 작성 · 1개 봉인**

**결정**: 도메인이 서로 다른 PRD 3개(커머스 · 대시보드 · 콘텐츠)를 먼저 쓴다.
**2개로 개발하고 1개는 파일을 열지 않는다.** 마지막에 딱 한 번 돌려 재현성을 실측한다.

**왜 이게 없으면 안 되는가**

`src_018`: *"prompt optimization methods **iteratively rewrite prompts using LLM-generated feedback**,
but the resulting prompts often become longer, **accumulate narrow sample-specific rules**, and
**generalize poorly beyond the training distribution**"*

**`stage-attribute`(IDEA 3)가 정확히 저 방법론이다.** 가드 없이 돌리면 지침이 길어지고 이번 PRD 전용
규칙이 쌓여 심사용 PRD에서 무너진다 — **B트랙 재현성 점수를 스스로 파괴한다.**

`src_018` 대응책: *"keeping a **sealed holdout set never inspected until release day**"*

**귀결**: 이게 B트랙 "재현성"을 **주장이 아니라 실측으로** 보이는 유일한 경로다.

---

## 아직 확정 안 된 것 (기본값 제안 — 이의 없으면 이대로 간다)

| # | 결정 | 제안 기본값 | 근거 |
|---|---|---|---|
| P1 | `stage-attribute`의 지침 패치 적용 방식 | **제안만 남긴다** (`07-patch.md`에 diff). 자동 적용 금지 | `research-survey`가 같은 경계를 택함("사람 승인 경유"). D5의 과적합 위험과 직결 |
| P2 | 대표 화면(pilot) 선정 | **자동 선정 + 사람 거부권**. `01-reference.md`의 "적용할 화면" 열에서 최빈 화면 | IDEA 1과 IDEA 2가 맞물리는 지점 |
| P3 | 7단계를 5명에게 배분 | `{1,2}` `{3}` `{4}` `{5}` `{6,7}` — 1·2는 병렬이고 7은 조건부라 묶임 | `AGENTS.md` "각 단계 = sub agent 1개" 유지 |

---

## 이 결정들이 바꾸는 것 — 레포 변경 목록

| 대상 | 변경 | 승인 |
|---|---|---|
| `AGENTS.md:83`, `README.md:17,37` | Penpot 주소를 `penpot.tail45121d.ts.net`로 (현재 주소는 **연결 실패** 실측) | 🔒 조장 |
| `penpot-design/SKILL.md:63` | `기존파일` → **`1-daangn`·`2-airbnb`** | 🔒 조장 |
| `AGENTS.md` Page 표 | 채점 대상 = **`심사용` 파일**의 `최종제출` | 🔒 조장 |
| `start/SKILL.md` | 7단계 표 + 실행 순서 기입 (`HARNESS_DESIGN_v2.md §4`) | 🔒 조장 |
| `penpot-design/SKILL.md` 절차 4 | "자기점검" **삭제** (D2) | 📦 자유 |
| `penpot-design/cheatsheet.md` | 침묵 실패 3종 + `penpotUtils` 검증 함수군 + hex 대문자 + `addFlexLayout` 주의 추가 | 📦 자유 |
| `.claude/agents/stage-*.md` | **7개 신규 작성** (계약 5항목) | ✅ 담당자 |
| `docs/PRD-{a,b,sealed}.md` | holdout 3종 신규 (D5) | ✅ |

---

## 여전히 막혀 있는 것

**Penpot 브라우저 플러그인이 연결돼 있지 않다.** `use_figma`가 `return 1+1`조차 30초 타임아웃.
Notion 4스텝의 Step 2·3(로그인 + 플러그인 Connect)이 미완이다.

이것 때문에 막힌 것:

| unresolved | 내용 |
|---|---|
| clm_005 | Penpot Tokens Plugin API가 실제로 동작하는가 (issue#7916은 2026-02-09 CLOSED 확인했으나 실행 증적 0) |
| clm_006 | **토큰 수식 `{space.base} * 2`가 실제로 계산되는가** — 재현성 설계의 핵심 |
| — | DTCG JSON → Penpot import가 무손실인가 (타입 부분교집합) |
| — | `analyzeDescendants`가 30초 안에 완주하는가 (evaluator가 타임아웃하면 무용) |

**Step 2·3만 끝나면 4건 전부 즉시 검증 가능하다.**

---

## 기본값 3건 확정 (이의 없이 채택)

| # | 결정 | 확정 |
|---|---|---|
| P1 | attribute의 지침 패치 | **제안만** — `07-patch.md`에 diff. `.claude/` 직접 수정 금지(G1) |
| P2 | 대표 화면 선정 | **자동 + 사람 거부권** — 원칙표 "적용할 화면" 최빈값, 동점 시 3단 판정 |
| P3 | 배분 | `{1,2}` `{3}` `{4}` `{5}` `{6,7}` — 5명 |

---

## 구축 기록 (2026-08-01)

### Step 2 — 공용 파일 불일치 수정 ✅

| 대상 | 변경 |
|---|---|
| `AGENTS.md` | 주소 → `penpot.tail45121d.ts.net` / Page 표에 `1-daangn`·`2-airbnb` / 채점 대상은 **`심사용` 파일** 명시 |
| `README.md` | 주소 3곳 / Step 2를 "새 파일 생성"에서 "`5조`→`작업` 열기"로 정정 + 로그인 규칙 / 없는 `participant-onboarding.md` 참조 제거하고 **트러블슈팅 표 9행 직접 수록** |
| `penpot-design/SKILL.md` | `기존파일` → `1-daangn`·`2-airbnb` (+ `getPageByName` 사용, 30초 타임아웃 경고) / 사전조건 정정 / **절차 4 "자기점검" 삭제**(D2) |
| `penpot-design/cheatsheet.md` | **침묵 실패 3종** · 수식·참조 · set 3층 캐스케이딩 · 전체 TokenType · `penpotUtils` 검증 함수군 · `analyzeDescendants` 예제 · hex 대문자 · `addFlexLayout` 주의 추가 |
| `GUIDELINE.md` | 사실 오류 11곳 수정 + 낡음 배너 |

### Step 3 — holdout PRD ✅

3종 작성, 축이 서로 어긋나게 설계(밀도·톤·플랫폼·화면형태·**문서 서식**).
SHA-256 봉인 (`docs/prd-samples/sealed/SEAL.json`). 한계는 README에 명시 — 절차적 봉인이지 암호학적 봉인이 아니다.

### Step 1 — 하네스 구축 ✅

`start/SKILL.md` 단계표·실행순서·재시도 예산 + `.claude/agents/stage-*.md` **7개**.
전 단계 계약 5항목(입력/출력/done/허용행동/판단규칙) 충족, 단계명·산출물 경로 정합성 검증 완료.

### ★ 오염 가드가 실제로 작동했다

지침 오염 검사에서 `stage-reference.md`의 예시 문구 `"야간 관제실의"`가
**개발용 PRD-b(콜드체인 관제실)에서 새어들어간 것을 잡았다.**

규칙이 아니라 예시였지만 이것이 정확히 G2가 막으려는 패턴이다 —
예시가 답으로 굳으면 모든 결과물이 같은 레퍼런스로 수렴한다.
중립 예시로 교체하고 "예시는 답이 아니다"는 경고를 명시했다.

현재 상태: 봉인본·개발PRD 고유어 **둘 다 지침에 없음**.
