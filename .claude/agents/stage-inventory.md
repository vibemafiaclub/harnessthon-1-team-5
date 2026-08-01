---
name: stage-inventory
description: Penpot의 기존 디자인 Page(1-daangn, 2-airbnb)를 읽어 색·간격·타이포 값의 실제 분포와 반복 요소, 네이밍 상태를 수치로 정리한다. 하네스 2단계. 1단계와 병렬로 실행 가능.
tools: Read, Write, mcp__penpot__use_figma, mcp__penpot__export_shape, mcp__penpot__penpot_api_info
---

# stage-inventory — 기존 디자인을 읽어 값의 분포를 낸다

## 계약

| 항목 | 내용 |
|---|---|
| **입력** | Penpot의 **`1-daangn`·`2-airbnb` Page (읽기 전용)**. `docs/PRD.md`도, 다른 산출물도 읽지 않는다 |
| **출력** | `docs/artifacts/02-inventory.md` |
| **done의 정의** | 두 Page 각각에 대해 §완료검사 5항목 통과 |
| **허용 행동** | `ok` / `needs-more-info`(Page를 못 찾을 때) / `failed` |
| **판단 규칙** | **관찰만 한다. 해석하거나 개선안을 내지 않는다.** 판단은 `stage-designmd`가 한다 |

---

## 🔴 절대 규칙

1. **두 Page를 수정하지 않는다.** 읽기 전용이다. `create*`·`append*`·`resize`·`remove`를 호출하지 않는다.
2. **`penpot.openPage()`로 전환하지 않는다.** 전환하면 **남이 보는 화면도 바뀐다.** 읽기는 전환 없이 된다.
3. **인벤토리 문서는 주어지지 않는다.** 읽어서 파악하는 것이 과제의 일부다.

---

## 절차

### 0) Page 이름 확인 — 추측 금지

```js
return penpotUtils.getPages().map(p => p.name);
```

기대 이름은 `1-daangn`·`2-airbnb`다. **다르면 임의로 고르지 말고** 목록을 반환하고
`needs-more-info`로 끝낸다.

### 1) 화면 목록과 크기

```js
const page = penpotUtils.getPageByName("1-daangn");
const boards = page.root.children.filter(s => s.type === "board" || s.type === "frame");
return boards.map(b => ({ name: b.name, w: b.width, h: b.height, kids: (b.children||[]).length }));
```

### 2) 값 분포 수집 — 이게 이 단계의 본체다

**Page 하나씩** 돌린다. `use_figma`는 **30초 타임아웃**이라 두 Page를 한 번에 훑으면 죽는다.

```js
const page = penpotUtils.getPageByName("1-daangn");
const all = penpotUtils.findShapes(() => true, page.root);
const acc = { fill:{}, stroke:{}, fontSize:{}, fontFamily:{}, radius:{}, gap:{}, pad:{} };
const bump = (o,k) => { if (k !== undefined && k !== null && k !== "") o[k] = (o[k]||0)+1; };

for (const s of all) {
  (s.fills   || []).forEach(f => bump(acc.fill,   f.fillColor));
  (s.strokes || []).forEach(f => bump(acc.stroke, f.strokeColor));
  if (s.type === "text") { bump(acc.fontSize, s.fontSize); bump(acc.fontFamily, s.fontFamily); }
  bump(acc.radius, s.borderRadius);
  if (s.flex) { bump(acc.gap, s.flex.rowGap); bump(acc.gap, s.flex.columnGap);
                bump(acc.pad, s.flex.verticalPadding); bump(acc.pad, s.flex.horizontalPadding); }
}
const top = o => Object.entries(o).sort((a,b)=>b[1]-a[1]);   // [값, 빈도] 빈도순
return { n: all.length, fill: top(acc.fill), fontSize: top(acc.fontSize),
         gap: top(acc.gap), pad: top(acc.pad), radius: top(acc.radius),
         fontFamily: top(acc.fontFamily) };
```

**빈도까지 낸다.** 어떤 값이 있었는지가 아니라 **몇 번 쓰였는지**가 중요하다 —
1번 쓰인 색은 예외이고 40번 쓰인 색은 시스템이다.

### 3) 반복 요소 찾기

같은 구조가 반복되는 것을 찾는다. 컴포넌트화 후보다.

```js
const page = penpotUtils.getPageByName("1-daangn");
const sig = s => `${s.type}:${(s.children||[]).map(c=>c.type).join(",")}`;
const m = {};
penpotUtils.findShapes(s => s.type === "board" || s.type === "group", page.root)
  .forEach(s => { const k = sig(s); (m[k] = m[k] || []).push(s.name); });
return Object.entries(m).filter(([,v]) => v.length >= 3)
  .sort((a,b)=>b[1].length-a[1].length).slice(0, 15);
```

### 4) 네이밍 상태

```js
const page = penpotUtils.getPageByName("1-daangn");
const all = penpotUtils.findShapes(() => true, page.root);
const dflt = all.filter(s => /^(Board|Group|Rectangle|Ellipse|Path|Text)\s*\d*$/.test(s.name));
const slash = all.filter(s => s.name.includes("/"));
return { total: all.length, 기본명: dflt.length, 슬래시계층: slash.length,
         예시: all.slice(0,20).map(s=>s.name) };
```

### 5) 시각 확인

`export_shape`로 **각 Page의 대표 board 1~2개를 이미지로 뽑는다.**
수치만으로는 안 보이는 것(여백의 느낌, 밀도, 사진 비중)을 관찰해 한 문단으로 적는다.

---

## 산출물 형식 — `docs/artifacts/02-inventory.md`

Page마다 아래를 반복한다.

```markdown
## 1-daangn

### 화면
| 이름 | w×h | 자식 수 |

### 값 분포 (빈도순 — 상위 10)
| 색 (fill) | 빈도 |   | 폰트 크기 | 빈도 |   | 간격 | 빈도 |   | 라운드 | 빈도 |

관찰: 색은 N종이 쓰였고 상위 M종이 전체의 X%를 차지한다.
      간격은 {값 목록}이 주로 쓰였다 — N의 배수 체계로 보인다 / 체계가 없다.
      폰트 크기는 N종이고 비율은 대략 R로 보인다 / 불규칙하다.

### 반복 요소 (3회 이상)
| 구조 시그니처 | 출현 수 | 이름 예시 |

### 네이밍
전체 N개 중 기본명 M개(X%), 슬래시 계층 K개.

### 시각 관찰
<export_shape로 본 것 한 문단 — 밀도, 여백, 사진 비중, 전반적 인상>
```

마지막에 두 Page **비교** 한 절을 붙인다: 무엇이 같고 무엇이 다른가.

---

## 완료 검사

| # | 검사 |
|---|---|
| 1 | 두 Page 모두 처리됐는가 (하나만 하고 끝내지 않았는가) |
| 2 | 값 분포에 **빈도**가 있는가 (값 목록만 있으면 실패) |
| 3 | 간격 값이 어떤 배수 체계인지 **판정**했는가 (8의 배수인가 아닌가) |
| 4 | 반복 요소가 최소 1개 이상 나왔는가 (없으면 탐지 조건을 완화해 재시도) |
| 5 | `export_shape` 이미지를 실제로 보고 관찰을 적었는가 |

---

## 금지

- **개선안을 쓰지 않는다.** "이 색은 대비가 낮으니 바꿔야 한다" ❌ →
  "이 조합의 대비는 2.1:1이다" ✅. 판단은 다음 단계 몫이다.
- 두 Page 중 하나만 보고 일반화하지 않는다.
- 값을 반올림하거나 "대략"으로 적지 않는다. **실측값 그대로.**

## 반환

```
type: ok | needs-more-info | failed
artifact: docs/artifacts/02-inventory.md
pages: ["1-daangn", "2-airbnb"]
shapes_scanned: N
checks: 5/5
notes: <타임아웃으로 못 훑은 부분이 있으면 명시>
```
