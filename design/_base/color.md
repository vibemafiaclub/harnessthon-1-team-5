# _base/color — 컬러 위계 추출 절차

> 출처: 디자이너 피드백 리포트 v1.1 §1
> 진단: **primary가 너무 많이 쓰였다.** 원인은 역할(role) 정의 없이 "강조=primary"로 일괄 적용.
>
> ⚠️ 이 문서는 **절차**다. 값(hex)을 여기 적지 않는다. 값은 `design/{prd-slug}/token.md`.
> ③ 디자인 시스템 단계가 이 문서를 읽고 값을 채운다.

## 1. 역할 슬롯 (값이 아니라 자리)

PRD·`기존파일` Page에서 뽑은 색을 **아래 슬롯에 배정**한다. 슬롯을 늘리지 않는다.

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

## 2. 사용 예산 (Color budget) — 저작·검증이 그대로 검사한다

| 규칙 | 임계값 |
|---|---|
| solid `primary` 버튼 | 화면당 **1개** |
| `primary` 칠해진 요소 총 개수 | 화면당 **5개 이하** |
| `primary` 채색 **면적 비율** | 화면 면적의 **10% 이하** |
| 대면적 배경에 `primary` | **금지** (필요하면 `primaryWeak`) |

- 텍스트 강조는 primary가 아니라 **weight(600/700) + 뉴트럴 대비**로 먼저 해결한다.
- 카드·섹션 구분은 컬러가 아니라 `surface` + `border` + 여백으로 해결한다.

## 3. 뉴트럴 퍼스트 — 저작 순서를 강제한다

색을 나중에 얹는 것이 이 규칙의 핵심이다.

1. 화면 전체를 **뉴트럴만으로** 저작한다 (`bg`/`surface`/`border`/`text`/`textSub`)
2. 이 상태에서 레이아웃·위계가 성립하는지 본다. 성립하지 않으면 **여백과 weight를 고친다** (색을 넣지 않는다)
3. 마지막에 주 CTA 1개에 `primary`를 얹는다
4. 남은 강조를 `secondary`, 포인트를 `accent`로 얹는다

## 4. 자가 검수 — 그레이스케일 대체 검사

Penpot에는 그레이스케일 미리보기가 없다. 대신 **계산으로 같은 것을 본다.**
`develop/scripts/color-audit.js`가 화면별로 아래를 반환한다.

- `primaryArea / boardArea` ≤ 0.10
- `primaryElementCount` ≤ 5
- `solidPrimaryButtonCount` == 1
- `neutralStepsUsed` == 5

셋 중 하나라도 깨지면 **강등 규칙**을 적용한다:
> solid primary 버튼이 2개 이상이면 **화면의 주 행동 1개만 남기고** 나머지를
> `secondary` 또는 outline(`border` + `text`)으로 내린다.

## 5. 출력 계약

③ 단계는 값을 채운 뒤 **두 벌**로 낸다.

- `design/{prd-slug}/token.md` — 사람이 읽는 표 (역할 / 값 / 근거 출처)
- `develop/scripts/tokens.js` — 저작이 import하는 JS 상수

```js
// develop/scripts/tokens.js  — ③이 생성한다
export const COLOR = {
  primary: "#______", primaryWeak: "#______",
  secondary: "#______", accent: "#______",
  bg: "#FFFFFF", surface: "#F7F8FA", border: "#E5E8EC",
  textSub: "#6B7280", text: "#1A1D21",
  success: "#______", warning: "#______", danger: "#______",
};
```

**raw hex를 저작 스크립트에 직접 쓰지 않는다.** `COLOR.*`로만 호출한다.
`fills`는 penpot 형식으로 넣는다 — `{ fillColor: COLOR.primary, fillOpacity: 1 }`.
figma 형식(`{type:"SOLID", color:{r,g,b}}`)은 인스턴스 오버라이드에서 막힌다.
