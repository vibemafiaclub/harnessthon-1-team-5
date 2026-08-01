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

## 🔴🔴 운영 리허설 함정 16종 — 모르면 시간을 통째로 날린다

> 출처: 운영이 예시 PRD(`docs/examples/`)로 직접 리허설하며 부딪힌 것들. `AGENTS.md`에도 있다.
> **저작 코드를 쓰기 전에 이 표를 먼저 읽는다.** 대부분 "에러 없이 조용히 틀리는" 종류다.

| 함정 | 대응 |
|---|---|
| `figma.variables.*` 는 성공 응답만 오고 토큰이 거의 안 남는다 | 토큰은 **JS 상수 객체**로 두고 저작에 일관 적용. 점수는 컴포넌트로 받는다 |
| `fills`에 **figma 형식**(`{type:"SOLID", color:{r,g,b}}`)을 쓰면 인스턴스에서 막힌다 | **penpot 형식** `{fillColor:"#RRGGBB", fillOpacity:1}` → **인스턴스도 오버라이드된다** |
| 인스턴스의 `characters`(텍스트) 오버라이드는 **된다** | 데이터가 다른 행은 인스턴스 재사용으로 처리 |
| 반투명 오버레이(`fillOpacity: 0.4`)가 **렌더링에서 사라질 때가 있다** | 스크림을 덮지 말고 **뒤 화면 보드의 `opacity`를 낮춘다** |
| `penpot.openPage()` 가 **다음 호출까지 유지되지 않는다** | 모든 스크립트 **첫 줄**에서 작업 Page를 다시 고정한다 |
| `openPage()` 한 **그 호출 안에서** 새 Page 노드를 만지면 죽는다 | Page 전환은 **별도 호출**로 먼저, 다음 호출부터 저작 |
| hHug 프레임 안 텍스트가 **아래가 잘린 채** 굳는다 | 화면 완성 후 `growType==="auto-height"` 텍스트를 전부 `resize`로 재계산 |
| 만든 컴포넌트의 **이름 변경·자식 remove** → 플러그인이 멈춘다 | 이름·구조는 처음에 확정. 틀렸으면 **새 이름으로 새로** 만든다 |
| `layoutGrow` Spacer가 폭 1로 되돌아간다 | 하단 고정 요소는 Spacer 높이를 **계산해서 명시** |
| hug(자동 폭) 칸은 텍스트를 갈아끼워도 위치가 안 따라온다 | 가변 텍스트 칸은 **고정 폭 + 텍스트 정렬** |
| `primaryAxisSizingMode` 등 figma 사이징 프로퍼티가 안 먹는다 | `node.horizontalSizing = "fix"\|"auto"` (penpot 쪽)을 쓴다 |
| **컴포넌트 이름이 파일 전역** — 옆 팀원 Page의 동명 컴포넌트가 잡힌다 | 이름 + **id 프리픽스**로 좁혀서 찾는다 |
| 기존 파일 폰트가 **서버에 없으면 조용히 대체**된다 (에러 없음) | `penpot.fonts.all`로 먼저 확인하고 대체 폰트를 정한다 |
| 비-오토레이아웃 프레임은 `appendChild`가 자식을 **안 옮긴다** | 붙인 뒤 `c.x = parent.x + dx; c.y = parent.y + dy` |
| 고정 폭 텍스트를 `growType="fixed"`로 두면 **글자가 잘린다** | `growType = "auto-height"` |
| `export_shape`가 레이아웃 안정 전에 찍히면 **빈 영역**이 나온다 | 없다고 판단하기 전에 **재-export 한 번** |

### ✅ 쓸 수 있는 것 — 모르면 손해다

```js
// 1) 실제 사진을 넣을 수 있다. top-level await 도 된다.
const img = await penpot.uploadMediaUrl(name, url);
rect.fills = [{ fillOpacity: 1, fillImage: img }];

// 2) 자식 순서를 고칠 수 있다. (지우기가 위험한 환경이라 이게 탈출구)
board.insertChild(index, node);

// 3) shape.clone() 이 된다.
//    같은 화면의 상태 변형(모달·에러·로딩)을 처음부터 다시 짓지 말 것.
//    복제 → 덮을 것만 얹는다.
const variant = screen.clone();
```

> `clone()`과 `uploadMediaUrl`은 **A트랙 "완성도·디테일"에 직결**된다.
> 상태 변형을 매번 새로 짓거나 사진 자리를 회색 박스로 두면 그만큼 깎인다.

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
