# _base/token — 디자인 토큰 추출 절차

> Color · Typography · Spacing · Radius
> 컬러 부분 출처: 디자이너 피드백 리포트 v1.1 §1
> 진단: **primary가 너무 많이 쓰였다.** 원인은 역할(role) 정의 없이 "강조=primary"로 일괄 적용.
>
> ⚠️ 이 문서는 **절차**다. 값(hex·px)을 여기 적지 않는다. 값은 `docs/artifacts/03-design.md`.
> ③ 디자인 시스템 단계가 이 문서를 읽고 값을 채운다.

## 공통 — 값을 어디서 뽑는가

우선순위 순이다. 위에서 답이 나오면 아래로 안 내려간다.

1. **`기존파일` Page** — 과제의 기존 자산. `penpot.currentFile.pages`로 읽는다. **수정 금지**
2. **PRD 본문** — 도메인이 요구하는 색·톤이 적혀 있을 수 있다
3. **위 둘에 근거가 없을 때만** 일반 모바일 UI 관례로 채우고,
   `docs/artifacts/03-design.md`에 **"근거 없음 — 관례"** 라고 명시한다

외부에서 구한 디자인 문서가 있어도 **`기존파일`과 충돌하면 기존파일이 이긴다.**
과제가 기존 자산의 리디자인이라, 외부 값으로 덮으면 기존과 무관한 화면이 된다.

---

# 1. Color

## 1-1. 역할 슬롯 (값이 아니라 자리)

뽑은 색을 **아래 슬롯에 배정**한다. 슬롯을 늘리지 않는다.

| 토큰 | 역할 | 쓰는 곳 |
|---|---|---|
| `primary` | 주 CTA, 현재 상태(active/selected) **전용** | 화면당 solid 1개 |
| `primaryWeak` | primary 8~12% 틴트 | 뱃지 배경, 선택된 행 배경 |
| `secondary` | 보조 버튼, 링크, 아이콘 면, 섹션 강조 | 제한 없음 |
| `accent` | 3rd. 차트·뱃지·일러스트 포인트 | 화면당 1~2회. **UI 컨트롤 금지** |
| `bg` `surface` `border` `textSub` `text` | 뉴트럴 **5단 필수** | 구조·위계 전부 |
| `success` `warning` `danger` | 상태 | 상태 표시에만 |

**뉴트럴 5단이 다 안 쓰였으면 그 화면은 컬러로 구조를 대신한 것이다.** 검증에서 잡는다.

### 도메인 필수색
PRD 도메인이 방향성 색을 요구하면(상승/하락, 매칭 성공/실패 등)
`semantic`에 추가한다. `accent`를 도메인 색으로 전용하지 않는다.

## 1-2. 사용 예산 (Color budget) — 저작·검증이 그대로 검사한다

| 규칙 | 임계값 |
|---|---|
| solid `primary` 버튼 | 화면당 **1개** |
| `primary` 칠해진 요소 총 개수 | 화면당 **5개 이하** |
| `primary` 채색 **면적 비율** | 화면 면적의 **10% 이하** |
| 대면적 배경에 `primary` | **금지** (필요하면 `primaryWeak`) |

- 텍스트 강조는 primary가 아니라 **weight + 뉴트럴 대비**로 먼저 해결한다.
- 카드·섹션 구분은 컬러가 아니라 `surface` + `border` + 여백으로 해결한다.

## 1-3. 뉴트럴 퍼스트 — 저작 순서를 강제한다

색을 나중에 얹는 것이 이 규칙의 핵심이다.

1. 화면 전체를 **뉴트럴만으로** 저작한다
2. 이 상태에서 레이아웃·위계가 성립하는지 본다. 성립하지 않으면 **여백과 weight를 고친다**
3. 마지막에 주 CTA 1개에 `primary`를 얹는다
4. 남은 강조를 `secondary`, 포인트를 `accent`로 얹는다

## 1-4. 자가 검수 — 그레이스케일 대체 검사

Penpot에는 그레이스케일 미리보기가 없다. 대신 **계산으로 같은 것을 본다.**
`develop/scripts/color-audit.js`가 화면별로 아래를 반환한다.

- `primaryAreaRatio` ≤ 0.10 / `primaryElementCount` ≤ 5
- `solidPrimaryButtonCount` == 1 / `neutralStepsUsed` == 5

깨지면 **강등 규칙**을 적용한다:
> solid primary 버튼이 2개 이상이면 화면의 주 행동 1개만 남기고
> 나머지를 `secondary` 또는 outline(`border` + `text`)으로 내린다.

---

# 2. Typography

## 2-1. 폰트를 먼저 확정한다

- **`penpot.fonts.all`로 서버에 있는지 확인한다.** 없으면 **에러 없이 조용히 대체된다.**
- `기존파일`이 쓰는 폰트가 서버에 없으면 대체 폰트를 고르고
  `docs/artifacts/03-design.md`에 **무엇을 무엇으로 바꿨는지** 적는다.
- 본문 폰트 1종이 기본이다. 제목용을 따로 쓰려면 근거가 있어야 한다.

## 2-2. 스케일은 5~6단까지만

단이 많으면 위계가 오히려 흐려진다. 아래 역할에 배정한다.

| 토큰 | 역할 |
|---|---|
| `display` | 화면 최상단 큰 제목 (없는 화면도 있다) |
| `title` | 섹션·카드 제목 |
| `body` | 본문 기본 |
| `bodySm` | 보조 설명 |
| `caption` | 메타 정보, 타임스탬프 |
| `label` | 버튼·탭 라벨 |

### 뽑는 방법
1. `기존파일`의 텍스트 노드에서 **실제 쓰인 fontSize를 전부 수집**한다
2. 빈도순으로 묶어 위 6개 역할에 배정한다. 애매한 중간값은 버린다
3. 비어 있는 역할은 인접 단에서 비율로 채운다 (1.2~1.25배 간격)

## 2-3. weight와 행간

- weight는 **2~3종까지**. `regular`(400) / `semibold`(600) / `bold`(700)
- **강조는 색이 아니라 weight로 먼저 한다** (§1-2와 연결)
- line-height는 배수로 정한다: 제목 1.3, 본문 1.5 기준
- 고정 폭 텍스트는 `growType = "auto-height"`. `"fixed"`면 글자가 잘린다

---

# 3. Spacing

## 3-1. 4px 배수만 쓴다

`4 / 8 / 12 / 16 / 24 / 32 / 40` 중에서 고른다. 6단 정도면 충분하다.

| 토큰 | 용도 |
|---|---|
| `xs` | 아이콘과 라벨 사이 |
| `sm` | 같은 덩어리 안 요소 간격 |
| `md` | 카드 내부 패딩 |
| `lg` | 화면 좌우 패딩, 카드 사이 |
| `xl` | 섹션 사이 |

### 뽑는 방법
`기존파일`에서 실제 쓰인 패딩·갭 분포를 수집해 4px 배수로 반올림하고,
가장 자주 나온 값 5~6개를 위 슬롯에 배정한다.

## 3-2. 화면 골격 상수는 ②가 확정한다

앱바 높이·좌우 패딩·하단 CTA 높이는 이 토큰을 조합해 ②가 `02-policy.md`에 적는다.
③은 **재료(간격 단계)** 까지만 만든다.

---

# 4. Radius

3단이면 충분하다. `기존파일`의 실제 cornerRadius 분포에서 뽑는다.

| 토큰 | 용도 |
|---|---|
| `sm` | 뱃지, 작은 태그 |
| `md` | 카드, 입력 필드 |
| `lg` | 바텀시트, 모달 상단 |
| `full` | 원형 아바타, pill 버튼 (9999) |

버튼은 `md`와 `full` 중 하나로 **전 화면에서 통일**한다. 섞으면 완성도가 깎인다.

---

# 5. 출력 계약

③ 단계는 값을 채운 뒤 **두 벌**로 낸다.

- `docs/artifacts/03-design.md` — 사람이 읽는 표 (역할 / 값 / 근거 출처)
- `develop/scripts/tokens.js` — 저작이 import하는 JS 상수

```js
// develop/scripts/tokens.js — ③이 생성한다
export const COLOR = {
  primary: "#______", primaryWeak: "#______",
  secondary: "#______", accent: "#______",
  bg: "#FFFFFF", surface: "#F7F8FA", border: "#E5E8EC",
  textSub: "#6B7280", text: "#1A1D21",
  success: "#______", warning: "#______", danger: "#______",
};

export const FONT = { family: "____", fallback: "____" };
export const TYPE = {
  display: { size: 0, weight: 700, lineHeight: 1.3 },
  title:   { size: 0, weight: 600, lineHeight: 1.3 },
  body:    { size: 0, weight: 400, lineHeight: 1.5 },
  bodySm:  { size: 0, weight: 400, lineHeight: 1.5 },
  caption: { size: 0, weight: 400, lineHeight: 1.4 },
  label:   { size: 0, weight: 600, lineHeight: 1.2 },
};
export const SPACE  = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
export const RADIUS = { sm: 4, md: 8, lg: 16, full: 9999 };
```

**raw 값을 저작 스크립트에 직접 쓰지 않는다.** `COLOR.*` `TYPE.*` `SPACE.*` `RADIUS.*` 로만 호출한다.
`fills`는 penpot 형식으로 넣는다 — `{ fillColor: COLOR.primary, fillOpacity: 1 }`.
figma 형식(`{type:"SOLID", color:{r,g,b}}`)은 인스턴스 오버라이드에서 막힌다.

**`figma.variables.*`는 쓰지 않는다.** 성공 응답만 오고 토큰이 거의 안 남는다.
