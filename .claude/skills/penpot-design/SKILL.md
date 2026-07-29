---
name: penpot-design
description: PRD로부터 디자인 토큰·컴포넌트 라이브러리와 화면을 use_figma(MCP)로 저작한다. Figma API(figma.*)를 그대로 사용. "디자인 만들어줘", "PRD 디자인", "figma 저작", "토큰/컴포넌트 세팅" 등에 트리거.
---

# penpot-design

PRD를 입력받아 **토큰 → 컴포넌트 → 화면** 순으로 저작한다. `use_figma` MCP 툴로 코드를 실행하며, 코드 안에서 **`figma.*`(Figma Plugin API)**를 쓴다. (엔진은 Penpot이지만 인터페이스는 Figma로 통일. `penpot.*`도 병행 가능.)

## 사전조건
- Figma-호환 MCP 실행 중(운영자 배포) + 브라우저 Penpot 플러그인 Connected + `claude mcp add --transport http penpot http://localhost:4401/mcp`.
- 지원 `figma.*` 부분집합·미지원 목록: 이벤트 `figma-compat/README.md`. 미지원 호출은 명확한 에러로 안내됨 → 그때 `penpot.*`로 대체.

## 🔴 STEP 0 — 작업할 Page를 먼저 확정한다 (건너뛰기 금지)

**조 작업 파일에는 팀원 수 + 2개의 Page가 있다.** 각자 자기 이름 Page에서 작업하고,
`중간공유`·`최종제출`은 공용이다. **엉뚱한 Page에 저작하면 남의 작업 위에 그린다.**
Penpot은 실시간 협업이라 그 즉시 상대 화면에 반영되고, 되돌리기가 서로 꼬인다.

> **작업할 Page 이름이 명확히 정해지지 않았다면 저작을 시작하지 않는다.**
> Page 목록을 보여주고 사용자에게 "이 중 어디에 작업할까요?"를 물어본 뒤,
> 답을 받고 나서만 진행한다. 추측해서 고르지 않는다. 기본값으로 첫 Page를 쓰지 않는다.

```js
// 현재 파일의 Page 목록과 현재 선택된 Page 확인
return {
  current: penpot.currentPage.name,
  pages: penpot.currentFile.pages.map(p => p.name)
};
```

확정된 뒤 그 Page로 전환하고, **전환됐는지 확인한 다음** 저작한다.

```js
const target = "홍길동";               // ← 사용자가 확정해준 이름
const p = penpot.currentFile.pages.find(x => x.name === target);
if (!p) return { error: "그런 Page 없음", pages: penpot.currentFile.pages.map(x => x.name) };
penpot.openPage(p);
return { switched: penpot.currentPage.name };
```

**이런 상황이면 반드시 되묻는다:**

| 상황 | 행동 |
|---|---|
| 사용자가 Page를 말하지 않음 | 목록 보여주고 질문 → 답 대기 |
| 지정한 이름이 목록에 없음 | 유사한 후보와 함께 되묻는다. 임의로 만들지 않는다 |
| `중간공유`·`최종제출`에 쓰라고 지시받음 | 공용 Page임을 알리고 한 번 더 확인받는다 |
| 하네스를 무인 실행 중 | Page 이름을 **인자로 받아야** 한다. 없으면 즉시 중단하고 요구한다 |

`중간공유`·`최종제출`은 결과를 **옮겨 담는** 곳이다. 여기서 처음부터 저작하지 않는다.

## 🔴 기존 파일은 같은 파일의 `기존파일` Page에 있다

**하네스는 "지금 열려 있는 파일" 밖을 볼 수 없다.** Penpot Plugin API에는 파일을 여는
수단이 없다 — `penpot.openFile` · `penpot.getFile` · `penpot.files` 전부 **undefined**다.

그래서 과제의 기존 파일은 **별도 파일이 아니라 작업 파일 안의 `기존파일` Page**로 들어 있다.
같은 파일이므로 자유롭게 읽을 수 있다.

```js
// 기존파일 Page의 화면들을 읽는다 (Page 전환 없이도 읽힌다)
const src = penpot.currentFile.pages.find(p => p.name === "기존파일");
const boards = src.root.children.filter(s => s.type === "board" || s.type === "frame");
return boards.map(b => ({
  name: b.name, w: b.width, h: b.height,
  children: (b.children || []).length
}));
```

- 전체 트리를 훑을 때는 `penpotUtils.findShapes(pred)` 를 쓴다 — 인자 없이 부르면
  **파일의 모든 Page**를 순회한다(공식 유틸).
- 읽기만 할 때는 `penpot.openPage()`로 전환하지 않아도 된다. **전환하면 남이 보는 화면도 바뀐다.**
- ⚠️ **`기존파일` Page를 수정하지 않는다.** 읽기 대상이다. 정규화 결과는 **자기 Page**에 만든다.

읽어야 할 것: 화면 목록·크기 / 반복되는 요소 / 색 계열 / 간격·타이포 값의 분포 / 네이밍 상태.
**인벤토리 문서는 주어지지 않는다. 읽어서 파악하는 것이 과제의 일부다.**

## 절차
1. **토큰 먼저**: 색/간격/타이포/라운드를 `figma.variables.createVariableCollection`+`createVariable`.
2. **컴포넌트**: 반복요소를 `figma.createFrame()`(+autolayout) → `figma.createComponent(frame)`.
3. **화면 조립**: 컴포넌트 인스턴스를 autolayout 프레임에 배치, 위계·네이밍 정리.
4. **자기점검**: 위계/토큰/컴포넌트 조회로 검증(`penpot.*` 읽기 병행 가능).

## 채점 축 (최적화 목표) — 2트랙

**A. 디자인 완성도 — 전 참가자 채점, 4항목 × 1~5점 → TOP 3**
화면만 보고 판단되는 것들이다. 저작 결과가 여기서 평가된다.

| 항목 | 5점 기준 |
|---|---|
| 레이아웃·정렬 | 그리드·여백이 일관되고 정렬이 맞다 |
| 타이포·컬러 | 제목/본문 위계가 명확하고 색이 조화롭다 |
| 완성도·디테일 | 실제 서비스 화면이라 해도 믿을 만하다 |
| PRD 충족도 | PRD가 요구한 화면·요소가 전부 있다 |

**B. 하네스 설계 완성도 — 심사위원(DRI) 채점, 5항목 → Best 1 (TOP 3 제외 후 선정)**
단계 분할의 타당성 · 단계 간 계약의 명료성 · **재현성(반하드코딩)** ·
**지침의 구체성** · 협업의 흔적.

> **토큰·컴포넌트 재사용·의미기반 네이밍·Frame 위계·Auto Layout은 점수 항목이 아니라
> 위 둘을 동시에 끌어올리는 수단이다.** 토큰과 컴포넌트로 저작하면 A(일관성)가 오르고,
> 하드코딩 없이 PRD를 읽어 저작하면 B의 재현성이 오른다.
> 심사용 PRD는 미공개다 — 특정 PRD 전용 스크립트는 그 자리에서 무너진다.

## API 스니펫
`cheatsheet.md` 참조 (figma.* autolayout/변수/컴포넌트 실증 코드 + penpot.* 대응).

## use_figma 규칙
함수 본문처럼 작성 → `return`으로 결과. console.log 반환 안 됨. 10연산 이하로 쪼개 점진 실행+검증. 실패 시 에러 읽고 수정 후 재시도.
