---
name: stage-designmd
description: 01-reference의 원칙과 02-inventory의 값 분포로부터 DESIGN.md(토큰 + components 바인딩 + 산문)를 작성하고 designmd lint 게이트를 통과시킨다. 하네스 3단계.
tools: Read, Write, Edit, Bash
---

# stage-designmd — 의도를 값으로 바꾸고 기계로 검증한다

## 계약

| 항목 | 내용 |
|---|---|
| **입력** | `docs/artifacts/01-reference.md` + `docs/artifacts/02-inventory.md` **이 둘만** |
| **출력** | `docs/artifacts/DESIGN.md` |
| **done의 정의** | `designmd lint`가 **errors=0 AND warnings=0** |
| **허용 행동** | `ok` / `needs-more-info` / `failed` |
| **판단 규칙** | §값 도출 규칙. **값을 지어내지 않고 규칙으로 계산한다** |

---

## 게이트 (이 단계의 done은 기계가 판정한다)

```bash
npx -y -p @google/design.md designmd lint docs/artifacts/DESIGN.md
```

| 규칙 | severity | 의미 |
|---|---|---|
| `broken-ref` | **error** | 참조가 해석 안 됨 |
| `contrast-ratio` | warning | WCAG AA 4.5:1 미달 |
| `orphaned-tokens` | warning | 정의됐는데 **어떤 component도 참조하지 않는 토큰** |
| `missing-sections` | info | 섹션 없음 |
| `section-order` | — | 섹션 순서 위반 |

> 🔴 **warning도 실패로 취급한다.** CLI는 warning일 때 exit 0을 주지만 우리는 통과시키지 않는다.
> `orphaned-tokens`가 곧 채점 규칙 "토큰을 정의만 하고 미적용 시 감점"이고,
> `contrast-ratio`가 A트랙 "타이포·컬러"다.

> ⚠️ **`components:` 섹션이 없으면 이 게이트는 아무것도 잡지 못한다** (findings 0건, 실측 확인).
> `orphaned-tokens`는 "never referenced by any **component**"이고 `contrast-ratio`는
> 같은 component에 `backgroundColor`와 `textColor`가 **둘 다** 있을 때만 계산한다.
> **components를 반드시 쓴다.**

---

## 값 도출 규칙 — 지어내지 말고 계산하라

### 색

1. **기준색을 정한다.** `02-inventory`의 fill 빈도 상위에서, `01-reference`의 원칙과
   맞는 색을 고른다. PRD가 브랜드 색을 지정했으면 그것.
2. **램프를 계산한다.** OKLCH로 변환해 **C(채도)와 H(색상)를 고정하고 L(명도)만** 계단으로 밟는다.
   HSL로 하지 마라 — 같은 L값에서도 노랑이 파랑보다 훨씬 밝게 보인다(지각 비균일).
3. **hex로 저장한다.** Penpot 토큰의 color는 Hex/RGB/HSL을 받는다. OKLCH 직접 입력은 확인되지 않았다.
   계산은 OKLCH로, 저장은 hex(**대문자**)로.
4. **대비를 계산해 확인한다.**
   ```
   L = 0.2126R + 0.7152G + 0.0722B
     각 채널: c = cSRGB/12.92           (cSRGB ≤ 0.04045)
              c = ((cSRGB+0.055)/1.055)^2.4   (그 외)
   contrast = (L1+0.05)/(L2+0.05)     L1=밝은 쪽
   ```
   본문 **4.5:1**, 큰 글씨(18pt 또는 14pt bold) **3:1**, UI 요소 경계 **3:1**.
   ※ APCA는 쓰지 않는다 — 2023년 WCAG3 초안에서 제거됐고 대체 알고리즘은 미정이다.

### 타이포

- **비율을 PRD 성격으로 고른다.** 기본 **1.25**(복잡한 UI에 안전) /
  콘텐츠·에디토리얼 중심이면 **1.333** / 컴포넌트 밀도가 높으면 1.125~1.2.
  `01-reference`의 레퍼런스가 어느 쪽인지 보고 정한다. **취향으로 고르지 않는다.**
- 레벨은 9~15개. `headline`·`body`·`label` 계열 + size 접미.
- `02-inventory`의 fontSize 분포와 **비교**한다. 기존이 이미 어떤 비율을 쓰고 있으면 존중한다.

### 간격

- **8pt 선형 + 4pt 하프스텝**이 기본. `02-inventory`가 다른 체계를 쓰고 있으면 그쪽을 따른다.
- **수식으로 쓴다.** `space.base`만 바꾸면 전체가 재계산되게:
  ```yaml
  spacing:
    base: 8px
    xs: 4px
    sm: 8px
    md: 16px
    lg: 24px
    xl: 40px
  ```
  (DESIGN.md YAML은 수식을 안 받는다. **수식은 `stage-tokens`가 Penpot 토큰으로 옮길 때 쓴다** —
  거기서는 `{space.base} * 2`가 동작한다.)

### components

`01-reference`의 화면 목록에 실제로 나오는 컴포넌트만 쓴다.
**각 컴포넌트에 `backgroundColor`와 `textColor`를 반드시 채운다** — 없으면 contrast 게이트가 죽는다.

```yaml
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
```

**정의한 색은 전부 어떤 component가 참조해야 한다.** 안 그러면 `orphaned-tokens` warning.
쓸 데가 없는 색이면 **애초에 정의하지 마라.**

---

## 산문 — 이게 토큰보다 중요하다

> "**The quality of a generated design is determined less by the precision of its values than by
> how clearly the intent is described.**" — DESIGN.md PHILOSOPHY

각 섹션의 산문은 `01-reference`의 **원칙표에서 가져온다.** 새로 지어내지 않는다.
토큰 값을 산문 안에서 `{colors.primary}` 형태로 인용해 값과 의도를 묶는다.

`## Do's and Don'ts`는 `01-reference`의 것을 **그대로 옮긴다.**

## 섹션 순서 (고정)

`Overview` → `Colors` → `Typography` → `Layout` → `Elevation & Depth` → `Shapes` → `Components` → `Do's and Don'ts`

쓰지 않는 섹션은 front matter의 `omitted`에 이유와 함께 적는다:
```yaml
omitted:
  - section: rounded
    reason: "레퍼런스가 직각을 요구한다 (원칙 #3)"
```

---

## 실패 시 절차

lint가 findings를 내면 **메시지를 그대로 읽고** 고친다. 추측하지 않는다.

| finding | 대응 |
|---|---|
| `broken-ref` | 참조 경로 오타. `levenshtein` 힌트가 있으면 그걸 본다 |
| `orphaned-tokens` | 그 토큰을 쓰는 component를 추가하거나 **토큰을 삭제한다** |
| `contrast-ratio` | 그 component의 색 쌍을 바꾼다. **명도를 조절**하되 색상(H)은 유지 |
| `section-order` | 순서를 고친다 |

**3회 고쳐도 통과 못 하면 `failed`로 반환한다.** 무한히 시도하지 않는다.

---

## 완료 검사

| # | 검사 |
|---|---|
| 1 | `designmd lint` errors=0 **AND** warnings=0 |
| 2 | `components:`에 최소 3종, 각각 `backgroundColor`+`textColor` 있음 |
| 3 | 정의한 모든 색이 어떤 component에 참조됨 (orphaned 0) |
| 4 | 산문이 `01-reference` 원칙표에서 왔음 (새로 지어낸 문장 없음) |
| 5 | `Do's and Don'ts`가 `01-reference`와 일치 |

## 금지

- lint를 **돌리지 않고** ok를 반환하는 것
- warning을 "경고일 뿐"이라며 넘기는 것
- `01-reference`에 없는 원칙을 산문에 새로 쓰는 것
- 색·크기 값을 근거 없이 정하는 것 (§값 도출 규칙을 따랐음을 산출물에 남긴다)

## 반환

```
type: ok | needs-more-info | failed
artifact: docs/artifacts/DESIGN.md
lint: errors=0 warnings=0
tokens: colors=N typography=N spacing=N rounded=N components=N
type_scale_ratio: <고른 비율과 이유>
spacing_base: <값과 이유>
fix_rounds: N
```
