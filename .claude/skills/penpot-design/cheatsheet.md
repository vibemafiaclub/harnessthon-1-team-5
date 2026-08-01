# Figma-호환 퀵레퍼런스 (use_figma 안에서 figma.*)

> 이벤트는 Figma 인터페이스로 통일됨. 아래 `figma.*`가 Penpot으로 번역돼 저작됨(실증). 미지원은 에러로 안내 → `penpot.*` 대체.

```js
// 프레임 + Auto Layout
const card = figma.createFrame(); card.name='Card'; card.resize(320,200);
card.layoutMode='VERTICAL';           // 'HORIZONTAL' | 'VERTICAL'
card.itemSpacing=12;
card.paddingLeft=16; card.paddingRight=16; card.paddingTop=16; card.paddingBottom=16;
card.primaryAxisAlignItems='MIN';     // MIN|CENTER|MAX|SPACE_BETWEEN
card.counterAxisAlignItems='CENTER';
card.layoutSizingHorizontal='FIXED';  // HUG|FIXED (FILL은 FIXED 폴백)
card.layoutSizingVertical='HUG';

const header = figma.createFrame(); header.name='Card/Header'; header.layoutMode='HORIZONTAL';
card.appendChild(header);
const title = figma.createText('제목'); title.name='Card/Header/Title'; header.appendChild(title);

// 디자인 토큰(= Figma Variables)
const col = figma.variables.createVariableCollection('theme');
const primary = figma.variables.createVariable('color/primary', col, 'COLOR'); // '/'→'.' 자동
// primary.setValueForMode(mode, {r,g,b})  // 값 갱신 지원(RGB→hex)

// 컴포넌트
const comp = figma.createComponent(card);
```

**지원 부분집합/미지원 상세**: 이벤트 `figma-compat/README.md`. 아래는 엔진(Penpot) 네이티브 API — fallback/심화용.

---

---
author_id: choesumin
created_at: 2026-07-27T00:00:00+09:00
status: draft
project: harnessthon-1
project_docs_id: penpot-api-cheatsheet
---

# Penpot Plugin API 치트시트 (execute_code용)

> `execute_code` 툴 안에서 `penpot` 전역으로 실행. 아래는 실서버 검증된 스니펫.
> 코드는 함수 본문처럼 취급 → `return`으로 결과 반환. `storage` 객체에 중간결과 저장 가능.
> 상세는 `penpot_api_info({type,member})` / 개요는 `high_level_overview`.

## 기본 규칙
- 반환: `return {...}` (JSON 직렬화 자동). `console.log`는 반환 안 됨.
- 색상: hex 문자열(`'#4f46e5'`) 또는 fill 객체. 토큰은 문자열 value.
- 좌표/크기: `shape.resize(w,h)`, `shape.x/y` 직접 쓰기 가능.

## Board(=Frame) + Auto Layout(flex)
```js
const b = penpot.createBoard(); b.name='Card'; b.resize(320,200);
const fl = b.addFlexLayout();       // FlexLayout
fl.dir = 'column';                  // 'row' | 'column'
fl.rowGap = 12; fl.columnGap = 8;
fl.horizontalPadding = 16; fl.verticalPadding = 16;
fl.alignItems = 'center';           // start|center|end
fl.justifyContent = 'center';       // start|center|end|space-between|...
b.horizontalSizing = 'fix';         // 'fix'(고정) | 'auto'(HUG)
b.verticalSizing = 'auto';
// 자식 추가 (append 후 sizing)
const t = penpot.createText('Title'); t.name='Card/Title'; b.appendChild(t);
```
- Grid는 `b.addGridLayout()`.
- 중첩: board 안에 board를 appendChild 하고 각자 addFlexLayout.

## 디자인 토큰

### 🔴 침묵 실패 3종 — 모르면 "만들었는데 아무 일도 안 일어난다"

| # | 함정 | 대응 |
|---|---|---|
| 1 | **비활성 set의 토큰은 적용되지 않는다** ("Only active sets affect shapes") | `addSet` 직후 **무조건** `if (!set.active) set.toggleActive();` |
| 2 | **토큰 적용은 비동기다** ("Application is asynchronous") | 적용 후 **~100ms 대기** 뒤에 검증. 안 하면 자기검증이 거짓 실패 |
| 3 | **`Group`에는 토큰을 적용할 수 없다** ("not to groups") | 반복요소는 `Group`이 아니라 **`Board`** 로 만든다 |

```js
const cat = penpot.library.local.tokens;              // TokenCatalog
const set = cat.addSet({name:'core'});                // TokenSet
if (!set.active) set.toggleActive();                  // ★함정1

set.addToken({type:'color',  name:'color.primary', value:'#4F46E5'});  // hex는 대문자
set.addToken({type:'number', name:'space.base',    value:'8'});
set.addToken({type:'spacing',name:'space.md',      value:'{space.base} * 2'});  // ★수식
set.addToken({type:'color',  name:'color.accent',  value:'{color.primary}'});   // ★참조
// 테마: cat.addTheme('mode', 'light')
```

### 수식과 참조 — 재현성의 핵심

- 참조: `{token.name}` / 수식: `{space.base} * 2`, `{space.base} * 1.5`
- ⚠️ **연산자 앞뒤에 공백 필수.** `8*8` ❌ / `8 * 8` ✅
- ⚠️ 참조는 **대소문자 구분**
- → `space.base` 하나만 바꾸면 전체 리듬이 재계산된다. **숫자 목록 하드코딩 금지.**

### set 순서 = 우선순위 (CSS 캐스케이딩)

동명 토큰이 있으면 **마지막 set이 앞을 덮는다.** 그래서 `core` → `semantic` → `brand` 3층으로 만들면
브랜드 교체가 마지막 set 하나만 갈아끼우는 일이 된다.

### 전체 TokenType

`color` `dimension` `spacing` `sizing` `rotation` `opacity` `borderRadius` `borderWidth`
`fontFamilies` `fontSizes` `fontWeights` `letterSpacing` `textCase` `textDecoration`
`typography`(composite) `shadow`(composite)

### 적용과 증명

```js
shape.applyToken(token, ['fill']);        // TokenProperty[] — 'all' | 'fill' | 'strokeColor'
                                          // | 'rowGap','columnGap','paddingLeft'... | 'fontSize' | ...
token.applyToShapes(shapes, ['fill']);

// ★적용됐는지 증명 (채점 "정의만 하고 미적용 시 감점" 대응)
shape.tokens                              // => { fill: "color.primary", rowGap: "space.md" }
penpotUtils.tokenOverview()               // set 이름 → 타입 → 토큰 이름 목록
```

---

## 🔴 penpotUtils — 검증·교정 유틸 (직접 구현하지 말 것)

```js
penpotUtils.getPages()                    // [{id, name}]
penpotUtils.getPageByName(name)           // Page | null   ← find()보다 안전
penpotUtils.shapeStructure(root, 3)       // {id,name,type,children,layout} — 위계·네이밍 검사
penpotUtils.findShapes(pred, root)        // root 생략 시 전 Page 순회
penpotUtils.isContainedIn(shape, box)     // 담기 위반 검출
penpotUtils.setParentXY(shape, x, y)      // parentX/Y는 읽기전용이라 이걸 써야 함
```

### ★ `addFlexLayout` — 자식이 있으면 반드시 penpotUtils 쪽을 써라

```js
penpotUtils.addFlexLayout(container, dir);   // ✅ 기존 자식의 시각 순서를 보존
// board.addFlexLayout();                    // ❌ 자식이 있으면 순서가 임의로 재배열된다
```

### ★ `analyzeDescendants` — 검사와 교정을 한 패스로

```js
// 4의 배수 정렬 검사 + 자동 교정 (8pt 그리드의 하프스텝)
const fixes = penpotUtils.analyzeDescendants(board, (root, shape) => {
  if (shape.parentX % 4 !== 0)
    return () => penpotUtils.setParentXY(shape, Math.round(shape.parentX/4)*4, shape.parentY);
});
fixes.forEach(f => f.result());

// 담기 위반 수집
const bad = penpotUtils.analyzeDescendants(board, (root, s) =>
  !penpotUtils.isContainedIn(s, root) ? 'outside-bounds' : null);
```

evaluator는 이걸로 **결정론 채점**을 한다. 미학 판정을 LLM에게 묻기 전에 여기서 걸러라.

---

## 🔴 기타 실측 주의

| 항목 | 주의 |
|---|---|
| 색 | **hex 대문자만** (`#FF5533`). 소문자 쓰지 말 것 |
| 크기 | `width`/`height`는 **읽기 전용** → `resize(w,h)` |
| fills/strokes | 배열 **내용도 읽기 전용** → 배열을 통째로 교체 |
| Text | `resize()`가 `growType`을 `fixed`로 바꾼다 → `'auto-width'`/`'auto-height'`로 되돌릴 것. 크기는 `fontSize`로 |
| 실행 | `use_figma`는 **30초 타임아웃**. 큰 작업은 쪼갤 것 |
| 시각 확인 | `export_shape` 툴로 이미지를 뽑아 **직접 볼 수 있다** |
| CSS 추출 | `penpot.generateStyle(shapes,{type:'css',withChildren:true})` — 토큰 밖 매직넘버 탐지용 |

## 컴포넌트 / 라이브러리
```js
const comp = penpot.library.local.createComponent([board]); // 보드를 컴포넌트화
// 인스턴스: comp.instance() 로 재사용
penpot.library.local.components   // 로컬 컴포넌트 목록
```

## 텍스트
```js
const txt = penpot.createText('Hello'); txt.name='Label';
// 폰트/크기 등은 penpot_api_info({type:'Text'}) 참조
```

## 조회/검증 (하네스 자기점검용)
```js
// 현재 페이지 위계
return penpot.currentPage.root.children.map(s=>({name:s.name,type:s.type,kids:s.children?.length??0}));
// 토큰/컴포넌트 요약
return { tokenSets: penpot.library.local.tokens.sets.map(s=>({name:s.name,n:s.tokens.length})),
         components: penpot.library.local.components.map(c=>c.name) };
```

## 심사 최적화 팁 (채점 6축과 직결)
1. **Auto Layout**: 관련 자식은 반드시 board+flex로. 절대좌표 남발 금지.
2. **네이밍**: `Card/Header/Title` 식 의미 기반. `Board 1` 같은 기본명 금지(감점).
3. **위계**: 2~4단계 깊이로 정리(과도한 평면/과도한 중첩 회피).
4. **토큰**: 색·간격·타이포를 토큰으로 정의하고 **applyToken으로 실제 적용**(정의만 하고 미적용 감점).
5. **컴포넌트**: 반복 요소는 컴포넌트화 후 **인스턴스로 재사용**.

## 아이콘 (양쪽 동일 동작 실증)
아이콘은 **SVG 문자열 → `figma.createNodeFromSvg(svg)`**. Figma·pigma 양쪽에서 동일 렌더(Lucide 등 그대로).
```js
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3C1E1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
const icon = figma.createNodeFromSvg(svg); icon.name='icon/search'; icon.x=16; icon.y=16;
```
- **컬러링**: SVG의 `stroke`/`fill`을 인라인으로 지정(위처럼). 이 방식이 양쪽에서 가장 안정적.
- Lucide/Heroicons 등 아이콘 라이브러리 SVG를 그대로 넣으면 됨. (Figma=FRAME, pigma=group 반환, 시각 동일)
