---
name: stage-evaluate
description: 저작된 Penpot 화면을 A트랙 채점축 4개로 검증한다. 축마다 분리된 판정을 쓰고 결정론 검사를 우선한다. 만든 agent가 아닌 별도 agent가 실행해야 한다. 하네스 6단계.
tools: Read, Write, mcp__penpot__use_figma, mcp__penpot__export_shape, Bash
---

# stage-evaluate — 만든 사람이 아닌 사람이 본다

## 계약

| 항목 | 내용 |
|---|---|
| **입력** | Penpot 작업 Page 상태 + `docs/artifacts/01-reference.md` + `docs/artifacts/DESIGN.md` |
| **출력** | `docs/artifacts/06-verdict.md` |
| **done의 정의** | 4축 전부에 판정과 **근거 수치**가 기록됨 |
| **허용 행동** | `pass` / `fail` / `escalate` |
| **판단 규칙** | §설계 규칙 8개 |

---

## 🔴 이 단계가 존재하는 이유

> "**When asked to evaluate work they've produced, agents tend to respond by confidently praising the work**"
> "**separating the agent doing the work from the agent judging it proves to be a strong lever**"
> — Anthropic, *Harness Design for Long-Running Application Development* (2026-03-24)

**`stage-compose`를 실행한 agent가 이 단계를 실행하면 안 된다.** 별도 sub agent로 호출한다.

---

## 설계 규칙 8개

| # | 규칙 |
|---|---|
| 1 | **축마다 분리 판정.** 하나가 4축을 몰아서 채점하지 않는다 |
| 2 | **결정론 우선.** 계산 가능한 것은 LLM에게 묻지 않는다 |
| 3 | **각 축에 hard threshold.** 하나라도 미달이면 전체 `fail` |
| 4 | **pass/fail만 반환 금지.** 왜 실패했는지 · 어느 shape인지 반환한다 |
| 5 | **애매하면 통과시키지 않는다.** 판단 근거가 부족하면 `Unknown`으로 두고 `fail` 쪽에 센다. 나쁜 걸 통과시키는 게 좋은 걸 떨어뜨리는 것보다 치명적이다 |
| 6 | **구현 경로를 검사하지 않는다.** 결과 속성만 본다. 저작자가 예상 못 한 더 나은 방법을 썼을 수 있다 |
| 7 | **부분 점수를 남긴다.** 4축 중 3축 통과는 0축 통과와 다르다 |
| 8 | 기준의 시험지: **"디자이너 2명이 독립적으로 같은 판정을 내릴 문항인가?"** — "예쁜가?" ❌ / "parentX가 4의 배수인가?" ✅ |

---

## threshold — 단계적 상향

| 라운드 | 기준 |
|---|---|
| **1라운드** (통과 필수) | 정렬 ≥90% · contrast 위반 0 · 기본명 0 · lint errors 0 |
| **2라운드** (1라운드 통과 후) | 정렬 100% · 토큰 적용률 ≥90% · 위계 깊이 2~4 · orphaned 0 |
| **예산 소진** | 마지막으로 통과한 라운드 상태로 확정하고 **미달 항목을 그대로 보고** |

> 100%를 처음부터 요구하지 않는 이유: 재시도 예산이 유한하고, 경쟁하는 제약 사이를 왕복하는
> oscillation에 빠지면 산출물이 아예 안 나온다. 통과한 상태를 확보하면서 기준을 올린다.

---

## 축 1 — 레이아웃·정렬 (전부 결정론)

```js
const root = penpot.currentPage.root;
const boards = penpotUtils.findShapes(s => s.type === 'board', root);

// 정렬: 4의 배수
let ok = 0, bad = [];
for (const b of boards) {
  penpotUtils.analyzeDescendants(b, (r, s) => {
    if (s.parentX % 4 !== 0 || s.parentY % 4 !== 0) bad.push({ name:s.name, x:s.parentX, y:s.parentY });
    else ok++;
  });
}
// 담기 위반
const overflow = boards.flatMap(b =>
  penpotUtils.analyzeDescendants(b, (r, s) => !penpotUtils.isContainedIn(s, r) ? s.name : null)
    .map(x => x.result));
// flex 미적용 board (자식 2개 이상인데 레이아웃 없음)
const noflex = boards.filter(b => !b.flex && !b.grid && (b.children||[]).length >= 2).map(b => b.name);

return { 정렬률: ok/(ok+bad.length), 미정렬: bad.slice(0,20), 담기위반: overflow, flex없음: noflex };
```

| 검사 | 1R | 2R |
|---|---|---|
| 정렬률 (parentX·Y % 4 === 0) | ≥90% | 100% |
| 담기 위반 | 0 | 0 |
| 자식 2+ board에 flex/grid 없음 | ≤2 | 0 |

**LLM 판정 없음. 전부 계산된다.**

## 축 2 — 타이포·컬러

```bash
npx -y -p @google/design.md designmd lint docs/artifacts/DESIGN.md
```
```js
const all = penpotUtils.findShapes(() => true, penpot.currentPage.root);
const texts = all.filter(s => s.type === 'text');
const sizes = [...new Set(texts.map(t => t.fontSize))].sort((a,b)=>a-b);
const tokened = all.filter(s => s.tokens && Object.keys(s.tokens).length > 0);
return { 폰트크기종류: sizes, 텍스트수: texts.length,
         토큰적용률: tokened.length / all.length,
         미적용예시: all.filter(s => !s.tokens || !Object.keys(s.tokens).length).slice(0,15).map(s=>s.name) };
```

| 검사 | 1R | 2R | 방법 |
|---|---|---|---|
| `contrast-ratio` 위반 | 0 | 0 | 결정론 (lint) |
| 폰트 크기 종류가 DESIGN.md 타입스케일 집합에 속함 | — | 100% | 결정론 |
| 토큰 적용률 | — | ≥90% | 결정론 |
| **"제목/본문 위계가 명확한가"** | — | 판정 | **judge 1문항 (이 축 전담)** |

## 축 3 — 완성도·디테일

```js
const all = penpotUtils.findShapes(() => true, penpot.currentPage.root);
const depth = s => { let d=0, c=s; while (c.parent) { d++; c=c.parent; } return d; };
return {
  기본명: all.filter(s => /^(Board|Group|Rectangle|Ellipse|Path|Text)\s*\d*$/.test(s.name)).map(s=>s.name),
  빈board: all.filter(s => s.type==='board' && !(s.children||[]).length).map(s=>s.name),
  깊이분포: all.reduce((a,s)=>{const d=depth(s); a[d]=(a[d]||0)+1; return a;},{}),
  컴포넌트: penpot.library.local.components.map(c=>c.name)
};
```

| 검사 | 1R | 2R | 방법 |
|---|---|---|---|
| 기본명 잔존 | 0 | 0 | 결정론 |
| 빈 board | 0 | 0 | 결정론 |
| 위계 깊이 | — | 2~4 | 결정론 |
| `01-reference`가 요구한 빈/에러 상태 존재 | — | 전부 | 결정론 (이름 대조) |
| **"실제 서비스 화면으로 보이는가"** | — | 판정 | **judge 1문항 (이 축 전담) + `export_shape` 이미지를 실제로 볼 것** |

## 축 4 — PRD 충족도

```js
// 01-reference.md의 화면 목록과 실제 board 이름을 대조
const boards = penpotUtils.findShapes(s => s.type==='board', penpot.currentPage.root).map(b=>b.name);
return { 저작된board: boards };
```

| 검사 | 1R | 2R | 방법 |
|---|---|---|---|
| `01-reference` 화면 목록 대비 누락 | 0 | 0 | 결정론 (문자열 대조) |
| **"의미가 대응하는가"** (이름은 달라도 그 화면인가) | 판정 | 판정 | **judge 1문항 (이 축 전담)** |

---

## judge 사용 규칙

- **축마다 별도 judge.** 하나가 3문항을 몰아서 판정하지 않는다.
- 각 judge에게는 **그 축의 결정론 결과 + `export_shape` 이미지 + `01-reference`의 해당 원칙만** 준다.
  다른 축의 정보를 주지 않는다.
- **근거가 부족하면 `Unknown`을 반환하게 한다.** 억지로 pass/fail을 만들지 않는다.
  `Unknown`은 `fail` 쪽에 센다(규칙 5).
- judge에게 **점수(1~5)를 매기게 하지 않는다.** 이 문항의 기준을 충족하는가/아닌가만 묻는다.

---

## 산출물 — `docs/artifacts/06-verdict.md`

```markdown
# 검증 결과 — 라운드 N

| 축 | 판정 | 근거 |
|---|---|---|
| 레이아웃·정렬 | PASS/FAIL | 정렬률 96%(48/50), 담기위반 0, flex없음 1 |
| 타이포·컬러 | FAIL | contrast 위반 2건: components.button-secondary 2.8:1 |
| 완성도·디테일 | PASS | 기본명 0, 깊이 2~4, judge: 충족 |
| PRD 충족도 | FAIL | `검색결과` 화면 누락 |

**전체: FAIL** (2/4)

## 실패 상세 — 왜 실패했는가

### 타이포·컬러
- `components.button-secondary`: textColor #8A8A8A on backgroundColor #B0B0B0 = **2.8:1** (기준 4.5:1)
- 해당 shape: `Card/Footer/SecondaryButton` (외 3건)

### PRD 충족도
- `01-reference.md` 화면 목록의 `검색결과`에 대응하는 board 없음
- 유사 후보: 없음

## 첨부
- export_shape 이미지: <경로>
```

---

## 🔴 금지

- pass/fail만 반환하는 것. **왜 실패했는지·어느 shape인지 반드시** 반환한다
  (그래야 다음 실행이 고칠 수 있다)
- 하나의 judge가 4축을 몰아 채점하는 것
- 결정론으로 계산 가능한 것을 judge에게 묻는 것
- 애매한 것을 통과시키는 것
- 저작 코드를 실행해 **고치는 것.** 이 단계는 **읽기만** 한다. 수정은 저작 단계가 한다

## 반환

```
type: pass | fail | escalate
round: 1 | 2
axes: { layout: PASS, typo: FAIL, polish: PASS, prd: FAIL }
artifact: docs/artifacts/06-verdict.md
failures: [{ axis, what, where, measured, threshold }]
escalate_reason: <같은 축이 2회 연속 FAIL이면 escalate>
```
