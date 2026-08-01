# HARNESS_UPDATE — 서베이 근거로 본 하네스 업데이트 제안

> 대상: `harnessthon-1-team-5` · 작성 2026-07-30
> 근거: `60-data/sources.jsonl` (20건) · `70-analysis/claim_ledger.jsonl` (11건, 실행확정 3 / unresolved 4)
> 축별 상세: `20-knowledge-base/notes/axis-{A,C,F}-*.md`
>
> **읽는 법**: 각 제안에 근거 id와 강도(★)를 붙였다. ★★★는 서베이가 "이건 지금 구조가 틀렸다"고
> 말하는 것, ★는 "이렇게 하면 낫다"는 수준이다. 근거 없는 제안은 넣지 않았다.

---

## 0. 한 장 요약

서베이가 바꾸라고 말하는 것 3가지:

1. **자기점검을 폐기하고 evaluator를 별도 sub agent로 분리한다.** 저작한 agent가 자기 저작을 점검하면
   칭찬만 한다는 것이 1차 벤더 문서로 확인됐다. (`src_005`)
2. **중간 산출물 포맷을 우리가 발명하지 말고 `DESIGN.md`(google-labs, 26.7k★, Apache-2.0)를 쓴다.**
   그러면 결정론 게이트(`orphaned-tokens`·`contrast-ratio`·`broken-ref`)와 DTCG export가 **공짜로 따라온다.**
   내가 직접 실행해서 확인했다. (clm_008·009·010, 전부 `verdict: confirmed`)
3. **PRD에서 뽑아야 하는 것은 값이 아니라 "구체적 레퍼런스"다.** 형용사("모던하고 신뢰감 있는")는
   모델을 평균으로 데려가고, 구체적 레퍼런스는 한 점을 지정한다. 이게 반하드코딩의 실제 메커니즘이다. (`src_016`)

---

## 1. ★★★ 자기점검 폐기 → evaluator 분리

### 지금 무엇이 문제인가

`.claude/skills/penpot-design/SKILL.md` 절차 4번:

> 4. **자기점검**: 위계/토큰/컴포넌트 조회로 검증

### 근거

Anthropic, *Harness Design for Long-Running Application Development* (2026-03-24, `src_005`):

> "**When asked to evaluate work they've produced, agents tend to respond by confidently praising the work**"

> "**separating the agent doing the work from the agent judging it proves to be a strong lever**"

Anthropic, *Demystifying Evals* (2026-01-09, `src_014`)가 독립적으로 같은 방향 → **clm_001 삼각검증 성립.**

### 제안

`penpot-design`의 절차 4번을 삭제하고, **`stage-evaluate` sub agent**를 새로 만든다.
저작 agent는 자기 결과를 판정하지 않고 **산출물 경로만 남기고 종료**한다.

> ⚠️ **새 단계 추가는 조장 승인 + 팀 sync 사안**이다 (`AGENTS.md` 권한 매트릭스). 이 제안의 채택 여부가
> 나머지 제안의 절반을 좌우한다.

---

## 2. ★★★ 중간 산출물 = `DESIGN.md` (우리가 발명하지 않는다)

### 무엇인가

`src_016` — `google-labs-code/design.md`. 26.7k★, Apache-2.0, alpha. CLI `@google/design.md` v0.4.0 (2026-07-27 publish).

> "A format specification for describing a visual identity to coding agents."

구조 = **YAML front matter(토큰) + Markdown body(산문)**, 섹션 정규 순서:
`Overview → Colors → Typography → Layout → Elevation & Depth → Shapes → Components → Do's and Don'ts`

### ★ 왜 이게 우리에게 결정적인가 — 실행으로 확인한 3가지

내가 직접 돌린 결과다. 증적은 `70-analysis/execution-proofs/`.

**(1) `lint`가 우리 채점 기준을 이미 구현했다** (clm_008, confirmed)

```
$ designmd lint BROKEN.md
{
  "findings": [
    {"severity":"error","path":"components.button-primary",
     "message":"Reference {colors.does-not-exist} does not resolve to any defined token.","rule":"broken-ref"},
    {"severity":"warning","path":"colors.unused-orphan",
     "message":"'unused-orphan' is defined but never referenced by any component.","rule":"orphaned-tokens"}
  ],
  "summary":{"errors":2,"warnings":1,"infos":3}
}
LINT_EXIT=1
```

**`orphaned-tokens`가 곧 채점 규칙 "토큰을 정의만 하고 미적용 시 감점"이다.** 우리가 짤 필요가 없다.
정상 예제(공식 `paws-and-paths`)는 `errors:0`, `EXIT=0` → 오탐 없음.

**(2) `contrast-ratio`가 WCAG를 실제로 계산한다** (clm_009, confirmed)

```
warning components.button-bad:
  "textColor (#808080) on backgroundColor (#777777) has contrast ratio 1.13:1,
   below WCAG AA minimum of 4.5:1."  rule=contrast-ratio
```

- **발화 조건**: 같은 component에 `backgroundColor`와 `textColor`가 **둘 다 해석될 때만**.
  → 우리 컴포넌트 단계가 이 두 키를 반드시 채워야 게이트가 작동한다.
- 정상 쌍(`#111111` on `#FFFFFF`)은 발화 안 함.
- ⚠️ **severity가 `warning`이라 exit 0이다.** 하드 게이트로 쓰려면 **우리가 warning을 실패로 취급**해야 한다.

**(3) DTCG로 나간다 → Penpot이 native로 받는다** (clm_010, confirmed)

```json
{ "$schema": "https://www.designtokens.org/schemas/2025.10/format.json",
  "color": { "$type":"color",
    "surface": { "$value": {"colorSpace":"srgb","components":[0.976,0.976,1],"hex":"#f9f9ff"} } } }
```

이 `$schema`가 내가 별도로 읽은 DTCG 2025.10 정식 스펙(`src_002`, Final Community Group Report, 2025-10-28)과 일치한다.
그리고 Penpot 공식 문서(`src_009`)는 **"Penpot Design Tokens adhere to the Design Tokens Format Module"** 이며
**플러그인 없이 JSON import** 가 된다고 한다.

### 그래서 파이프라인이 이렇게 된다

```
docs/PRD.md
   │
   ├─(+ Penpot `1-daangn`·`2-airbnb` Page 읽기)
   ▼
[1] DESIGN.md 작성            ← 산문(레퍼런스·Do/Don't) + 토큰
   ▼
[G1] designmd lint            ← ★결정론 게이트, 공짜. broken-ref/orphaned/contrast/section-order
   ▼
[2] designmd export --format dtcg → tokens.json
   ▼
[3] Penpot 저작               ← DTCG import 또는 use_figma addToken
   ▼
[G2] export_shape + use_figma 조회 → evaluator 단계
```

**중간 산출물이 표준 포맷이라는 것 자체가 B트랙 "재현성" 근거가 된다.** 우리 발명품이 아니고,
린터가 검증하고, 다른 도구로 나간다.

> ⚠️ **미검증 연결부**: DTCG JSON → Penpot import를 **실제로 해보지 못했다** (플러그인 미연결).
> Penpot의 타입 집합이 DTCG와 부분 교집합일 뿐이라(축 C-2) **무손실 라운드트립은 보장되지 않는다.**
> Penpot에만 있는 `spacing`·`sizing`·`rotation`·`textCase`, DTCG에만 있는 `duration`·`cubicBezier`·`transition`·`border`·`gradient`.
> → 연결 후 최우선 검증 항목.

---

## 3. ★★★ PRD에서 뽑을 것 — 값이 아니라 구체적 레퍼런스

### 근거 (`src_016` PHILOSOPHY.md, 원문)

> "**The quality of a generated design is determined less by the precision of its values than by
> how clearly the intent is described.**"

> "A design that references '**A 1970s graduate lecture handout in the tradition of an old and established university**'
> evokes a complete world: the one color of ink, the generous margins, the serif set at a reading size,
> and the absence of decoration. That single sentence carries more useful information than a dozen metric values."

> "'**Modern, clean, trustworthy, premium**' evokes nothing specific. A model creates something in the center of
> what those words describe, creating an output that is typically generic.
> **Adjectives describe a region. A specific reference describes a point.**"

### 그리고 부정 제약이 공짜로 온다

> "A model knows what a lecture handout is, and it knows what a lecture handout **is not**. It does not glow or
> use a gradient. You don't have to list these. **Naming the object names them**, the same way naming a dog tells
> the model that dogs don't meow."

> "An intentional list of 'don'ts' is useful. **A long rambling list is often a sign the description was too vague
> to carry them.** A strong reference and an intentional list of do's and don'ts working together is the sweet spot."

### 제안

**첫 단계의 산출물은 "토큰 값"이 아니라 "구체적 레퍼런스 1문장 + 의도적 Do/Don't 목록"이다.**

이게 우리 A트랙 "완성도·디테일(실제 서비스 화면이라 해도 믿을 만하다)"의 실제 레버다.
generic한 결과물은 형용사에서 나온다.

그리고 **이게 반하드코딩의 진짜 메커니즘이다.** 다른 PRD → 다른 레퍼런스 → 다르지만 일관된 디자인.
PRD 전용 스크립트가 아니다.

### 반대 근거도 같이 본다

`src_018` (prompt overfitting): "prompt optimization methods... resulting prompts often become longer,
**accumulate narrow sample-specific rules**, and generalize poorly beyond the training distribution"

→ 우리가 예시 PRD로 하네스를 다듬으면 **그 PRD 전용 규칙이 지침에 축적된다.** 이게 B트랙 재현성을 죽인다.
대응: **sealed holdout PRD** — 도메인이 다른 PRD 2~3개를 미리 쓰고, **그중 1개는 개발 중에 절대 열지 않는다.**
마지막에 딱 한 번 돌린다. (`src_018`의 "keeping a **sealed holdout set never inspected until release day**")

---

## 4. 단계 분할안 (plan.md Q3·Q4에 대한 답)

### 근거

- `src_006` (LangChain 벤치마크): 우리는 "여러 독립 도메인 + 병렬 실행" → **Subagents 패턴이 정답**.
  멀티도메인에서 Subagents 5호출 **~9K 토큰**, Skills 3호출 ~15K → "**Subagents processes 67% fewer tokens
  overall compared to Skills**". 우리 `AGENTS.md`의 "각 단계 = sub agent 1개"가 수치로 정당화된다.
- `src_008b` (TAG): 5단계 파이프라인. **fault isolation** — "a failure at one stage does not invalidate
  earlier work; the artifact exits the pipeline at the failing stage".
- `src_004` (GitHub): "**Constrain actions before adding more agents**" — 단계를 늘리기 전에 행동을 제약.
- `src_007` (Anthropic 3패턴): "**ask what you can stop doing**" — 단계를 늘리는 게 곧 좋은 하네스가 아니다.

### 제안 — 6단계 (5 + evaluator)

| # | 단계 | 입력 | 출력 | done의 정의 | 병렬 |
|---|---|---|---|---|---|
| 1 | `stage-reference` | `docs/PRD.md` | `artifacts/01-reference.md`<br>(구체적 레퍼런스 1문장 + Do/Don't + 화면 목록) | 레퍼런스가 형용사 나열이 아니고, Don't가 레퍼런스에서 파생됐다 | — |
| 2 | `stage-inventory` | Penpot `1-daangn`·`2-airbnb` Page | `artifacts/02-inventory.md`<br>(색·간격·타이포 값 분포, 반복요소, 네이밍 상태) | 화면 수·크기·값 분포가 수치로 적혀 있다 | **1과 병렬** |
| 3 | `stage-designmd` | 01 + 02 | `artifacts/DESIGN.md` | **`designmd lint` errors=0 且 warnings=0** | — |
| 4 | `stage-tokens` | `DESIGN.md` | Penpot 토큰 set 3층(`core`→`semantic`→`brand`) | `tokenOverview()`에 3 set 존재 + 전부 `active` | — |
| 5 | `stage-compose` | `DESIGN.md` + 토큰 | Penpot 컴포넌트 + 화면 | 컴포넌트가 인스턴스로 재사용됐다 | — |
| 6 | `stage-evaluate` | 4·5의 Penpot 상태 + `DESIGN.md` | `artifacts/06-verdict.md` | A트랙 4축 전부 threshold 통과 | — |

**1과 2가 병렬**인 이유: 입력이 서로 다르다(PRD vs Penpot). 의존관계가 없다.
`AGENTS.md` 단계 설계 원칙 3번("의존관계 없는 단계는 병렬")이 여기서 실제로 쓰인다.

### 왜 6개인가 (B트랙 "분할 타당성"에 답할 문장)

각 단계에 **"없으면 무엇이 실패하는가"** 를 붙일 수 있어야 정당하다:

| 단계 | 없으면 |
|---|---|
| 1 | 형용사로 저작해서 generic한 결과가 나온다 (`src_016`) |
| 2 | 기존 파일을 읽으라는 과제 요구를 못 지킨다 |
| 3 | 결정론 게이트를 못 걸고, 산출물이 표준 포맷이 아니게 된다 (clm_008) |
| 4 | 토큰 없이 매직넘버로 저작해 A트랙 일관성이 무너진다 |
| 5 | 컴포넌트 재사용이 없어 A트랙 "완성도"가 떨어진다 |
| 6 | 자기점검이 칭찬만 해서 결함이 그대로 제출된다 (`src_005`) |

**7번째 단계를 추가하려면 이 표에 한 줄을 쓸 수 있어야 한다.** 못 쓰면 넣지 않는다.

---

## 5. 단계 간 계약 (B트랙 "계약 명료성")

### 근거 — `src_004` (GitHub, 2026-02-24)

계약은 **2층**이다:

| 층 | 고정하는 것 | 원문 |
|---|---|---|
| **typed schema** | 데이터 **구조** | "Field names change, data types don't match" |
| **action schema** | 허용된 **행동** | "LLMs don't follow implied intent, only explicit instructions" |

action schema는 discriminated union으로 쓴다 (원문 예시 형태):
```js
z.discriminatedUnion("type", [
  { type: "ok",              artifact: string },
  { type: "needs-more-info", missing: string[] },
  { type: "failed",          rule: string, why: string },
])
```

- **"Validation happens before execution"** — 실행 전 검증
- **"Treat schema violations like contract failures: retry, repair, or escalate"** — 3분기

### 제안

각 `stage-*.md`에 4항목을 못박는다:

```markdown
## 계약
- 입력: <정확한 파일 경로>
- 출력: <정확한 파일 경로 + 스키마>
- done의 정의: <기계로 판정 가능한 조건>      ← src_005 sprint contract
- 허용 행동: ok | needs-more-info | failed    ← src_004 action schema
- 판단 규칙: <하드코딩 없이 무엇으로 결정하는가>  ← B트랙 재현성
```

`src_005`: "the generator and evaluator **negotiated a sprint contract: agreeing on what 'done' looked like
for that chunk of work before any code was written**"

---

## 6. ★★★ evaluator 단계 설계

### 근거 3건이 수렴한다

- `src_014` (Anthropic): "create clear, structured rubrics to grade each dimension of a task, and then
  **grade each dimension with an isolated LLM-as-judge rather than using one to grade all dimensions**"
- `src_008b` (TAG Alg2): "yielding **N independently optimized judge prompts for N evaluation dimensions**"
  → **독립 수렴 → clm_002 삼각검증 성립**
- `src_005`: 4기준 각각에 **hard threshold**, "if any one fell below it, the sprint failed and the generator
  got **detailed feedback** on what went wrong"

### A트랙 채점축 4개 = judge 4개

| A트랙 축 | 결정론 검사 (우선) | judge (남는 것만) |
|---|---|---|
| **레이아웃·정렬** | `analyzeDescendants`로 `parentX % 4 === 0` 비율 / `isContainedIn` 위반 수 / flex 미적용 board 수 / 절대좌표 자식 비율 | **없음 — 전부 계산 가능** |
| **타이포·컬러** | `designmd lint` contrast-ratio / 폰트 크기가 타입스케일 집합에 속하는가 / `shape.tokens` 적용률 | "위계가 명확한가" 1문항 |
| **완성도·디테일** | 기본명(`Board 1`) 잔존 수 / 빈 board / 위계 깊이 분포 / `orphaned-tokens` | "실제 서비스로 보이는가" 1문항 |
| **PRD 충족도** | 01-reference의 화면 체크리스트 문자열 대조 | "의미가 대응하는가" 1문항 |

`src_014`: "We recommend choosing **deterministic graders where possible**, LLM graders where necessary"

### ★ Penpot에 결정론 검사 재료가 이미 있다 — cheatsheet에 없는 것

`src_010` (연결된 API의 `high_level_overview`). 우리 `cheatsheet.md`에 **하나도 언급이 없다.**

```js
// overview 원문 예제 — 4배수 정렬 검사 + 자동 교정. 곧 8pt 그리드 채점기다.
const fixes = penpotUtils.analyzeDescendants(board, (root, shape) => {
  const xMod = shape.parentX % 4;
  if (xMod !== 0) return () => penpotUtils.setParentXY(shape, Math.round(shape.parentX/4)*4, shape.parentY);
});
fixes.forEach(f => f.result());
```

> "Powerful pattern: **evaluator can return corrector functions or diagnostic data**"

| 도구 | 용도 |
|---|---|
| `penpotUtils.analyzeDescendants(root, evaluator)` | 정렬·크기·네이밍 위반 수집 **+ 교정 함수 반환** |
| `penpotUtils.isContainedIn(shape, container)` | 담기 위반 |
| `penpotUtils.shapeStructure(root, 3)` | 위계·네이밍 검사 |
| `penpotUtils.tokenOverview()` | set별 토큰 목록 |
| `shape.tokens` → `{prop: "token.name"}` | **토큰 적용 증명** (미적용 감점 대응) |
| `export_shape` | **evaluator가 이미지로 실제로 본다** |
| `penpot.generateStyle(shapes, {type:'css'})` | CSS로 뽑아 매직넘버 탐지 |

`export_shape`는 `src_005`의 "evaluator used the **Playwright MCP to click through the running application**"의
우리쪽 대응물이다.

### 설계 규칙 8개

1. 차원마다 **별도 judge**. 하나가 4개를 채점하지 않는다. (`src_014` + `src_008b`)
2. **결정론 우선.** 위 표 왼쪽 칸이 채워지면 LLM에게 묻지 않는다. (`src_014`)
3. 각 축에 **hard threshold**. 하나라도 미달 → 실패 + **상세 피드백**. (`src_005`)
4. **pass/fail만 반환 금지.** "왜 실패했는지"를 돌려준다 — "the LLM receives **indicative error messages
   that expose why the output failed**" (`src_008b`)
5. **재시도 루프 필수, 예산은 유한.** 소진 시 정직하게 실패 보고. (`src_008b`)
6. judge는 **false positive를 우선 줄인다.** 애매하면 `Unknown`. 나쁜 걸 통과시키는 게 좋은 걸
   떨어뜨리는 것보다 치명적이다 — "we have **automated the bottleneck away while also removing the
   quality gate**" (`src_008b`)
7. **구현 경로를 검사하지 않는다.** 결과 속성만. "agents regularly find **valid approaches that eval
   designers didn't anticipate**" (`src_014`)
8. 기준의 시험지: **"디자이너 2명이 독립적으로 같은 판정을 내릴 문항인가?"** (`src_014`)
   → "예쁜가?" 실패 / "모든 자식의 parentX가 4의 배수인가?" 통과

### ★ 재시도 루프가 가장 중요하다 (수치)

`src_008b` ablation (MITRE 단계, 50건, n≈12×4 fold):

| 제거한 것 | 하락 |
|---|---|
| **Self-Correction** (single-shot) | **−22 pp** ← "the most impactful component" |
| Quality Gates | −16 pp |
| LLM Judges | −12 pp |
| Domain Tools | −4 pp |

**좋은 툴을 만드는 것(−4pp)보다 실패 이유를 알려주고 다시 시키는 것(−22pp)이 5배 이상 중요하다.**
비용: 전체 파이프라인 **~133K 토큰/아티팩트**, ablated 대비 ~2.5배.

> ⚠️ 단일 출처 + 소표본 → **clm_004는 unresolved.** 방향성만 인용하고 수치를 법칙으로 쓰지 않는다.

### 검증 투자는 1단계에 몰아준다

`src_008b` Table 1 — TAG의 단계별 테스트 배치가 **균등하지 않다**:

| 단계 | 결정론 테스트 | LLM judge | 통과율 |
|---|---|---|---|
| 1단계 (KQL) | **12–14** | 2–3 | **47.5%** (52.5% 폐기, 주 병목) |
| 2단계 (MITRE) | 2 | 3 | 87.3% |
| 3단계 (Entity) | 1 | 3 | 90.2% |

> "This attrition pattern - **steep early, shallow late**... earlier stages, which address harder generation
> tasks, **absorb the majority of attrition**"

종단간 수율 **35.6%**. 우리도 6단계면 손실이 누적된다 → **1단계(`stage-reference`)에 검증을 몰아준다.**

> ⚠️ 보안 도메인 1건 사례 → **clm_003 unresolved.** 일반 법칙으로 단정하지 않는다.

---

## 7. 토큰 단계 구체안 (축 C)

| # | 제안 | 근거 |
|---|---|---|
| 1 | set을 **3층**(`core`→`semantic`→`brand`)으로. 순서가 우선순위 | `src_009` "마지막 set이 이전 값을 덮음" (CSS 캐스케이딩) |
| 2 | 원시 스케일을 **수식 토큰**으로. `{space.base} * 2` — 숫자 목록 하드코딩 금지 | `src_009` 수식 지원 |
| 3 | `addSet` 직후 **`if(!set.active) set.toggleActive()`** 무조건 | `src_010` "Only active sets affect shapes" |
| 4 | 토큰 적용 후 **100ms 대기** 후 검증 | `src_010` "Application is asynchronous" |
| 5 | 반복요소는 `Group`이 아니라 **`Board`** | `src_009` "Tokens can be applied to... **not to groups**" |
| 6 | 색 램프는 **OKLCH에서 L만 밟아** 생성 → **hex로 저장** | `src_012` C·H 고정 L 변화 = 지각 균일 |
| 7 | 타입 스케일 비율을 PRD 성격으로 **선택** (기본 1.25) | `src_013` 1.25 "safer for complex UI" / 1.333 "most widely used for web" |
| 8 | 간격은 **8pt 선형 + 4pt 하프스텝** | `src_013` "12-column + 8pt is now the de facto standard" |
| 9 | hex는 **대문자** | `src_010` "Use hex strings with **caps only**" — 우리 cheatsheet는 `#4f46e5` 소문자 |

### ★ 왜 수식 토큰이 재현성의 핵심인가

```js
set.addToken({type:'number',  name:'space.base', value:'8'});
set.addToken({type:'spacing', name:'space.md',   value:'{space.base} * 2'});
set.addToken({type:'spacing', name:'space.lg',   value:'{space.base} * 3'});
```

`space.base`만 바꾸면 전체 리듬이 재계산된다. PRD가 "여백이 넉넉한 느낌"이라 하면 8→10.
**특정 PRD 전용 하드코딩이 아니라 규칙**이 된다.

**함정**: 연산자 앞뒤 **공백 필수** (`8*8` ❌ / `8 * 8` ✓), 참조는 **대소문자 구분**.

> ⚠️ **clm_006 unresolved** — 공식 help 문서 근거이나 **실행 미검증**(플러그인 미연결).
> 이 주장이 재현성 설계의 핵심이므로 **연결 후 최우선 검증**.

---

## 8. 레포에 지금 있는 버그·불일치 (서베이와 별개로 즉시 수정 대상)

| # | 위치 | 문제 | 확인 방법 | 강도 |
|---|---|---|---|---|
| 1 | `AGENTS.md:83`, `README.md:17,37` | Penpot 주소 `sumin-macmini.tail45121d.ts.net`이 **연결 실패**. 정상은 `penpot.tail45121d.ts.net` | `curl` 실측 (200 vs 실패) | ★★★ |
| 2 | `penpot-design/SKILL.md:63` | `기존파일` Page를 하드코딩. 실제는 **`1-daangn`·`2-airbnb` 2개** | Notion 원문 | ★★★ |
| 3 | `AGENTS.md` Page 표 | 채점 대상이 `작업` 파일이라 기술. Notion은 **`심사용` 파일**의 `최종제출` | Notion 원문 | ★★ |
| 4 | `cheatsheet.md:58` | `b.addFlexLayout()`을 자식 있는 board에 직접 호출 → **자식 순서가 임의로 재배열됨** | `src_010`: "use `penpotUtils.addFlexLayout(container, dir)` instead! This **preserves the existing visual order**" | ★★ |
| 5 | `cheatsheet.md` 전반 | hex를 **소문자**로 씀 (`#4f46e5`) | `src_010` "caps only" | ★ |
| 6 | `cheatsheet.md` | `set.active` / 비동기 적용 / group 제약 **전부 누락** → 침묵 실패 3종 | `src_010`+`src_009` | ★★★ |
| 7 | `cheatsheet.md` | `penpotUtils` 검증 함수군 **전부 누락** (`analyzeDescendants` 등) | `src_010` | ★★ |
| 8 | `cheatsheet.md` | Variants 시스템 **언급 없음** | `src_010` | ★ |
| 9 | `penpot-design/SKILL.md:11` | `claude mcp add` 수동 명령 — `.mcp.json`이 있어 불필요 | 실측 (등록 완료됨) | ★ |

1·2·3·6은 **그대로 두면 하네스가 실패한다.** 1·2·3은 공용 파일이라 조장 승인 사안.

---

## 9. 우리 규칙과 문헌이 어긋나는 지점 (정직하게)

`src_006` (LangChain): "**Start with a single agent and good prompt engineering. Add tools before adding agents.
Graduate to multi-agent patterns only when you hit clear limits**"

`src_007` (Anthropic): "**strip your agent harness down**", "**ask what you can stop doing**"

우리 `AGENTS.md`는 sub agent를 **강제**한다. 문헌은 마지막 수단으로 쓰라고 한다.

**모순은 아니다.** 우리는 "효율 최적"이 아니라 **"B트랙 채점 최적"** 을 푸는 중이고, 채점표가 단계 분할을
배점에 넣었다. 다만 이걸 알고 하는 것과 모르고 하는 것은 다르다.

→ **제안서에는 단계 수를 효율이 아니라 "계약 명료성"과 §4의 "없으면 무엇이 실패하는가" 표로 정당화한다.**
그리고 `src_006`의 토큰 수치(Subagents ~9K vs Skills ~15K)로 **우리 선택이 효율에서도 불리하지 않음**을 보인다.

---

## 10. 실행 순서 제안

| 순서 | 할 일 | 막는 것 |
|---|---|---|
| 0 | **Penpot Step 2·3 완료** (브라우저 로그인 + 플러그인 Connect) | unresolved 4건 중 **2건(clm_005·006)이 여기 걸려 있다.** `use_figma`가 30초 타임아웃 중 |
| 1 | §8의 1·2·3 수정 (조장 승인) | 주소가 죽어 있으면 아무것도 못 한다 |
| 2 | `cheatsheet.md`에 침묵 실패 3종 + `penpotUtils` 검증 함수군 추가 (📦 스타터라 자유) | 저작이 조용히 실패한다 |
| 3 | **sealed holdout PRD** 2~3개 작성. 그중 1개는 개발 중 열지 않는다 | 과적합 여부를 나중에 알 수 없다 |
| 4 | `start/SKILL.md`에 §4 단계 표 기입 (조장) | 하네스가 안 돈다 |
| 5 | `stage-*.md` 6개를 §5 계약 4항목으로 작성 | — |
| 6 | 예시 PRD로 엔드투엔드 1회 → `docs/artifacts/` 채워지는지 확인 | — |
| 7 | sealed holdout PRD로 **딱 한 번** 실행 → 재현성 실측 | B트랙 재현성의 유일한 증거 |

---

## 11. 이 제안서가 모르는 것

| # | 미확정 | 왜 |
|---|---|---|
| 1 | **Penpot 토큰 API가 실제로 동작하는지** (clm_005) | 플러그인 미연결. issue#7916이 2026-02-09 CLOSED이고 API 문서도 있으나 **실행 증적 0** |
| 2 | **토큰 수식이 실제로 계산되는지** (clm_006) | 동일. 재현성 설계의 핵심인데 미검증 |
| 3 | **DTCG JSON → Penpot import가 무손실인지** | 타입 집합이 부분 교집합. 라운드트립 미실험 |
| 4 | Penpot color 토큰이 `oklch()`를 받는지 | help는 Hex/RGB/HSL만 명시 → 아마 안 될 것. 계산은 OKLCH, 저장은 hex가 안전 |
| 5 | `analyzeDescendants`가 큰 화면에서 30초 안에 끝나는지 | `use_figma`가 30초 제한임을 실측 확인. evaluator가 타임아웃하면 무용 |
| 6 | TAG의 attrition·ablation 수치가 우리 도메인에 전이되는지 | 보안 도메인 1건. clm_003·004 unresolved |
| 7 | WCAG relative luminance 공식 원문 | fetch에서 절단됨. `design.md`가 계산해주므로 급하지 않음 |
| 8 | **A트랙은 사람이 눈으로 채점한다** | 문헌 근거가 좋아도 최종 화면이 못생기면 TOP3에 못 든다. 서베이가 제안서에서 멈추면 안 되고 **실제 저작까지** 가야 한다 |

---

# 배치 2 추가 (2026-07-31) — 진단 틀과 종결된 미결

상세: [`notes/axis-A2-harness-framework.md`](./20-knowledge-base/notes/axis-A2-harness-framework.md)

## 12. ★★★ 우리 하네스의 진단 — Böckeler 2×2

`src_022` — Birgitta Böckeler (Thoughtworks), martinfowler.com, 2026-04-02. **"Agent = Model + Harness"**

하네스 제어를 2축으로 나눈다:
- **방향**: **Guides**(feedforward, 행동 **전** 개입) / **Sensors**(feedback, 행동 **후** 관찰)
- **실행**: **Computational**(결정론 — 빠르고 신뢰도 높음) / **Inferential**(의미론 — 느리고 비쌈)

### 지금 우리 레포를 넣어보면

| | **Computational** | **Inferential** |
|---|---|---|
| **Guides** (사전) | `AGENTS.md` 규칙, `.mcp.json`, cheatsheet 스니펫 | `penpot-design/SKILL.md` 절차, STEP 0 게이트 |
| **Sensors** (사후) | **⚠️ 없음** | **⚠️ "자기점검" 1줄 — 게다가 자기가 자기를 본다** |

**진단: 전형적인 `feedforward-only` 안티패턴.** Böckeler가 명시한 4종 중 우리가 2개에 해당한다.

| 안티패턴 | 정의 | 우리 |
|---|---|---|
| **Feedforward-only** | 규칙을 인코딩하고 **실제 효과를 검증하지 않음** | ★ **해당** |
| **불충분한 센서** | 센서가 안 울릴 때 **품질이 좋은 건지 탐지가 없는 건지 구분 불가** | ★ **해당** |
| **하네스 불일치** | 지침과 피드백 신호가 상충 → **에이전트가 합리적 판단 불가** | 위험 — §8의 주소·Page명 불일치가 정확히 이것 |
| Feedback-only | 에이전트가 같은 실수 반복 | 해당 없음 |

→ **§1(evaluator 분리)과 §6(evaluator 설계)은 이 표의 빈 칸(Sensors 행)을 채우는 일이다.**
채울 때 **Computational 칸을 먼저** 채운다 — 빠르고 신뢰도가 높다.

### "Keep quality left" — 게이트 배치 순서

> "What is reasonably fast and should be run **even before integration**?"

| 시점 | 우리 대응 |
|---|---|
| 저작 **전** (싸다) | **`designmd lint`** — broken-ref·orphaned-tokens·contrast-ratio (clm_008·009 실행확정) |
| 저작 **후** (비싸다) | `export_shape` + 4축 judge |
| 지속 | 매직넘버 드리프트(`generateStyle` CSS 값 분포) |

### 난이도 인식

Böckeler의 규제 대상 3분류를 우리 A트랙 4축에 대응시키면:

| A트랙 축 | 난이도 | 함의 |
|---|---|---|
| 레이아웃·정렬 | Maintainability급 (**쉬움**) | 전부 Computational로 가능 |
| 타이포·컬러 | Maintainability급 | 대부분 Computational |
| **완성도·디테일** | **Behaviour급 (가장 어려움)** | judge 필요 → 캘리브레이션 필수 |
| **PRD 충족도** | **Behaviour급** | 동일 |

저자의 정직한 한계 인정도 같이 기록한다:
> "Computational sensors는 구조적 문제는 잘 잡지만 **더 높은 영향의 문제들**(문제 진단 오류, 과도한 엔지니어링,
> 이해 부족)은 못 잡음"
> "Harnesses are an attempt to externalise... but **it can only go so far**."

→ evaluator가 정렬·명도비를 다 통과시켜도 **"이 화면이 이 PRD에 맞는 화면인가"** 는 못 잡을 수 있다.

---

## 13. ★★ 각 단계는 자기 입력만 읽는다 (scoped context)

`src_021` — TDP, arXiv 2601.07577, 2026-01-12, training-free

> "both paradigms suffer from **entangled contexts, where the agent must reason over a monolithic history
> spanning multiple sub-tasks**. This entanglement increases cognitive load and **lets local errors propagate
> across otherwise independent decisions**"

TDP 구조 = **Supervisor**(하위목표 DAG 분해) + **Planner/Executor**(scoped context 안에서만 추론·재계획).
> "This isolation **prevents error propagation and corrects deviations locally without disrupting the workflow**"

우리 구조가 이미 이 형태다 — `/start`=Supervisor, `stage-*`=Planner+Executor.
**하지만 "자기 입력만 읽는다"가 계약에 명시돼 있지 않다.**

### §5 계약에 한 줄 추가

```markdown
## 계약
- 입력: <정확한 파일 경로>          ← ★이 목록 밖의 것을 읽지 않는다
- 출력: <정확한 파일 경로 + 스키마>
- done의 정의: <기계 판정 가능 조건>
- 허용 행동: ok | needs-more-info | failed
- 판단 규칙: <하드코딩 없이 무엇으로 결정하는가>
```

`src_008b`(TAG)의 fault isolation이 독립적으로 같은 구조를 말한다 → **메커니즘은 삼각검증**(clm_013).
⚠️ TDP의 **82% 토큰 절감 수치는 도메인이 달라 unresolved.** 방향성만 인용한다.

---

## 14. 구조가 모델보다 중요하다 (우리에게 유리한 소식)

`src_020` — AdaptOrch, arXiv 2602.16873, 2026-02-18

> "**orchestration topology**... **now dominates system-level performance over individual model capability**"

- Topology Routing Algorithm: 작업 분해 **DAG → 토폴로지 매핑**, **O(|V|+|E|)**
- "topology-aware orchestration achieves **12–23% improvement** over static single-topology baselines,
  **even when using identical underlying models**"

우리 규칙 "의존관계 없으면 병렬"이 **DAG→topology 매핑의 단순한 형태**다.
§4의 `stage-reference`(입력=PRD)와 `stage-inventory`(입력=Penpot)는 DAG에서 간선이 없으므로 **parallel**.

> ⚠️ **clm_012 unresolved** — 단독 저자·소속 미기재·D등급·단일 출처. **12–23%를 단정 인용하지 않는다.**

---

## 15. 종결된 미결 2건 (§11의 7번 해소)

### (1) WCAG relative luminance — 확보 (A등급, `src_023`)

```
L = 0.2126*R + 0.7152*G + 0.0722*B
  각 채널: cSRGB = c8bit/255
           c = cSRGB/12.92                    (cSRGB ≤ 0.04045)
           c = ((cSRGB+0.055)/1.055)^2.4      (그 외)
contrast ratio = (L1+0.05)/(L2+0.05)   L1=밝은 쪽, L2=어두운 쪽, 1:1~21:1
```

4.5:1의 근거: "moderately low visual acuity, congenital or acquired color deficiencies, or the loss of
contrast sensitivity that typically accompanies **aging**" — 20/40 시력 → `3 * 1.5 = 4.5`.

### (2) APCA를 쓸 것인가 — **아니오** (`src_024`)

> "APCA contrast was **removed from WCAG3 working drafts in 2023**"
> "the current WCAG3 spec explicitly states the contrast algorithm is **yet to be determined**"
> "WCAG3 is unlikely to be finalized **before 2030**"
> APCA를 WCAG3 표준으로 홍보하는 도구들을 따르면 **"creates legal risk"**

**결정: WCAG 2.x의 4.5:1 / 3:1.** `design.md` linter 기본값과 일치(clm_009 실행확정).

WCAG2의 알려진 결함도 기록: 같은 수치면 모든 색 조합을 동등 취급 / 폰트 굵기·크기 미반영 /
**전경·배경 대칭 취급**(뒤집어도 값이 같다).

동기: **WebAIM Million 2026 — 상위 100만 홈페이지의 83.9%가 WCAG2 명도비 실패**(전년 79.1%), 페이지당 평균 34건.

---

## 16. ★ Airbnb DESIGN.md가 실존한다 — `stage-inventory`의 외부 대조군

`src_026` — voltagent/awesome-design-md, **105.5k★**, 73개 실브랜드 DESIGN.md.

목록에 **`getdesign.md/airbnb/design-md`** 가 있다. 우리 읽기전용 Page는 **`2-airbnb`** 다.

→ Penpot `2-airbnb`에서 추출한 색·타이포·간격 분포를 이 DESIGN.md와 대조하면
**정규화 단계가 제대로 읽었는지 외부 기준으로 검증**된다. B트랙 재현성에 쓸 수 있는 드문 증거다.

> ⚠️ **clm_017 unresolved** — 목록에 있다는 것만 확인. 실제 내용도, Penpot Page와 동일 디자인인지도 미검증.

---

## 17. §7 토큰 제안 보강

| 추가 | 근거 |
|---|---|
| OKLCH 근거를 1차 출처로 승격. CIELAB은 "predict[s] hue poorly, **particularly blue hues**", HSV는 같은 채도에서 "yellow, magenta and cyan appear **much lighter** than red and blue" | `src_025` Ottosson 원본 (2020-12-23), CAM16 기준 3개 데이터셋 최적화, RMS 오차 0.20(명도)/0.81(채도) |
| 토큰 → CSS 체인이 실재함: **Style Dictionary v4부터 DTCG first-class 지원** | `src_027` |
| 단, Style Dictionary는 **타입 값을 자동 변환하지 않는다** (`"$type":"size"` → `"dimension"` 안 됨) → Penpot 고유 타입은 수동 매핑 필요 | `src_027` |

---

## 18. 배치 2 이후의 ledger 상태

| 구분 | 수 |
|---|---|
| 전체 주장 | **17** |
| **실행 확정** (execution_proof verdict=confirmed) | **3** — clm_008·009·010 (전부 `design.md` CLI) |
| 다중 출처 삼각검증 | clm_001·002·013(메커니즘)·014·015 |
| **unresolved** | **7** — clm_003·004·005·006·012·013(수치)·017 |

**unresolved 7건 중 3건(clm_005·006 + DTCG→Penpot import)은 Penpot 플러그인 연결만 되면 즉시 해소된다.**
