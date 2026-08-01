---
name: stage-tokens
description: DESIGN.md의 토큰을 Penpot 토큰 set 3층(core/semantic/brand)으로 저작하고, 수식·참조를 써서 하드코딩 없이 스케일을 표현한다. 하네스 4단계.
tools: Read, Write, mcp__penpot__use_figma, mcp__penpot__penpot_api_info
---

# stage-tokens — DESIGN.md를 Penpot 토큰으로 옮긴다

## 계약

| 항목 | 내용 |
|---|---|
| **입력** | `docs/artifacts/DESIGN.md` **이것만** |
| **출력** | Penpot 토큰 set 3층 + `docs/artifacts/04-tokens.md` (저작 결과 요약) |
| **done의 정의** | §완료검사 6항목 통과 |
| **허용 행동** | `ok` / `failed` |
| **판단 규칙** | 스케일은 **수식 토큰**으로 표현한다. 숫자 목록을 하드코딩하지 않는다 |

---

## 🔴 시작 전 — 작업 Page 확인

오케스트레이터가 넘긴 Page 이름이 있어야 한다. **없으면 즉시 중단하고 요구한다.**

```js
const target = "<넘겨받은 이름>";
const p = penpotUtils.getPageByName(target);
if (!p) return { error: "그런 Page 없음", pages: penpotUtils.getPages().map(x=>x.name) };
penpot.openPage(p);
return { switched: penpot.currentPage.name };
```

> 토큰은 **파일 단위**라 Page와 무관하지만, 뒤 단계가 같은 Page에서 저작하므로 여기서 확정한다.

---

## 🔴 침묵 실패 3종 — 모르면 "만들었는데 아무 일도 안 일어난다"

| # | 함정 | 대응 |
|---|---|---|
| 1 | **비활성 set의 토큰은 적용되지 않는다** | `addSet` 직후 **무조건** `if (!set.active) set.toggleActive();` |
| 2 | **토큰 적용은 비동기다** | 적용 후 **~100ms 대기** 뒤 검증. 안 하면 검증이 거짓 실패 |
| 3 | **`Group`에는 적용 불가** | 반복요소는 `Group`이 아니라 **`Board`** 로 (5단계에 전달) |

---

## set 3층 — 순서가 우선순위다

Penpot은 동명 토큰이 있으면 **뒤 set이 앞을 덮는다**(CSS 캐스케이딩).

| 순서 | set | 담는 것 |
|---|---|---|
| 1 | `core` | 원시값·스케일 기준. `space.base`, `color.brand.500`, `font.base` |
| 2 | `semantic` | 의미 이름이 원시값을 **참조**. `color.surface` = `{color.brand.50}` |
| 3 | `brand` | 오버라이드용. 비워둬도 된다 |

이렇게 하면 **브랜드 교체가 마지막 set 하나만 갈아끼우는 일**이 된다.
이게 B트랙 재현성 논거다.

---

## ★ 스케일은 수식으로 — 하드코딩 금지

Penpot 토큰 값은 **수식을 받는다.** 이게 이 단계의 핵심이다.

```js
const cat = penpot.library.local.tokens;
const core = cat.addSet({ name: 'core' });
if (!core.active) core.toggleActive();          // ★함정1

// 기준 하나
core.addToken({ type:'number',  name:'space.base', value:'8' });
// 나머지는 전부 파생
core.addToken({ type:'spacing', name:'space.xs',   value:'{space.base} * 0.5' });
core.addToken({ type:'spacing', name:'space.sm',   value:'{space.base} * 1' });
core.addToken({ type:'spacing', name:'space.md',   value:'{space.base} * 2' });
core.addToken({ type:'spacing', name:'space.lg',   value:'{space.base} * 3' });
core.addToken({ type:'spacing', name:'space.xl',   value:'{space.base} * 5' });
return core.tokens.map(t => ({ name:t.name, value:t.value, resolved:t.resolvedValue }));
```

`space.base`만 바꾸면 전체 리듬이 재계산된다.
**PRD가 "여백이 넉넉한 느낌"이라 하면 base를 8→10으로 바꾼다.** 목록을 다시 쓰지 않는다.

폰트 크기도 같다:
```js
core.addToken({ type:'number',    name:'font.base',  value:'16' });
core.addToken({ type:'number',    name:'font.ratio', value:'1.25' });   // DESIGN.md가 고른 비율
core.addToken({ type:'fontSizes', name:'font.md',    value:'{font.base}' });
core.addToken({ type:'fontSizes', name:'font.lg',    value:'{font.base} * {font.ratio}' });
```

### ⚠️ 수식 함정

- **연산자 앞뒤 공백 필수.** `8*8` ❌ / `8 * 8` ✅
- 참조는 **대소문자 구분**
- 순환 참조 금지

> ⚠️ 수식 지원은 Penpot 공식 문서 근거이나 **이 레포에서 실행 검증되지 않았다**(clm_006).
> **처음 실행할 때 위 스니펫을 먼저 돌려 `resolvedValue`가 계산되는지 확인하라.**
> 계산이 안 되면 즉시 보고하고, 폴백으로 계산된 숫자를 직접 넣되 **04-tokens.md에 그 사실을 기록**한다.

---

## semantic 층

```js
const sem = cat.addSet({ name:'semantic' });
if (!sem.active) sem.toggleActive();
sem.addToken({ type:'color', name:'color.surface',    value:'{color.brand.50}' });
sem.addToken({ type:'color', name:'color.on-surface', value:'{color.brand.900}' });
```

DESIGN.md의 `components:` 바인딩이 여기 semantic 이름을 가리키게 한다.

---

## TokenType 전체

`color` `dimension` `spacing` `sizing` `rotation` `opacity` `borderRadius` `borderWidth`
`fontFamilies` `fontSizes` `fontWeights` `letterSpacing` `textCase` `textDecoration`
`typography`(composite) `shadow`(composite)

**DESIGN.md에 있지만 Penpot에 없는 타입**(`duration`·`cubicBezier`·`transition`·`border`·`gradient`)은
옮기지 않고 `04-tokens.md`에 **누락으로 기록**한다. 억지로 매핑하지 않는다.

---

## 완료 검사 (전부 실행으로 확인)

```js
const cat = penpot.library.local.tokens;
return {
  sets: cat.sets.map(s => ({ name:s.name, active:s.active, n:s.tokens.length })),
  unresolved: cat.sets.flatMap(s => s.tokens)
    .filter(t => t.resolvedValue === undefined || t.resolvedValue === null)
    .map(t => ({ name:t.name, value:t.value })),
  overview: penpotUtils.tokenOverview()
};
```

| # | 검사 | 통과 조건 |
|---|---|---|
| 1 | set 3층이 존재하는가 | `core`·`semantic`·`brand` |
| 2 | **전부 active인가** | `active: true` × 3 |
| 3 | set 순서가 core→semantic→brand인가 | 배열 순서 |
| 4 | **미해결 토큰이 0인가** | `unresolved.length === 0` |
| 5 | 수식 토큰이 실제로 계산됐는가 | `resolvedValue`가 값을 가짐 |
| 6 | DESIGN.md의 모든 색·간격·타이포가 옮겨졌는가 | 개수 대조 |

---

## 산출물 — `docs/artifacts/04-tokens.md`

```markdown
## 저작된 토큰

| set | active | 개수 |

### core — 기준과 파생
| 이름 | value (수식 그대로) | resolvedValue |

### semantic
| 이름 | 참조 | resolvedValue |

## 수식 동작 여부
- `{space.base} * 2` → resolvedValue = ___   ✅ 계산됨 / ❌ 폴백(직접 숫자 입력)

## 옮기지 못한 것
| DESIGN.md 토큰 | 타입 | 이유 |
```

## 금지

- `toggleActive()` 없이 set을 만들고 끝내는 것 (침묵 실패 1)
- 스케일을 숫자 목록으로 나열하는 것 — **반드시 수식**
- 검증 없이 `ok` 반환. 위 스니펫 실행 결과를 산출물에 붙인다
- hex 소문자 (`#4f46e5` ❌ → `#4F46E5` ✅)

## 반환

```
type: ok | failed
artifact: docs/artifacts/04-tokens.md
sets: [{core,active,N},{semantic,active,N},{brand,active,N}]
formula_works: true | false
unresolved: 0
skipped_types: [...]
```
