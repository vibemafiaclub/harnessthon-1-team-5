# Reference — 디자인 하네스

> 2026-07-30 서베이로 확장. 각 항목에 **"우리 하네스에 무엇을 주는가"** 를 한 줄로 붙였다.
> 등급은 A(피어리뷰·정부·주요기관) / B(공식표준·벤더 공식문서·제품문서) / C(전문가 분석·기업 엔지니어링 블로그) / D(프리프린트·개인블로그·큐레이션).
> 상세 조사 결과: [`survey/`](./survey/) · 제안서: [`survey/HARNESS_UPDATE.md`](./survey/HARNESS_UPDATE.md) · 계획: [`plan.md`](./plan.md)

---

## 0. 행사 · 과제

| 링크 | 등급 | 우리에게 주는 것 |
|---|---|---|
| https://vibemafiaclub.notion.site/harnessthon-1 | — | **정본.** 4스텝 셋업·접속정보·Page 구성·채점 방식. 레포와 3곳 불일치(주소·Page명·채점파일) — `HARNESS_UPDATE.md §8` |
| https://penpot.tail45121d.ts.net | — | **살아있는 Penpot 주소** (레포의 `sumin-macmini...`는 연결 실패, 실측) |

---

## 1. ★ 하네스 설계 — 단계 분할·계약 (B트랙 직결)

### 1차 문서 (벤더 공식)

| 링크 | 등급 | 우리에게 주는 것 |
|---|---|---|
| [Anthropic — Harness Design for Long-Running Application Development](https://www.anthropic.com/engineering/harness-design-long-running-apps) | **B** | ★★★ **우리 상황과 가장 닮은 문서.** ①파일 기반 핸드오프("Communication was handled via files")가 `docs/artifacts/` 규칙의 근거 ②**"agents tend to confidently praise their own work"** → 자기점검 폐기 근거 ③generator/evaluator 분리 ④4기준 hard threshold ⑤sprint contract("what 'done' looked like **before** any code") |
| [Anthropic — Demystifying Evals for AI Agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents) | **B** | ★★★ evaluator 설계 전부. **"grade each dimension with an isolated LLM-as-judge rather than using one to grade all dimensions"** / 채점자 3종(code·model·human) / "deterministic graders where possible" / "20-50 tasks from real failures" / **"two domain experts would independently reach the same verdict"** = 기준의 시험지 |
| [Anthropic — Agent Harness Design: 3 Patterns](https://claude.com/blog/harnessing-claudes-intelligence) | **B** | 반대 방향 경고. **"strip your agent harness down"**, **"ask what you can stop doing"**. 단계를 늘리는 게 곧 좋은 하네스가 아니다. code execution 45.3→61.6%, memory folder 60.4→67.2%, 캐시 토큰은 원가 10% |
| [GitHub — Multi-Agent Workflows Often Fail. Here's How to Engineer Ones That Don't](https://github.blog/ai-and-ml/generative-ai/multi-agent-workflows-often-fail-heres-how-to-engineer-ones-that-dont/) | **C** | ★★ 단계 간 **계약 2층**(typed schema=구조 / action schema=의도, discriminated union). **"Validation happens before execution"**, **"retry, repair, or escalate"**, **"Constrain actions before adding more agents"** |
| [LangChain — Choosing the Right Multi-Agent Architecture](https://www.langchain.com/blog/choosing-the-right-multi-agent-architecture) | **C** | ★★ **단계 폭 결정의 유일한 수치.** 4패턴(subagents/skills/handoffs/router) 벤치마크. 멀티도메인에서 Subagents 5호출 ~9K토큰 vs Skills 3호출 ~15K → "**67% fewer tokens**". 우리는 "독립 도메인+병렬"이라 **Subagents가 정답** |

### 학술

| 링크 | 등급 | 우리에게 주는 것 |
|---|---|---|
| [arXiv 2607.02615 — TAG: Test-Driven Agentic Artifact Generation](https://arxiv.org/abs/2607.02615) (Microsoft) | **D** | ★★★ **다단계 파이프라인 검증을 실측한 유일 논문.** "LLMs generate, we validate". fault isolation / progressive filtering. **ablation: self-correction 제거 −22pp(최대), quality gates −16, LLM judges −12, domain tools −4.** 퍼널 931건: 1단계 52.5% 폐기, 뒷단 >87%, 종단수율 35.6%. judge 캘리브레이션 Alg2(차원별, k=3 다수결, **false-positive 우선 감소**) |
| [arXiv 2604.18071 — Architectural Design Decisions in AI Agent Harnesses](https://arxiv.org/abs/2604.18071) | **D** | 하네스 5차원 분류(Subagent Arch / Context Mgmt / Tool System / Safety / Orchestration), 70개 프로젝트. **"subagent architecture = 구조적 분해, orchestration = 시간적 제어 논리"** — 우리 AGENTS.md가 섞어놓은 둘을 분리하는 근거. ⚠️ 단계 간 계약 논의는 **없음** |
| [ai-boost/awesome-harness-engineering](https://github.com/ai-boost/awesome-harness-engineering) | **D** | 하네스 논문·에세이 30건 색인. 13개 design primitive 분류 |
| [RUCAIBox/awesome-agent-harness](https://github.com/RUCAIBox/awesome-agent-harness) | D | 교차 확인용 2차 큐레이션 (미조사) |

### 아직 안 읽은 리드 (우선순위 순)

| 링크 | 왜 |
|---|---|
| [arXiv 2602.16873 — AdaptOrch](https://arxiv.org/abs/2602.16873) | task dependency graph로 topology(parallel/sequential/hierarchical) **동적 선택** — 우리 "의존없으면 병렬" 규칙의 알고리즘 |
| [arXiv 2601.07577 — TDP: Task-Decoupled Planning](https://arxiv.org/abs/2601.07577) | planning/execution 분리로 **localized replanning** — 한 단계 실패가 전체 재실행을 부르지 않게 |
| [arXiv 2606.10106 — What makes a harness a harness](https://arxiv.org/abs/2606.10106) | 하네스 정의론 |
| [arXiv 2605.18747 — Code as Agent Harness](https://arxiv.org/abs/2605.18747) | 코드를 하네스로 쓰는 패턴 |
| [Martin Fowler / Böckeler — Harness engineering](https://martinfowler.com/articles/harness-engineering.html) | 벤더 중립 시각 |
| [Anthropic — Beyond Permission Prompts](https://www.anthropic.com/engineering/beyond-permission-prompts) | 승인 경계 설계 |

---

## 2. ★★ 디자인 명세 포맷 — design.md 계열

| 링크 | 등급 | 우리에게 주는 것 |
|---|---|---|
| [google-labs-code/design.md](https://github.com/google-labs-code/design.md) | **C** | ★★★ **우리 중간 산출물 포맷의 답.** 26.7k★, Apache-2.0. YAML 토큰 + Markdown 산문, 섹션 정규순서 8개. 우리가 포맷을 발명하지 않아도 된다 |
| [design.md — docs/spec.md](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md) | **C** | 정식 스키마. `{path.to.token}` 참조, Color는 hex/rgb/hsl/**oklch()**/color-mix 전부 허용, Dimension은 px/em/rem, `omitted` 섹션으로 린터 경고 억제 |
| [design.md — PHILOSOPHY.md](https://github.com/google-labs-code/design.md/blob/main/PHILOSOPHY.md) | **C** | ★★★ **반하드코딩의 진짜 메커니즘.** "**The quality of a generated design is determined less by the precision of its values than by how clearly the intent is described**" / "**Adjectives describe a region. A specific reference describes a point**" / 부정 제약은 구체적 레퍼런스에서 **공짜로** 온다 |
| [`@google/design.md` npm v0.4.0](https://www.npmjs.com/package/@google/design.md) | **B** | ★★★ **실행 검증 완료.** `lint`가 `broken-ref`(error)·`orphaned-tokens`(warning)·`contrast-ratio`(WCAG 4.5:1 실계산)을 결정론적으로 잡고 error 시 **exit 1**. `export --format dtcg`가 DTCG 2025.10 스키마 출력. ⚠️ contrast는 warning이라 exit 0 → 하드 게이트로 쓰려면 우리가 warning을 실패로 취급 |
| [voltagent/awesome-design-md](https://github.com/voltagent/awesome-design-md) | D | design.md 파생 사례 (미조사) |
| [mattpocock/skills](https://github.com/mattpocock/skills) | D | 스킬 작성법 자체. `grilling`(1문항씩 심문) · `writing-great-skills`. **`grill-me`+`grilling`은 `~/.claude/skills/`에 설치 완료** |

---

## 3. ★★ 디자인 토큰 표준 · Penpot

| 링크 | 등급 | 우리에게 주는 것 |
|---|---|---|
| [W3C DTCG — Design Tokens Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/) | **B** | ★★ **정식 표준** (Final Community Group Report, 2025-10-28, stable). Primitive 7종 + Composite 6종. 예약키 `$value`(필수)·`$type`(상속)·`$description`·`$extensions`·`$deprecated`·`$extends`·`$root`. 참조 `{group.token}` 또는 `$ref` JSON Pointer. **순환 참조는 오류로 보고해야 함** |
| [Penpot — Design Tokens 공식 문서](https://help.penpot.app/user-guide/design-tokens/) | **B** | ★★★ 토큰 17종. **set 순서 = 우선순위(마지막이 덮음, CSS 캐스케이딩)** / 비활성 set은 resolution 제외 / **"not to groups"** / 점 표기가 중첩 그룹으로 펼쳐짐 / ★**수식 지원** `{spacing.base} * 1.5` (연산자 앞뒤 공백 필수, 참조 대소문자 구분) / import·export JSON |
| [penpot/penpot#7916 — API for Tokens tab](https://github.com/penpot/penpot/issues/7916) | **B** | **CLOSED 2026-02-09.** 검색 요약이 "아직 feature request"라 한 것을 뒤집는 결정적 근거 — Tokens Plugin API는 랜딩했다 |
| [Tokens Studio — Native design tokens in Penpot](https://tokens.studio/blog/tokens-studio-penpot-bringing-native-open-standard-design-tokens-to-everyone) | C | Penpot ↔ Tokens Studio 상호운용 (미정독) |
| [Style Dictionary — DTCG 지원](https://styledictionary.com/info/dtcg/) | B | 토큰 → CSS/플랫폼 코드 변환. B트랙 재현성 스토리의 마지막 조각 (미정독) |

**★ Penpot 침묵 실패 3종** (우리 `cheatsheet.md`에 전부 누락 — `HARNESS_UPDATE.md §7`):
① set이 비활성이면 적용 안 됨 ② 토큰 적용은 **비동기**(~100ms 대기) ③ **Group에는 적용 불가**

---

## 4. 색·타이포·간격 스케일

| 링크 | 등급 | 우리에게 주는 것 |
|---|---|---|
| [WCAG 2.2 — Contrast (Minimum) 1.4.3](https://www.w3.org/TR/WCAG22/#contrast-minimum) | **A** | 결정론 색 검사의 유일한 객관 기준. 일반 **4.5:1** / large text **3:1**(=18pt 또는 14pt bold). 비율 = `(L1+0.05)/(L2+0.05)`. 1.4.11 Non-text **3:1**. 예외: 비활성 UI·로고 |
| [OKLCH 색공간 가이드](https://colorarchive.org/guides/oklch-color-space-guide/) | D | ★ 램프 생성 규칙: **C·H 고정, L만 변화 → 지각적 균일**. HSL은 균일하지 않음(같은 L에서 노랑이 파랑보다 훨씬 밝게 보인다). Ottosson 2020 |
| [designsystems.com — Space, grids, and layouts](https://www.designsystems.com/space-grids-and-layouts/) | D | 타입 비율 1.125/**1.25**("safer for complex UI")/**1.333**("most widely used for web")/1.5. 2-스케일 전략. Material 2014의 8pt 그리드, **"12-column + 8pt = de facto 표준"**, 4pt 하프스텝 |

**미확인**: WCAG relative luminance 공식 원문(fetch 절단) · APCA(WCAG3 후보) 채택 상태 · Ottosson 원본 블로그

---

## 5. 기존 디자인 읽기 (정규화 단계)

| 링크 | 등급 | 우리에게 주는 것 |
|---|---|---|
| [dembrandt](https://github.com/dembrandt/dembrandt) | D | 방법론 전이: 렌더 → computed style 읽기 → **색 사용빈도와 confidence 분석** → 유사 타이포 그룹화 → 간격 패턴 검출 |
| [designlang](https://designlang.vercel.app/) | D | 더 나아간 것들: CSS health audit / **semantic region classifier**(nav·hero·pricing·footer) / **component clustering with variant & slot detection** / dark-mode pairing / CI drift bot |
| [arvindrk/extract-design-system](https://github.com/arvindrk/extract-design-system) | D | 동일 목적의 AI agent skill 형태 참고 |

→ 웹 대상이지만 **방법은 그대로 전이된다**: Penpot에서 `shape.fills`·`flex.rowGap`·`text.fontSize`를
`1-daangn`·`2-airbnb` Page 전체에서 수집 → 클러스터링 → 빈도순 dedupe.

---

## 6. 반하드코딩 · 일반화 (B트랙 재현성)

| 링크 | 등급 | 우리에게 주는 것 |
|---|---|---|
| [arXiv 2605.21318 — TextReg: Mitigating Prompt Distributional Overfitting](https://arxiv.org/abs/2605.21318) | D | ★ **우리 위험의 정확한 이름.** "prompts often become longer, **accumulate narrow sample-specific rules**, and generalize poorly beyond the training distribution" |
| (동 검색) eval 과적합 방지 실무 | D | ★★ **"keeping a sealed holdout set never inspected until release day"** → 도메인 다른 PRD 2~3개 중 1개는 개발 중 **절대 열지 않고** 마지막에 한 번만 돌린다. B트랙 재현성의 유일한 실증 방법 |
| [arXiv 2510.08413 — Prompts Generalize with Low Data](https://arxiv.org/pdf/2510.08413) | D | 프롬프트 일반화 경계 (미조사) |

---

## 7. Penpot Plugin API 실측 (우리만 가진 자료)

연결된 MCP의 `high_level_overview` 실측. **우리 `cheatsheet.md`에 없는 것들.**
전문: [`survey/20-knowledge-base/notes/axis-C-design-tokens.md`](./survey/20-knowledge-base/notes/axis-C-design-tokens.md) · [`axis-F-quality-evaluation.md`](./survey/20-knowledge-base/notes/axis-F-quality-evaluation.md)

| API | 우리에게 주는 것 |
|---|---|
| `penpotUtils.analyzeDescendants(root, evaluator)` | ★★★ **결정론 채점기 + 자동 교정기.** overview의 예제가 곧 **4배수 정렬 검사 + 교정**이다. "evaluator can return **corrector functions** or diagnostic data" |
| `penpotUtils.isContainedIn(shape, container)` | 담기 위반 검출 |
| `penpotUtils.shapeStructure(root, 3)` | 위계·네이밍 검사 (`Board 1` 잔존 등) |
| `penpotUtils.tokenOverview()` / `findTokenByName` | set별 토큰 목록 |
| `shape.tokens` → `{prop:"token.name"}` | ★★ **토큰 적용 증명** — 채점 "정의만 하고 미적용 감점" 대응 |
| `penpotUtils.addFlexLayout(container, dir)` | ★★ 자식 있는 board에 flex를 걸 때 **반드시 이것**. `board.addFlexLayout()`은 **자식 순서를 임의 재배열**한다 |
| `penpotUtils.getPageByName(name)` | 레포의 `currentFile.pages.find(...)`보다 간결 |
| `export_shape` | ★★★ **evaluator가 이미지로 실제로 본다** — Anthropic의 "Playwright로 직접 클릭"의 대응물 |
| `penpot.generateStyle(shapes,{type:'css'})` | CSS로 뽑아 **토큰 밖 매직넘버** 탐지 |
| Variants (`createVariantFromComponents`, `switchVariant`) | 컴포넌트 상태 변형 — cheatsheet에 언급 없음 |

**기타 실측 주의**: `width`/`height`는 **읽기 전용**(`resize()` 사용) · `fills`/`strokes` 배열 **내용도 읽기 전용**(배열 통째 교체) · hex는 **대문자만** · Text의 `resize()`는 `growType`을 `fixed`로 바꿈(되돌려야 함) · **`use_figma`는 30초 타임아웃**

**파일 밖 접근 불가 확인**: `penpot.openFile`·`getFile`·`files` 전부 없음 → 기존 파일이 같은 파일의 Page여야 하는 이유

---

## 8. 서베이 방법론 (이번에 쓴 도구)

| 도구 | 이번에 실제로 한 일 |
|---|---|
| `insane-search` | Notion SPA가 WebFetch로 빈 껍데기만 오자 pageId를 뽑아 `loadPageChunk` API로 **4스텝 원문 전문 확보**(2 chunk, 171 블록) |
| `insane-research` 7-Phase | claim ledger + 출처 등급 + abstention 규칙. 11개 주장 중 **실행확정 3 / unresolved 4**를 정직하게 분리 |
| `traceable-pkm` | ⚠️ **파이프라인 실행 불가** — V1 boundary가 YouTube+한국어자막+humanities만 받아 웹/논문은 `unsupported_source`. **스키마와 10개 hard gate만 차용** |
| `research-survey` | 워크스페이스 구조(10단위 넘버링)와 taxonomy 다이얼 개념 차용 |
| `@google/design.md` CLI | **실행 검증 3건** (lint 게이트 / contrast 계산 / DTCG export) |
| `pdfplumber` | arXiv PDF가 WebFetch로 파싱 불가하자 로컬 파싱해 TAG 전문 확보 → ablation 수치 회수 |
