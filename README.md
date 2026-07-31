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
| **Penpot 본체** | **VMC 중앙 서버** (원격) | **https://sumin-macmini.tail45121d.ts.net** |

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

**2. 중앙 Penpot 접속 → 로그인 → 디자인 파일 생성**

- https://sumin-macmini.tail45121d.ts.net (계정은 개별 지급)
- 새 디자인 파일 생성 → 에디터 진입

**3. 브라우저에서 플러그인 설치·연결**

- 에디터 툴바의 **플러그인 아이콘(퍼즐)** 클릭
- "Write a plugin URL"에 `http://localhost:4400/manifest.json` 입력 → **Install**
- **Open** → 권한 **Allow** → **Connect MCP Server** → **● Connected** 확인
- ⚠️ 이 탭은 켜둡니다. 닫으면 연결이 끊깁니다.

MCP 등록은 `.mcp.json`에 이미 들어 있어 따로 할 것이 없습니다.
(하네스를 처음 띄울 때 `penpot` 서버 승인만 눌러주세요.)

막히면 `participant-onboarding.md`의 트러블슈팅을 보세요.

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

## 작업 저장

```
/git 지금까지 작업내용 저장해줘
```
