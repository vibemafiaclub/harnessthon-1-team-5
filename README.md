# 하네스톤 1회차 — 팀 작업 레포

2026-08-01 · VIBE MAFIA CLUB

**PRD → Penpot 디자인**을 만드는 하네스를 팀으로 제작합니다.

시작하기 전에 [`AGENTS.md`](./AGENTS.md)를 읽으세요. 규칙이 거기 있습니다.

## 어디가 내 컴퓨터이고 어디가 서버인가

> 헷갈리기 쉬운 부분이라 먼저 읽으세요.

| 구성 | 위치 | 주소 |
|---|---|---|
| MCP 서버 | **내 노트북** (내가 직접 띄움) | `http://localhost:4401` |
| Penpot 플러그인 | **내 브라우저** | `http://localhost:4400/manifest.json` |
| **Penpot 본체** | **VMC 중앙 서버** (원격) | **https://penpot.tail45121d.ts.net** |

즉 **`localhost`가 나오는 건 전부 내 컴퓨터 것이 맞습니다.** Penpot만 원격입니다.
저작 코드는 내 브라우저에서 실행되고, 결과는 중앙 Penpot의 내 파일에 저장됩니다.

```
[내 하네스] --http--> [내 노트북 MCP :4401] <--WS-- [내 브라우저 플러그인]
                                                          |
                                            [중앙 Penpot (원격)]
```

## 빠른 시작

```bash
# 1. 로컬 MCP 실행 (이 창은 이벤트 내내 켜둡니다)
npx -y @matfia/pigma-mcp
```

**2. 중앙 Penpot 접속 → 로그인 → 팀 `5조`의 `작업` 파일 열기**

- https://penpot.tail45121d.ts.net ⚠️ (운영 문서는 `sumin-macmini.tail45121d.ts.net` — 아래 참고)
- 아이디 = 신청 시 적은 이메일 / 비밀번호 = **이메일 앞부분 + `123`** (예: `hong@gmail.com` → `hong123`)
- 새 파일을 만들지 **마세요.** 팀 목록에서 **`5조`** → 파일 **`작업`** 을 엽니다
- 확인 신호: Page 목록에 **기존 디자인 Page**(`1-daangn`·`2-airbnb`)와 **내 이름 Page**가 보인다

> ⚠️ **주소·Page 이름이 운영 문서와 어긋나 있고 아직 실측 확인이 안 됐습니다.**
> 한쪽이 안 열리면 다른 쪽을 시도하고, 확인되는 대로 이 문서와 `AGENTS.md`를 고쳐 주세요.
> 자세한 내용은 [`AGENTS.md`](./AGENTS.md)의 Penpot 절을 보세요.

**3. 브라우저에서 플러그인 설치·연결**

- 에디터 툴바의 **플러그인 아이콘(퍼즐)** 클릭
- "Write a plugin URL"에 `http://localhost:4400/manifest.json` 입력 → **Install**
- **Open** → 권한 **Allow** → **Connect MCP Server** → **● Connected** 확인
- ⚠️ 이 탭은 켜둡니다. 닫으면 연결이 끊깁니다.

MCP 등록은 `.mcp.json`에 이미 들어 있어 따로 할 것이 없습니다.
(하네스를 처음 띄울 때 `penpot` 서버 승인만 눌러주세요.)

## 막혔을 때 (실제로 자주 나오는 것들)

| 증상 | 답 |
|---|---|
| 플러그인 패널이 비어 있다 | **정상.** iframe 로딩 전입니다. 몇 초 뒤 `CONNECT MCP SERVER`가 뜹니다 |
| — | ⚠️ **`localhost:4400`을 주소창에 직접 열지 마세요.** 그 탭이 MCP 연결을 **가로챕니다.** 반드시 **Penpot 안에서** 여세요 |
| — | ⚠️ **`npx`를 두 번 실행하지 마세요.** `EADDRINUSE :4400`으로 죽습니다. 이미 떠 있으면 그 창을 씁니다 |
| `Missing userToken` | 중앙 통합 플러그인을 깐 것입니다. **`localhost:4400`** 것을 설치하세요 |
| 연결이 끊긴다 | **브라우저 탭과 npx 창을 둘 다** 켜둬야 합니다 |
| 버전 경고 | 떠도 동작합니다. 무시하세요 |
| `corepack: command not found` | `npm i -g pnpm` |
| 빌드스크립트 차단 | `.npmrc`에 `dangerously-allow-all-builds=true` |
| `localhost:9001`이 안 열림 | 그 주소가 아닙니다. 공개 URL(`ts.net`)로 접속하세요 |

## 예시 PRD

개발용 예시 PRD 2종이 [`docs/examples/`](./docs/examples/)에 들어 있습니다.

```bash
cp docs/examples/daangn-stock.md docs/PRD.md    # 당근마켓 → 증권
cp docs/examples/airbnb-dating.md docs/PRD.md   # Airbnb → 소개팅
```

**둘 다 돌려보세요.** 하나에서만 돌아가는 하네스는 심사용(미공개) PRD에서 무너집니다.

## 단계가 확정되면 (조장)

```
/scaffold-harness 우리 조 단계 이거야: ①... ②... ③...
```

`start`의 실행 순서와 `.claude/agents/stage-*.md` 초안이 한 번에 생성됩니다.

## 프로젝트 문서 구조

```
context/       ← 프로젝트 배경, 타겟 유저, 목표
policy/        ← 기능/스토리 단위 디자인 정책 (당근, airbnb, 최종)
design/        ← 디자인 시스템 (토큰, 컴포넌트, 아이콘, 보이스, 레이아웃)
decision/      ← 의사결정 로그
develop/       ← 개발 산출물
```

| 디렉토리 | 핵심 산출물 |
|---|---|
| [`context/`](./context/) | strategy, user, stakeholder, product, architecture(mermaid), workflow |
| [`policy/`](./policy/) | 기능 단위 정책 — 당근/airbnb/최종 PRD별 |
| [`design/`](./design/) | token, component, iconography, voice, layout (각 300줄 이내) |
| [`decision/`](./decision/) | 의사결정 근거 로그 (선택적) |
| [`develop/`](./develop/) | 스크립트, 로그, 생성 산출물 |

## 작업 저장

```
/git 지금까지 작업내용 저장해줘
```
