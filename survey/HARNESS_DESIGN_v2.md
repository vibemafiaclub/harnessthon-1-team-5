# HARNESS DESIGN v2 — IDEA.md를 서베이 근거로 발전시킨 설계

> 입력: [`IDEA.md`](../IDEA.md) 3건 + [`HARNESS_UPDATE.md`](./HARNESS_UPDATE.md) 서베이 근거 + grill 확정 2건
> 작성 2026-08-01
>
> **결론부터**: IDEA.md의 세 아이디어는 전부 문헌 근거가 있고, 그중 **3번은 이 서베이가
> "아직 아무도 구현 안 한 프론티어"로 표시했던 바로 그 루프**다. 셋을 합치면 하네스가
> `runtime-enforced` 단계에서 **`meta-harness`** 단계로 올라간다 — B트랙에서 가장 강한 이야기다.

---

## 0. 확정된 것 (grill 세션)

| # | 결정 | 귀결 |
|---|---|---|
| 확정1 | DESIGN.md를 **토큰 + `components:` 바인딩**까지 채택. 산출물 전체를 종속시키진 않음 | `designmd lint` 3게이트(broken-ref·orphaned-tokens·contrast-ratio)가 **살아있는 게이트**가 됨. 측정 근거: `components:` 없으면 findings 0건으로 게이트가 무동작 |
| 확정2 | **stage-evaluate를 별도 단계로 신설** | 자기점검 폐기. Böckeler 2×2의 비어 있던 Sensors 행을 채움 |

---

## 1. IDEA 1 — 레퍼런스에서 **원칙**을 추출하는 단계

> IDEA.md 원문: *"참고할 요소 / 적용할 화면 / 추출한 디자인 원칙 / 그대로 모방하지 않을 부분까지 중간 산출물로"*

### 서베이가 이걸 지지한다 — 그것도 강하게

내 원안(`HARNESS_UPDATE §3`)은 "PRD에서 **구체적 레퍼런스 1문장**을 뽑는다"였다.
IDEA 1은 여기서 **한 칸 더 나간다**: 레퍼런스를 뽑는 데서 끝내지 않고 **원칙으로 분해**한다.

DESIGN.md PHILOSOPHY(`src_016`)가 정확히 같은 말을 한다:

> "**Tokens give agents exact values. Prose tells them why those values exist and how to apply them.**"

> "**Adjectives describe a region. A specific reference describes a point.**"

그리고 **"그대로 모방하지 않을 부분"** — 이게 PHILOSOPHY의 핵심 장치다:

> "A model knows what a lecture handout is, and it knows what a lecture handout **is not**...
> **Naming the object names them**, the same way naming a dog tells the model that dogs don't meow."

> "An intentional list of 'don'ts' is useful. **A long rambling list is often a sign the description
> was too vague to carry them.** A strong reference and an intentional list of do's and don'ts working
> together is the sweet spot."

### ★ 여기서 나온 발견 — Don't 목록이 레퍼런스 품질의 계측기다

PHILOSOPHY의 저 문장을 뒤집으면 **검사 가능한 규칙**이 된다:

> Don't 목록이 길고 산만하면 → 레퍼런스가 너무 모호했다는 신호.

즉 **`stage-reference`의 산출물을 자기 자신이 채점할 수 있다.** 이건 결정론에 가깝다:

| 검사 | 판정 |
|---|---|
| Don't 항목 수가 12개를 넘는가 | 레퍼런스가 모호하다는 신호 → 되돌아가 레퍼런스를 좁혀라 |
| Don't 항목이 레퍼런스에서 **파생**되는가, 아니면 일반론인가 | "그라데이션 금지"가 레퍼런스에서 나오면 OK / 아무 데나 붙는 말이면 NG |
| 레퍼런스에 형용사만 있는가 | "모던하고 신뢰감 있는" → 실패. 시대·매체·장소·대상이 있어야 함 |

### 산출물 스키마 — `artifacts/01-reference.md`

```markdown
---
reference: "<구체적 레퍼런스 1문장 — 시대·매체·장소·대상이 들어가야 함>"
derived_from: ["PRD §2 대상 사용자", "PRD §4 톤", "2-airbnb Page 관찰"]
---

## 레퍼런스 원칙표

| # | 참고할 요소 | 어디서 왔나 | 추출한 원칙 | 적용할 화면 | **모방하지 않을 부분** |
|---|---|---|---|---|---|
| 1 | 카드 그림자 없이 경계선만 | 2-airbnb 리스트 | 깊이는 그림자가 아니라 톤 레이어로 | 목록·검색결과 | Airbnb의 둥근 모서리 반경(우리 레퍼런스엔 과함) |
| 2 | ... | | | | |

## Do's and Don'ts
- **Don't** ...   ← 각 항목은 위 표의 "모방하지 않을 부분"이나 레퍼런스에서 파생돼야 한다
- **Do** ...
```

**4개 열 중 마지막이 핵심이다.** "무엇을 가져올까"만 적으면 레퍼런스를 통째로 베끼게 되고,
"무엇을 안 가져올까"를 적어야 우리 것이 된다.

### 왜 이게 B트랙 재현성 점수인가

`src_018`(prompt overfitting)이 경고하는 것: *"prompts often become longer, **accumulate narrow
sample-specific rules**, and generalize poorly"*.

원칙표는 **PRD에 종속되지 않는다.** 다른 PRD가 들어오면 다른 레퍼런스 → 다른 원칙표가 나온다.
하드코딩된 값 목록이 아니라 **도출 절차**가 하네스에 들어 있다.

---

## 2. IDEA 2 — 대표 화면 1개 시안 → 승인 후 확장

> IDEA.md 원문: *"전체 화면을 한 번에 만들기 전에 대표 화면 하나의 시안(목업)을 먼저 제작하고
> 방향을 확인... 승인된 이후 나머지 화면으로 확장하면 잘못된 방향으로 빠르게 제작되는 문제를 줄일 수 있을 것"*

### 서베이가 이걸 수치로 지지한다

**(1) TAG의 퍼널 — 앞단이 급하고 뒷단이 완만하다** (`src_008b`, 931건 실측)

| 단계 | 통과율 |
|---|---|
| 1단계 (KQL) | **47.5%** — 52.5% 폐기, 주 병목 |
| 2단계 | 87.3% |
| 3단계 | 90.2% |
| 종단간 | **35.6%** |

> "This attrition pattern - **steep early, shallow late** - is a direct consequence of the fault-isolation
> property... **earlier stages, which address harder generation tasks, absorb the majority of attrition**"

→ **방향이 틀렸다면 그것은 앞단에서 결판난다.** 화면 8장을 다 그린 뒤 알면 8배를 버린다.

**(2) Anthropic의 sprint 구조** (`src_005`)

> "instructing the generator to work in **sprints, picking up one feature at a time** from the spec"

> "the generator and evaluator **negotiated a sprint contract: agreeing on what 'done' looked like
> for that chunk of work before any code was written**"

**(3) TAG의 실패 모드가 정확히 이 문제다**

> "a **fundamental mismatch between the hypothesis and the data**, where **incremental refinement
> cannot bridge the gap**. This is the **most common termination mode** for failed runs."

→ 방향이 틀리면 점진 수정으로 못 메운다. **일찍 알아야 한다.**

### 설계 — 새 단계가 아니라 `compose`의 2모드 + `evaluate` 재사용

단계를 늘리지 않는다 (`src_004` *"Constrain actions before adding more agents"*,
`src_007` *"ask what you can stop doing"*).

```
stage-compose(mode=pilot)   →  대표 화면 1장만
        ▼
stage-evaluate              →  A트랙 4축 채점 (같은 agent 재사용)
        ▼
   ┌── PASS ──▶ stage-compose(mode=full) → 나머지 화면
   └── FAIL ──▶ stage-attribute (IDEA 3)
```

### 대표 화면을 무엇으로 고르는가 — 이게 진짜 설계 결정이다

아무 화면이나 고르면 검증력이 없다. 선정 규칙:

| 기준 | 이유 |
|---|---|
| **컴포넌트 종류가 가장 많은 화면** | 토큰·컴포넌트 기준을 한 번에 검증 |
| **정보 위계가 3단 이상인 화면** | "제목/본문 위계"(A트랙)를 실제로 시험 |
| **PRD가 가장 많이 언급한 화면** | PRD 충족도의 대표성 |
| 빈 상태·에러 상태가 있는 화면이면 가점 | 완성도·디테일 |

→ `stage-reference`의 원칙표 "적용할 화면" 열에서 **가장 많이 등장한 화면**을 자동 선정할 수 있다.
IDEA 1과 IDEA 2가 여기서 맞물린다.

### 승인은 사람인가 기계인가

**둘 다.** `stage-evaluate`가 4축 hard threshold로 기계 판정하고,
**시안은 사람도 한 번 본다** — `export_shape`로 이미지를 뽑아 보여준다.

근거: A트랙은 결국 **사람이 눈으로 채점**한다. 그리고 Böckeler(`src_022`)가 인정한 한계 —
*"Computational sensors는 구조적 문제는 잘 잡지만 더 높은 영향의 문제들은 못 잡음"*.
기계가 통과시켜도 사람이 "이건 아닌데" 할 수 있고, 그 시점이 **화면 1장일 때**여야 싸다.

---

## 3. ★★★ IDEA 3 — 원인 단계로 거슬러 올라가 **그 단계의 지침을 고친다**

> IDEA.md 원문: *"결과물만 보고 바로 고치는 게 아니라, 왜 이런 결과가 나왔는지 앞 단계까지 거슬러 올라가...
> 문제가 시작된 단계를 찾아 **그 단계의 지침부터 고친 뒤 다시 실행**...
> 이번 결과물 하나만 수정하는 것이 아니라, **다음 실행에서도 같은 문제가 반복되지 않도록
> 디자인을 만드는 과정 자체를 개선**"*

### 이게 왜 특별한가 — 서베이가 여기를 "빈 칸"으로 표시했다

세 군데에서 독립적으로 같은 공백이 확인된다:

**(1) Böckeler의 안티패턴 — 우리가 지금 여기 있다** (`src_022`)

> **Feedforward-only**: 규칙을 인코딩하고 **실제 효과를 검증하지 않음**

우리 `cheatsheet.md`에는 규칙이 가득한데, 그 규칙이 실제로 효과가 있었는지 **되먹임하는 경로가 없다.**
IDEA 3이 정확히 그 경로다: 센서(evaluate) → 가이드(지침) 로 되돌아가는 화살표.

**(2) TAG가 future work로 남긴 것** (`src_008b`)

> "These failure modes suggest targeted improvements: adaptive retry strategies that detect oscillation early,
> **richer upstream hypothesis filtering to reduce infeasible inputs**, and stage-specific call budgets...
> **We leave these directions to future work.**"

→ 상류를 고치는 것을 논문 자신이 **미구현**으로 남겼다.

**(3) 사용자 본인의 `research-survey` 워크스페이스가 같은 것을 프론티어로 표시했다**

`research-survey/GUIDELINE.md` §1:
> "정직한 경계 2가지 — ... ②**채점 결과→규칙 자동 재조정 루프는 미구현**(사람 승인 경유) — **향후 방향**"

그리고 하네스 성숙도 4단계를 정의해뒀다:
`basic` → `runtime-ready` → `runtime-enforced` → **`meta-harness`**

**IDEA 3은 이 마지막 계단이다.** 하네스가 자기 자신을 고친다.

### 설계 — `stage-attribute` (조건부 발동)

`stage-evaluate`가 FAIL을 낼 때만 발동한다. 역할은 **수정이 아니라 귀인(attribution)** 이다.

```
stage-evaluate  ──FAIL(축, 증상, 증거)──▶  stage-attribute
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                        어느 단계가        지침의 어느        1회성인가
                        원인인가?          문장이 부족?       구조적인가?
                              │
                              ▼
                    ┌─────────────────────────┐
                    │ 지침 패치 제안 (diff)    │ ← 사람 승인 필수
                    └─────────────────────────┘
                              │
                              ▼
                    해당 단계부터 재실행 (전체 재실행 아님)
```

### 귀인 판정표 — IDEA.md의 4가지 원인을 검사 가능하게

IDEA.md가 든 네 원인을 **증거로 판별**할 수 있게 만든다. 각 단계가 산출물을 남기기 때문에 가능하다:

| 증상 (evaluate가 잡은 것) | 후보 원인 | **어떻게 판별하는가** (증거) | 고칠 지침 |
|---|---|---|---|
| 정보 위계가 어색하다 | ① 레퍼런스 오해석 | `01-reference.md`의 원칙표에 위계 관련 원칙이 **있는데** 화면이 안 따랐나? → 있으면 ①아님 | — |
| | ② 화면 구조 오결정 | `01-reference.md`에 위계 원칙이 **없다** → 레퍼런스 단계가 안 뽑은 것 | `stage-reference` 지침 |
| | ③ 비주얼 규칙 모호 | `DESIGN.md`의 typography 레벨이 3개 미만 → 위계를 표현할 토큰 자체가 없음 | `stage-designmd` 지침 |
| | ④ 생성 지시 부족 | 위 셋 다 정상인데 화면만 틀림 → 저작 단계 문제 | `stage-compose` 지침 |
| 색이 조화롭지 않다 | ③ | `designmd lint`가 contrast를 통과했나? 통과했는데 어색하면 **토큰 수 부족**(팔레트가 빈약) | `stage-designmd` |
| 토큰이 미적용 | ④ | `orphaned-tokens` warning 수 + `shape.tokens` 적용률 | `stage-compose` 또는 `stage-tokens` |
| PRD 요소 누락 | ① 또는 ② | `01-reference.md`의 "적용할 화면" 열에 그 화면이 있나? 없으면 ① | `stage-reference` |

**핵심**: 각 단계가 산출물을 파일로 남기기 때문에 **"어디서부터 잘못됐는지 증거로 역추적할 수 있다."**
이게 `docs/artifacts/` 규칙의 진짜 값어치다 — 지금까지는 "다음 단계가 읽을 게 있어야 하니까"였는데,
IDEA 3이 있으면 **감사 추적(audit trail)** 이 된다.

### 별도 AI가 본다 — IDEA.md가 옳다

> IDEA.md: *"외부에서 작업을 지켜보는 역할과 **별도의 AI**가 결과를 한 번 더 검토"*

근거가 확실하다 (`src_005`): *"separating the agent doing the work from the agent judging it proves to be
a strong lever"*. 그런데 IDEA 3은 여기서 **세 번째 역할**을 만든다:

| 역할 | 하는 일 | 서베이 근거 |
|---|---|---|
| **generator** | 만든다 | — |
| **evaluator** | 이번 산출물이 기준을 넘는가 | `src_005`·`src_014` |
| **★attributor** | **왜 그렇게 됐는가 + 어느 지침을 고쳐야 하는가** | 문헌에 선례 없음 — 우리 기여 |

evaluator와 attributor를 **분리해야 하는 이유**도 같은 논리다: evaluator가 "이건 3번 단계 탓"이라고
스스로 결론내면, 자기 판정을 정당화하는 방향으로 귀인한다. 판정과 귀인은 다른 agent가 한다.

### ⚠️ 이 아이디어의 진짜 위험 — 그리고 가드

**지침을 자동으로 고치면 그 PRD에 과적합한다.** `src_018`이 정확히 이 실패를 기술한다:

> "prompt optimization methods **iteratively rewrite prompts using LLM-generated feedback**, but the resulting
> prompts often become longer, **accumulate narrow sample-specific rules**, and **generalize poorly beyond
> the training distribution**"

지침 수리 루프는 **정확히 저 방법론**이다. 가드 없이 돌리면 지침이 길어지고 이번 PRD 전용 규칙이 쌓여
심사용 PRD에서 무너진다 — **B트랙 재현성 점수를 스스로 파괴한다.**

**가드 4개** (전부 서베이 근거 있음):

| # | 가드 | 근거 |
|---|---|---|
| G1 | **지침 패치는 사람 승인 없이 적용하지 않는다** | `research-survey`가 이미 이 경계를 택함("사람 승인 경유") |
| G2 | **패치는 규칙이어야 하고 인스턴스면 거부한다.** "카드 그림자를 빼라"(인스턴스) ❌ / "깊이 표현 수단을 원칙표에서 정하고 화면 전체에 일관 적용하라"(규칙) ✅ | `src_018` "narrow sample-specific rules" |
| G3 | **지침 길이 예산.** 각 `stage-*.md`에 상한을 두고, 넘으면 추가가 아니라 **교체**를 요구 | `src_018` "prompts become longer" |
| G4 | **sealed holdout PRD.** 도메인이 다른 PRD 중 1개는 개발 내내 열지 않고, 마지막에 한 번만 돌려 과적합을 계측 | `src_018` "keeping a **sealed holdout set never inspected until release day**" |

**G4가 없으면 IDEA 3은 검증 불가능한 주장이다.** 과적합됐는지 알 방법이 없다.
반대로 G4가 있으면 **"지침 수리 루프를 돌린 하네스가 처음 보는 PRD에서도 동작한다"** 를
**실측으로 보일 수 있다** — 이게 B트랙에서 낼 수 있는 최강의 증거다.

### 무한 루프 방지

TAG가 관측한 실패 모드를 그대로 맞는다 (`src_008b`):

> **test oscillation** — 수정이 경쟁하는 제약 사이를 왕복
> **retry budget 소진** — "the most common termination mode for failed runs"

→ **재실행 예산을 유한하게.** 같은 축이 2회 연속 FAIL이면 attribute를 부르지 말고
**사람에게 에스컬레이션**한다. 그리고 attribute가 같은 단계를 3회 지목하면 그 단계를 재작성 대상으로 올린다.

---

## 4. 통합 파이프라인 v2

```
docs/PRD.md ─────────────────┐                    Penpot 1-daangn·2-airbnb ──┐
                             ▼                                               ▼
                   [1] stage-reference                            [2] stage-inventory
                   원칙표 4열 + Do/Don't                            값 분포·반복요소
                   01-reference.md                                  02-inventory.md
                             └──────────────┬──────────────────────────┘
                                            ▼
                                  [3] stage-designmd
                                  DESIGN.md (토큰 + components 바인딩)
                                            ▼
                                  ◆G1 designmd lint  ← broken-ref / orphaned / contrast
                                     (warning도 실패로 취급)
                                            ▼
                                  [4] stage-tokens
                                  Penpot set 3층 core→semantic→brand
                                            ▼
                                  [5] stage-compose (mode=pilot)
                                  대표 화면 1장
                                            ▼
                                  [6] stage-evaluate  ← 4축 × 분리 judge
                                            ▼
                                  ◆G2 사람이 export_shape 이미지 확인
                                            ▼
                        ┌────── PASS ──────┴────── FAIL ──────┐
                        ▼                                      ▼
              [5'] stage-compose(mode=full)          [7] stage-attribute
                   나머지 화면                            원인 단계 판정 → 지침 diff 제안
                        ▼                                      ▼
              [6'] stage-evaluate                      ◆G3 사람 승인
                        ▼                                      ▼
                     최종                              원인 단계부터 재실행
```

### 단계 표 (`start/SKILL.md`에 넣을 것)

| # | 단계 | 입력 | 출력 | done의 정의 | 병렬 | 담당 |
|---|---|---|---|---|---|---|
| 1 | `stage-reference` | `docs/PRD.md` | `01-reference.md` | 레퍼런스에 시대·매체·대상이 있고, Don't가 12개 이하이며 전부 레퍼런스에서 파생 | **2와 병렬** | |
| 2 | `stage-inventory` | Penpot `1-daangn`·`2-airbnb` | `02-inventory.md` | 화면 수·크기·색/간격/타이포 값 분포가 수치로 기재 | **1과 병렬** | |
| 3 | `stage-designmd` | 01+02 | `DESIGN.md` | **`designmd lint` errors=0 且 warnings=0** | | |
| 4 | `stage-tokens` | `DESIGN.md` | Penpot 토큰 3층 | `tokenOverview()`에 3 set, 전부 `active` | | |
| 5 | `stage-compose` | `DESIGN.md`+토큰 | Penpot 화면 | pilot: 대표화면 1장 / full: 나머지 | | |
| 6 | `stage-evaluate` | 5의 결과 + 01·03 | `06-verdict.md` | 4축 전부 threshold 통과 | | |
| 7 | `stage-attribute` | `06-verdict.md` + 01~03 전부 | `07-patch.md` (지침 diff) | 원인 단계 1개를 **증거와 함께** 지목 | 조건부 | |

**7개 단계, 팀원 5명.** 1·2가 병렬이고 7이 조건부이므로, 실질 담당은
`{1,2}` `{3}` `{4}` `{5}` `{6,7}` 5묶음으로 나눌 수 있다.

### 각 단계의 "없으면 무엇이 실패하는가"

| 단계 | 없으면 |
|---|---|
| 1 | 형용사로 저작해 generic한 결과가 나온다 (`src_016`) |
| 2 | 기존 파일을 읽으라는 과제 요구를 못 지킨다 |
| 3 | 결정론 게이트를 못 걸고 매직넘버가 새어든다 (clm_008 실측) |
| 4 | 토큰 없이 저작해 A트랙 일관성이 무너진다 |
| 5 | (본체) |
| 6 | 자기점검이 칭찬만 해 결함이 그대로 제출된다 (`src_005`) |
| 7 | **같은 실수가 다음 실행에서 반복된다** — feedforward-only 안티패턴 (`src_022`) |

---

## 5. IDEA.md가 서베이보다 나았던 지점 (정직하게)

| | 내 원안 | IDEA.md | 판정 |
|---|---|---|---|
| 레퍼런스 | "구체적 레퍼런스 1문장을 뽑는다" | **원칙으로 분해 + "모방하지 않을 부분"까지** | **IDEA 승.** PHILOSOPHY의 negative constraint를 산출물로 만든 것 |
| 파일럿 | 없었음 | **대표 화면 1장 먼저** | **IDEA 승.** TAG의 "steep early" 퍼널을 설계로 옮긴 것인데 나는 못 떠올림 |
| 수리 | "retry 루프 + 상세 피드백" (같은 단계 재시도) | **원인 단계로 거슬러 올라가 지침을 고침** | **IDEA 승.** 내 안은 산출물 수리, IDEA는 프로세스 수리 |

내가 보탠 것은 **근거·검사 가능한 형태·위험과 가드** 세 가지다.
특히 IDEA 3은 가드 4개(G1~G4) 없이는 B트랙 재현성을 스스로 깎는 양날의 칼이다.

---

## 6. 남은 결정 (grill 계속할 것)

| # | 결정할 것 | 내 추천 |
|---|---|---|
| Q-a | `stage-attribute`의 지침 패치를 **사람 승인 후 적용**할까, **제안만 남기고 사람이 직접 반영**할까 | 제안만 남긴다(diff 파일). 자동 적용은 G1 위반 위험 |
| Q-b | sealed holdout PRD를 **몇 개** 만들고 도메인을 무엇으로 할까 | 3개(커머스·대시보드·콘텐츠), 그중 1개 봉인 |
| Q-c | 대표 화면 선정을 **자동**(원칙표 빈도)으로 할까 **사람 지정**으로 할까 | 자동 선정 + 사람이 거부권 |
| Q-d | 7단계를 5명에게 어떻게 배분할까 | `{1,2}` `{3}` `{4}` `{5}` `{6,7}` |
| Q-e | `stage-attribute`를 이번 대회에서 **실제로 구현**할까, 설계만 제시할까 | 구현. 이게 Best 1의 차별점 |
