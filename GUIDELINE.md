# GUIDELINE — 레포 전체 구성과 세부 기능

> ⚠️ **2026-08-01 — 이 문서는 서베이 이전에 작성됐습니다. 사실 오류(주소·Page명)는 고쳤지만
> 설계 내용은 낡았습니다.** 아래가 최신입니다:
>
> | 문서 | 내용 |
> |---|---|
> | [`survey/HARNESS_DESIGN_v2.md`](./survey/HARNESS_DESIGN_v2.md) | **현행 설계** — 7단계 파이프라인·계약·evaluator·attribute |
> | [`survey/DECISIONS.md`](./survey/DECISIONS.md) | 확정된 결정 5건과 근거 |
> | [`survey/HARNESS_UPDATE.md`](./survey/HARNESS_UPDATE.md) | 문헌 근거 전문 |
> | [`REFERENCE.md`](./REFERENCE.md) | 축별 레퍼런스 |
>
> 특히 이 문서의 **"자기점검" 관련 서술과 4절차는 폐기됐습니다**(evaluator 분리로 대체).

> 하네스톤 1회차 · 5조 작업 레포 (`harnessthon-1-team-5`)
> 이 문서는 **레포에 실제로 들어 있는 것**을 기준으로 정리한 참조 문서입니다.
> 규칙의 원본은 [`AGENTS.md`](./AGENTS.md)이고, 이 문서는 그것을 풀어서 설명합니다.
> 규칙이 서로 다르게 읽히면 **`AGENTS.md`가 우선**입니다.

---

## 1. 우리가 만드는 것 — 딱 한 줄

**PRD 문서 하나(`docs/PRD.md`)를 입력하면 여러 sub agent가 단계별로 일해서 Penpot 디자인을 만들어내는 자동화 파이프라인(= 하네스)** 을 만듭니다.

| 오해 | 사실 |
|---|---|
| "디자인을 잘 그리는 대회" | ❌ 하네스를 만드는 대회다. 디자인은 하네스를 **실행해서** 나온다 |
| "예쁘게만 나오면 됨" | ❌ 디자인 완성도(A)와 하네스 설계(B) **두 트랙**으로 채점된다 (§8) |
| "PRD 보고 스크립트 짜두면 됨" | ❌ 심사용 PRD는 미공개다. 하드코딩은 그 자리에서 무너진다 |

손으로 그리지 않습니다. `/start`를 실행해서 나오게 만듭니다.

---

## 2. 물리 구성 — 어디가 내 컴퓨터이고 어디가 서버인가

가장 헷갈리는 부분입니다. **`localhost`가 붙은 건 전부 내 노트북**이고, **Penpot 본체만 원격**입니다.

| 구성 | 위치 | 주소 | 내가 띄우나 |
|---|---|---|---|
| MCP 서버 (`pigma-mcp`) | **내 노트북** | `http://localhost:4401` | ✅ 내가 직접 |
| Penpot 플러그인 | **내 브라우저 탭** | `http://localhost:4400/manifest.json` | ✅ 내가 설치·연결 |
| **Penpot 본체** | **VMC 중앙 서버(원격)** | **https://penpot.tail45121d.ts.net** | ❌ 운영이 운영 |

```
[내 하네스(Claude Code)]
        |  MCP over HTTP  (:4401/mcp)
        v
[내 노트북 MCP 서버 :4401]
        ^  WebSocket
        |
[내 브라우저 Penpot 플러그인 :4400]
        |
        v
[중앙 Penpot (원격) — 5조 / 파일 `작업`]
```

**핵심**: 저작 코드는 **내 브라우저에서 실행**되고, 결과는 **중앙 Penpot의 공유 파일에 실시간 저장**됩니다.
→ 그래서 엉뚱한 Page에 쓰면 **그 즉시 남의 화면에 반영**됩니다. §7을 반드시 보세요.

### 실행 순서 (이벤트 시작할 때 한 번)

```bash
# 1. 로컬 MCP 실행 — 이 창은 이벤트 내내 켜둡니다
npx -y @matfia/pigma-mcp
```

2. 중앙 Penpot 로그인 → 팀 목록에서 **`5조`** → 파일 **`작업`** 열기
3. 에디터 툴바 **플러그인 아이콘(퍼즐)** → "Write a plugin URL"에 `http://localhost:4400/manifest.json` → **Install**
4. **Open** → 권한 **Allow** → **Connect MCP Server** → **● Connected** 확인
5. ⚠️ **이 브라우저 탭을 닫지 않습니다.** 닫으면 연결이 끊기고 저작이 전부 실패합니다.

MCP 등록은 `.mcp.json`에 이미 커밋돼 있어 따로 할 게 없습니다. 하네스를 처음 띄울 때 `penpot` 서버 **승인만** 누르면 됩니다.

---

## 3. 레포 파일 트리 (현재 실제 상태)

```
harnessthon-1-team-5/
├── CLAUDE.md                          🔒 공용 — AGENTS.md를 @참조하는 1줄
├── AGENTS.md                          🔒 공용 — 규칙 원본 (조장 승인 필요)
├── README.md                          🔒 공용 — 환경 셋업 / 빠른 시작
├── GUIDELINE.md                       ← 이 문서
├── .mcp.json                          penpot MCP 서버 사전 등록
├── .claude/
│   └── skills/
│       ├── start/SKILL.md             🔒 공용 — 하네스 진입점 ⚠️ 아직 빈 뼈대
│       ├── penpot-design/
│       │   ├── SKILL.md               📦 스타터 — 저작 절차 + STEP 0 게이트 + 채점축
│       │   └── cheatsheet.md          📦 스타터 — figma.* / penpot.* 실증 스니펫
│       └── git/SKILL.md               🔒 공용 — 작업 저장(커밋·푸시·충돌해결)
└── docs/
    ├── PRD.md                         ← 입력 PRD (운영 배포) ⚠️ 현재 플레이스홀더
    └── artifacts/                     ← 단계 간 중간 산출물 ⚠️ 현재 .gitkeep만
```

**아직 없는 것 (= 우리가 만들 것)**

| 경로 | 상태 | 누가 |
|---|---|---|
| `.claude/agents/stage-*.md` | ❌ 디렉터리 자체가 없음 | 단계 담당자별로 생성 |
| `start/SKILL.md`의 단계 표·실행 순서 | ❌ HTML 주석으로 비어 있음 | 설계 세션 후 조장 |
| `.claude/skills/{내 단계용 skill}/` | ❌ 없음 | 필요한 사람이 자유 생성 |
| `docs/artifacts/*` | ❌ 비어 있음 | 하네스 실행 결과로 채워짐 |

---

## 4. 파일별 세부 기능

### `CLAUDE.md` 🔒
내용은 `@AGENTS.md` **한 줄**. Claude Code가 세션 시작 시 자동으로 읽는 파일이므로, 실질적으로 **`AGENTS.md`가 모든 세션의 시스템 규칙으로 주입**됩니다. 그래서 `AGENTS.md`를 고치는 건 팀 전원의 에이전트 행동을 고치는 것과 같고, 조장 승인이 필요합니다.

### `AGENTS.md` 🔒 — 규칙 원본
담고 있는 것:
1. **무엇을 만드는가** — 하네스지 디자인이 아니라는 선언
2. **디렉터리 구조**와 각 경로의 소유권 표시(🔒 공용 / 📦 스타터 / ✅ 자유)
3. **충돌 방지 권한 매트릭스** (§9)
4. **단계 설계 원칙 3개** — 단계=sub agent 1개, 이전 산출물을 읽어 자기 산출물 생성, 병렬 가능하면 병렬
5. **Penpot Page 담당표** (§7)
6. 저작 방법 요약 → `penpot-design` skill로 위임

### `README.md` 🔒 — 환경 셋업 전용
로컬/원격 구분표, 아키텍처 다이어그램, 빠른 시작 4단계, 저장 명령. **규칙은 여기 없습니다** — `AGENTS.md`로 넘깁니다.

> ✅ 2026-08-01 수정됨 — 존재하지 않는 `participant-onboarding.md` 참조를 없애고 README에 트러블슈팅 표를 직접 넣었습니다.

### `.mcp.json` — MCP 사전 등록
```json
{ "mcpServers": { "penpot": { "type": "http", "url": "http://localhost:4401/mcp" } } }
```
참가자가 `claude mcp add`를 직접 칠 필요가 없도록 커밋해 둔 것입니다. 세션 첫 실행 때 **승인 프롬프트 1회**만 누르면 `use_figma` 등 툴이 열립니다.

> `penpot-design/SKILL.md`의 사전조건에는 아직 `claude mcp add --transport http penpot ...` 수동 명령이 남아 있습니다. `.mcp.json`이 있으면 **불필요**합니다. 둘 중 하나만 하면 됩니다.

### `.claude/skills/start/SKILL.md` 🔒 — 하네스 진입점 ⚠️ **미완성**
트리거: `/start`, "시작해줘", "디자인 만들어줘", "PRD 실행", "하네스 돌려줘"

지금 들어 있는 것은 **뼈대뿐**입니다. 의도적으로 비워 둔 파일입니다 — "단계를 어떻게 나눌지"가 이 이벤트의 핵심 학습이라서입니다. 채워야 할 두 곳:

```
## 단계 정의 (팀이 채울 것)
| # | 단계 | sub agent | 입력 | 출력 | 담당자 | 병렬 가능 |

## 실행 순서 (팀이 채울 것)
1. stage-1-xxx 호출 → docs/artifacts/xxx.md 생성 확인
2. stage-2-yyy, stage-3-zzz 병렬 호출
```

이미 확정된 **실행 원칙 4개** (여기는 안 바뀝니다):

| # | 원칙 | 왜 |
|---|---|---|
| 1 | 각 단계는 **반드시 sub agent에게 위임**. 오케스트레이터가 직접 저작하지 않는다 | 채점축 B의 "단계 분할의 타당성" |
| 2 | 각 sub agent에게 **입력(읽을 파일)·출력(쓸 파일)을 명시적으로** 전달 | 채점축 B의 "단계 간 계약의 명료성" |
| 3 | **의존관계 없는 단계는 병렬로** 호출 | 실행 시간 + 설계 성숙도 |
| 4 | 중간 산출물은 전부 `docs/artifacts/`에 남긴다 | 남지 않으면 **다음 단계가 읽을 게 없다** |

완료 조건: Penpot 파일에 **토큰 + 컴포넌트 + 화면**이 만들어져 있고, 각 단계 산출물이 `docs/artifacts/`에 남아 있음.

### `.claude/skills/penpot-design/SKILL.md` 📦 — 저작 엔진
트리거: "디자인 만들어줘", "PRD 디자인", "figma 저작", "토큰/컴포넌트 세팅"

**이 skill을 키우는 것이 곧 순위입니다.** 개선·확장이 자유롭게 허용된 유일한 공유 자산입니다.

담고 있는 것:
- **STEP 0 — Page 확정 게이트** (§7) : 건너뛰기 금지. Page가 확정되기 전엔 저작을 시작하지 않고 되묻습니다
- **기존 디자인 읽기 경로** (§7) : `penpot.openFile`이 없어서 같은 파일의 `1-daangn`·`2-airbnb` Page를 읽습니다
- **저작 4절차**: 토큰 → 컴포넌트 → 화면 조립 → 자기점검
- **채점 축 2트랙** (§8)
- **`use_figma` 사용 규칙**: 함수 본문처럼 작성 → `return`으로 결과 반환. `console.log`는 반환 안 됨. **10연산 이하로 쪼개 점진 실행 + 매 단계 검증**. 실패 시 에러 읽고 수정 후 재시도

저작 4절차 상세:

| # | 단계 | 핵심 API | 검증 |
|---|---|---|---|
| 1 | **토큰 먼저** | `figma.variables.createVariableCollection` + `createVariable` | 색/간격/타이포/라운드가 값이 아니라 **이름**으로 존재하는가 |
| 2 | **컴포넌트** | `figma.createFrame()`(+autolayout) → `figma.createComponent(frame)` | 반복 요소가 컴포넌트화됐는가 |
| 3 | **화면 조립** | 컴포넌트 **인스턴스**를 autolayout 프레임에 배치 | 위계·네이밍이 정리됐는가 |
| 4 | **자기점검** | 위계/토큰/컴포넌트 조회 (`penpot.*` 읽기 병행) | 실제로 다 들어갔는가 |

### `.claude/skills/penpot-design/cheatsheet.md` 📦 — 실증 스니펫
두 파트로 나뉘어 있습니다:
1. **앞부분** — `figma.*` 퀵레퍼런스 (Auto Layout, Variables, Component)
2. **뒷부분** — `penpot.*` 네이티브 API 치트시트 (fallback·심화용). `execute_code` 툴 기준으로 작성됨

여기에 **심사 최적화 팁 5개**와 **아이콘 렌더 방법(SVG 문자열 → `createNodeFromSvg`)** 이 들어 있습니다. §6에 정리했습니다.

### `.claude/skills/git/SKILL.md` 🔒 — 작업 저장
트리거: `/git 지금까지 작업내용 저장해줘`, "작업 저장해줘", "커밋해줘", "저장해줘", "푸시해줘"

git을 몰라도 되게 만든 skill입니다. 7단계 절차 + 3개 금지사항. §10에 정리했습니다.

### `docs/PRD.md` — 입력 문서 ⚠️ **현재 플레이스홀더**
운영이 배포합니다. 개발 중에는 **예시 PRD**, 심사 때는 **미공개 PRD**가 들어옵니다.
지금은 "하드코딩하지 말라"는 경고만 들어 있는 빈 파일입니다.

**하네스는 이 파일을 읽어서** 디자인을 만들어야 합니다. 파일 경로는 고정, 내용은 가변입니다.

### `docs/artifacts/` — 단계 간 계약이 물리적으로 존재하는 곳
현재 `.gitkeep`만 있습니다. 단계 간 데이터가 **파일로 오가는 유일한 경로**이므로, 여기가 비어 있으면 파이프라인이 끊깁니다. 실행 원칙 4번이 이걸 강제합니다.

---

## 5. 하네스 실행 파이프라인 (설계 계약)

```
docs/PRD.md ─────┐
                 │
Penpot `1-daangn`·`2-airbnb` ─┐
                       v
              ┌────────────────┐
              │  /start        │  오케스트레이터 — 직접 저작 금지
              └───┬────────┬───┘
                  │        │  (의존 없으면 병렬)
          ┌───────v──┐  ┌──v───────┐
          │ stage-1  │  │ stage-2  │  ← 각 단계 = sub agent 1개
          └───┬──────┘  └──┬───────┘
              │            │
              v            v
        docs/artifacts/*.md  (단계 간 계약 = 파일)
              │
              v
        penpot-design skill (use_figma)
              │
              v
        내 브라우저 → 중앙 Penpot 내 Page
```

**각 sub agent가 반드시 갖춰야 하는 계약 4항목**

| 항목 | 내용 |
|---|---|
| 입력 | 어떤 파일을 읽는가 (`docs/PRD.md` 또는 이전 단계 산출물 또는 Penpot `1-daangn`·`2-airbnb` Page) |
| 출력 | `docs/artifacts/` 아래 정확히 어떤 파일을 쓰는가 |
| 판단 규칙 | 하드코딩 없이 **어떤 규칙으로** 결정하는가 (← 재현성 점수의 핵심) |
| 자기검증 | 자기 산출물이 제대로 나왔는지 어떻게 확인하는가 |

> 새 단계를 추가하면 **단계 간 입출력 계약이 바뀝니다.** 그래서 혼자 못 늘립니다 — 조장 승인 + 팀 sync가 필요합니다.

---

## 6. Penpot 저작 API — 실측 대조표

`use_figma` MCP 툴로 코드를 실행하고, 코드 안에서 `figma.*`를 씁니다. 엔진은 Penpot이지만 **인터페이스는 Figma로 통일**돼 있습니다. `penpot.*` 병행 가능.

### figma.* ↔ penpot.* 대응

| 하는 일 | `figma.*` (권장) | `penpot.*` (fallback·심화) |
|---|---|---|
| 프레임/보드 생성 | `figma.createFrame()` | `penpot.createBoard()` |
| Auto Layout 켜기 | `frame.layoutMode = 'VERTICAL'` | `const fl = board.addFlexLayout(); fl.dir = 'column'` |
| 간격 | `itemSpacing = 12` | `fl.rowGap = 12; fl.columnGap = 8` |
| 패딩 | `paddingLeft/Right/Top/Bottom` | `fl.horizontalPadding / verticalPadding` |
| 주축 정렬 | `primaryAxisAlignItems='MIN\|CENTER\|MAX\|SPACE_BETWEEN'` | `fl.justifyContent='start\|center\|end\|space-between'` |
| 교차축 정렬 | `counterAxisAlignItems='CENTER'` | `fl.alignItems='start\|center\|end'` |
| 크기 모드 | `layoutSizingHorizontal='HUG'\|'FIXED'` | `horizontalSizing='auto'\|'fix'` |
| 토큰 묶음 생성 | `figma.variables.createVariableCollection('theme')` | `penpot.library.local.tokens.addSet({name:'core'})` |
| 토큰 생성 | `createVariable('color/primary', col, 'COLOR')` | `set.addToken({type:'color', name:'color.primary', value:'#4f46e5'})` |
| **토큰 적용** | — | **`board.applyToken(token, 'fill')`** |
| 컴포넌트화 | `figma.createComponent(card)` | `penpot.library.local.createComponent([board])` |
| 인스턴스 | (인스턴스 API) | `comp.instance()` |
| 텍스트 | `figma.createText('제목')` | `penpot.createText('Title')` |
| 아이콘 | `figma.createNodeFromSvg(svg)` | 동일 (양쪽 실증됨) |
| Grid Layout | — | `board.addGridLayout()` |

**주의할 차이점**

- `layoutSizingHorizontal='FILL'`은 지원되지 않고 **`FIXED`로 폴백**됩니다.
- 토큰 이름의 `'/'`는 `'.'`로 **자동 변환**됩니다 (`color/primary` → `color.primary`).
- **토큰 "적용"은 `penpot.applyToken`** 쪽에 있습니다. `figma.variables`로 정의만 하고 실제 도형에 바인딩하지 않으면 **감점**입니다 — 정의와 적용을 짝으로 처리하세요.
- 지원 `figma.*` 부분집합과 미지원 목록은 이벤트 배포 문서 `figma-compat/README.md`에 있습니다(레포 밖). 미지원 호출은 **명확한 에러로 안내**되므로, 그때 `penpot.*`로 갈아타면 됩니다.

### 자기점검 조회 스니펫

```js
// 현재 페이지 위계
return penpot.currentPage.root.children.map(s => ({
  name: s.name, type: s.type, kids: s.children?.length ?? 0
}));

// 토큰/컴포넌트 요약
return {
  tokenSets: penpot.library.local.tokens.sets.map(s => ({ name: s.name, n: s.tokens.length })),
  components: penpot.library.local.components.map(c => c.name)
};
```

### 아이콘

SVG 문자열을 그대로 넣습니다. Lucide/Heroicons 등을 복사해 붙이면 됩니다. **컬러링은 SVG의 `stroke`/`fill`을 인라인으로 지정**하는 방식이 양쪽에서 가장 안정적입니다.

```js
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3C1E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
const icon = figma.createNodeFromSvg(svg); icon.name = 'icon/search';
```
(Figma는 FRAME, pigma는 group을 반환하지만 **시각 결과는 동일**)

### `use_figma` 실행 규칙 (지키지 않으면 자주 깨집니다)

1. 코드는 **함수 본문처럼** 작성하고 `return`으로 결과를 돌려받습니다.
2. `console.log`는 **반환되지 않습니다.** 디버깅도 `return`으로 합니다.
3. **10연산 이하로 쪼개** 점진 실행하고 매번 결과를 확인합니다. 한 번에 큰 덩어리를 보내면 어디서 깨졌는지 알 수 없습니다.
4. 실패하면 **에러 메시지를 읽고** 수정 후 재시도합니다.

---

## 7. 🔴 Penpot 작업 규칙 — 여기서 사고가 납니다

### 내 작업 Page를 먼저 확인하세요

중앙 Penpot 로그인 → 팀 목록의 **`5조`** → 파일 **`작업`** 을 엽니다.

| Page | 담당 | 성격 |
|---|---|---|
| **`1-daangn`** | — | **과제의 기존 디자인 — 읽기 전용. 수정 금지** |
| **`2-airbnb`** | — | **과제의 기존 디자인 — 읽기 전용. 수정 금지** |
| `이한얼` | 이한얼 (조장) | 개인 작업 |
| `김소현` | 김소현 | 개인 작업 |
| `이정아` | 이정아 | 개인 작업 |
| `한수현` | 한수현 | 개인 작업 |
| `장주영` | 장주영 | 개인 작업 |
| `중간공유` | 공용 | 결과를 **옮겨 담는** 곳 |
| `최종제출` | 공용 | **심사 대상** |

`중간공유`·`최종제출`에서 **처음부터 저작하지 않습니다.** 옮겨 담는 곳입니다.

### STEP 0 — 작업 Page 확정 게이트 (건너뛰기 금지)

Penpot은 **실시간 협업**입니다. 엉뚱한 Page에 저작하면 그 즉시 남의 작업 위에 그려지고, 되돌리기가 서로 꼬입니다. 그래서 `penpot-design` skill은 **Page가 확정되기 전에 저작을 시작하지 않고 되묻습니다.**

```js
// 1) 현재 파일의 Page 목록과 현재 선택된 Page 확인
return {
  current: penpot.currentPage.name,
  pages: penpot.currentFile.pages.map(p => p.name)
};
```

```js
// 2) 확정된 Page로 전환하고, 전환됐는지 확인한 다음 저작
const target = "홍길동";               // ← 사용자가 확정해준 이름
const p = penpot.currentFile.pages.find(x => x.name === target);
if (!p) return { error: "그런 Page 없음", pages: penpot.currentFile.pages.map(x => x.name) };
penpot.openPage(p);
return { switched: penpot.currentPage.name };
```

**되묻기가 필수인 상황**

| 상황 | 행동 |
|---|---|
| 사용자가 Page를 말하지 않음 | 목록 보여주고 질문 → **답 대기** (기본값으로 첫 Page 쓰지 않음) |
| 지정한 이름이 목록에 없음 | 유사 후보와 함께 되묻는다. **임의로 만들지 않는다** |
| `중간공유`·`최종제출`에 쓰라는 지시 | 공용 Page임을 알리고 **한 번 더** 확인받는다 |
| 하네스 **무인 실행** 중 | Page 이름을 **인자로 받아야** 한다. 없으면 즉시 중단하고 요구한다 |

### 기존 파일은 같은 파일의 `1-daangn`·`2-airbnb` Page에 있다

**하네스는 "지금 열려 있는 파일" 밖을 볼 수 없습니다.** Penpot Plugin API에는 파일을 여는 수단이 없습니다 — `penpot.openFile` · `penpot.getFile` · `penpot.files` **전부 `undefined`**입니다.

그래서 과제의 기존 디자인이 **별도 파일이 아니라 작업 파일 안의 `1-daangn`·`2-airbnb` Page**로 들어 있습니다. 같은 파일이므로 자유롭게 읽힙니다.

```js
// 기존 디자인 Page의 화면들을 읽는다 (Page 전환 없이도 읽힌다)
const src = penpotUtils.getPageByName("2-airbnb");   // 또는 "1-daangn"
const boards = src.root.children.filter(s => s.type === "board" || s.type === "frame");
return boards.map(b => ({ name: b.name, w: b.width, h: b.height, children: (b.children || []).length }));
```

- 전체 트리를 훑을 때는 **`penpotUtils.findShapes(pred)`** — 인자 없이 부르면 **파일의 모든 Page**를 순회합니다 (공식 유틸).
- 읽기만 할 때는 **`penpot.openPage()`로 전환하지 마세요.** 전환하면 **남이 보는 화면도 바뀝니다.**
- ⚠️ **두 Page를 수정하지 않습니다.** 정규화 결과는 **자기 Page**에 만듭니다.

**읽어야 할 것**: 화면 목록·크기 / 반복되는 요소 / 색 계열 / 간격·타이포 값의 분포 / 네이밍 상태.
**인벤토리 문서는 주어지지 않습니다. 읽어서 파악하는 것이 과제의 일부입니다.**

---

## 8. 채점 기준 — 2트랙

### A. 디자인 완성도 — 전 참가자 채점, 4항목 × 1~5점 → **TOP 3**

화면만 보고 판단되는 것들입니다.

| 항목 | 5점 기준 |
|---|---|
| 레이아웃·정렬 | 그리드·여백이 일관되고 정렬이 맞다 |
| 타이포·컬러 | 제목/본문 위계가 명확하고 색이 조화롭다 |
| 완성도·디테일 | 실제 서비스 화면이라 해도 믿을 만하다 |
| PRD 충족도 | PRD가 요구한 화면·요소가 전부 있다 |

### B. 하네스 설계 완성도 — 심사위원(DRI) 채점, 5항목 → **Best 1** (TOP 3 제외 후 선정)

| 항목 | 무엇을 보는가 | 레포에서 어디에 나타나는가 |
|---|---|---|
| 단계 분할의 타당성 | 단계를 왜 그렇게 잘랐는가 | `start/SKILL.md` 단계 표 |
| 단계 간 계약의 명료성 | 입력·출력이 명시적인가 | `stage-*.md` + `docs/artifacts/` |
| **재현성 (반하드코딩)** | 미공개 PRD에서도 도는가 | 각 agent의 **판단 규칙** |
| **지침의 구체성** | agent 지시가 실행 가능한가 | `stage-*.md` 본문 |
| 협업의 흔적 | 팀이 실제로 나눠 일했는가 | git 커밋 히스토리 |

### 수단 vs 목표 — 헷갈리지 마세요

> **토큰·컴포넌트 재사용·의미기반 네이밍·Frame 위계·Auto Layout은 점수 항목이 아니라 위 둘을 동시에 끌어올리는 수단입니다.**
> 토큰과 컴포넌트로 저작하면 **A(일관성)** 가 오르고, 하드코딩 없이 PRD를 읽어 저작하면 **B(재현성)** 가 오릅니다.

### 실전 최적화 팁 5개 (cheatsheet 기준)

1. **Auto Layout** — 관련 자식은 반드시 board + flex로. **절대좌표 남발 금지.**
2. **네이밍** — `Card/Header/Title` 식 의미 기반. **`Board 1` 같은 기본명은 감점.**
3. **위계** — 2~4단계 깊이. 과도한 평면도, 과도한 중첩도 피합니다.
4. **토큰** — 정의하고 **`applyToken`으로 실제 적용**까지. **정의만 하고 미적용은 감점.**
5. **컴포넌트** — 반복 요소는 컴포넌트화 후 **인스턴스로 재사용.**

> 심사용 PRD는 미공개입니다. **특정 PRD 전용 스크립트는 그 자리에서 무너집니다.**

---

## 9. 협업 규칙 — 권한 매트릭스

| 행위 | 허용 | 이유 |
|---|---|---|
| 내가 맡은 단계의 agent 파일 고도화 | ✅ 자유 | 파일 소유가 1인이라 충돌 없음 |
| 내 단계용 skill 새로 생성 | ✅ 자유 | 새 파일이라 충돌 없음 |
| `penpot-design` skill 개선·확장 | ✅ 자유 (📦 스타터) | **이걸 키우는 것이 곧 순위** |
| **남이 맡은 단계 수정** | ❌ **금지** | 충돌의 1번 원인 |
| **공용 파일 수정** (`AGENTS.md`, `start/SKILL.md`) | ⚠️ **조장 승인** | 팀 전원의 에이전트 행동이 바뀜 |
| **새 단계(sub agent) 추가** | ⚠️ **조장 승인 + 팀 sync 권장** | 단계 간 입출력 계약이 바뀜 |
| `1-daangn`·`2-airbnb` Page 수정 | ❌ **금지** | 읽기 전용 |
| 남의 이름 Page에 저작 | ❌ **금지** | 실시간 협업 — 즉시 덮어씀 |
| `중간공유`·`최종제출`에서 신규 저작 | ❌ 금지 | 옮겨 담는 곳 |

**충돌은 규칙이 깨졌다는 신호입니다.** 이 레포는 "내가 맡은 단계만 수정한다"로 충돌을 막고 있습니다. conflict가 났다면 (a) 남의 단계 파일을 건드렸는지, (b) 공용 파일을 승인 없이 고쳤는지 확인하세요.

---

## 10. 작업 저장 — `/git`

```
/git 지금까지 작업내용 저장해줘
```

git을 몰라도 됩니다. skill이 전부 처리합니다.

### 절차

| # | 단계 | 내용 |
|---|---|---|
| 1 | 변경 파악 | `git status --porcelain`, `git diff`, `git diff --cached` |
| 2 | 한 문장 요약 | 파일 목록이 아니라 **무엇이 좋아졌는지** |
| 3 | **사용자 확인 (필수)** | "이 문장으로 하면 될까요?" → 확정 문장을 그대로 commit message로 |
| 4 | 커밋 | `git add -A` → `git commit -m "{확정 문장}"` |
| 5 | 푸시 | `git push origin main` — 성공하면 끝 |
| 6 | 거부되면 | `git pull --rebase origin main` → 깔끔하면 다시 push |
| 7 | conflict면 | **"조장과 동행하세요"** 안내 → 대화로 해결 → `git add` → `git rebase --continue` → push |

### 커밋 메시지 예시

- ❌ `stage-2-tokens.md 수정`
- ✅ `컬러 토큰 단계가 브랜드 컬러의 명도 단계를 스스로 만들도록 개선`

### 금지

- `main` 외의 브랜치 생성
- `git push --force` — **어떤 경우에도**
- 사용자 확인 없는 커밋

---

## 11. 지금 비어 있는 것 (해야 할 일 목록)

실측 기준으로 다음이 미완성입니다.

| # | 항목 | 현재 상태 | 막는 것 |
|---|---|---|---|
| 1 | `start/SKILL.md` 단계 표 · 실행 순서 | HTML 주석으로 비어 있음 | **하네스 자체가 안 돌아감** |
| 2 | `.claude/agents/stage-*.md` | 디렉터리 자체가 없음 | 위임할 sub agent가 없음 |
| 3 | `docs/PRD.md` | 플레이스홀더 (경고문만) | 입력이 없어 테스트 불가 |
| 4 | `docs/artifacts/` | `.gitkeep`만 | 단계 간 계약이 아직 물리적으로 없음 |
| 5 | ~~`participant-onboarding.md`~~ | ✅ 해소 — README에 트러블슈팅 표 직접 수록 | — |
| 6 | `figma-compat/README.md` | 이벤트 배포 문서(레포 밖) | 미지원 API 목록 확인 시 필요 |

### 다음에 할 일 (순서)

1. **설계 세션** — 단계를 몇 개로, 어떤 경계로 자를지 합의
2. `start/SKILL.md`의 단계 표·실행 순서 채우기 (조장이 커밋)
3. `.claude/agents/stage-*.md` 각자 작성 — 계약 4항목(§5)을 반드시 포함
4. 예시 PRD로 `/start` **엔드투엔드 1회** 실행 → `docs/artifacts/`가 채워지는지 확인
5. 결과를 자기 Page에서 → `중간공유` → `최종제출`로 옮겨 담기

---

## 12. 온보딩 체크리스트

이벤트 시작할 때 이 순서로 확인하세요.

- [ ] `npx -y @matfia/pigma-mcp` 실행됨 (`:4401`) — **창 계속 켜둠**
- [ ] 중앙 Penpot 로그인 → 팀 **`5조`** → 파일 **`작업`** 열림
- [ ] 플러그인 `http://localhost:4400/manifest.json` Install → Open → Allow
- [ ] **Connect MCP Server → ● Connected** 확인 — **탭 계속 켜둠**
- [ ] Claude Code에서 `penpot` MCP 서버 **승인 1회** 완료
- [ ] `AGENTS.md` 읽음 (규칙 원본)
- [ ] **내 작업 Page 이름 확인** (§7 표) — 남의 Page에 쓰지 않기
- [ ] `1-daangn`·`2-airbnb` Page 읽기만 — 수정 금지 인지
- [ ] 내가 맡은 단계가 무엇인지 확정됨
- [ ] `/git`으로 저장하는 방법 확인 (`main` 브랜치만, force push 금지)
