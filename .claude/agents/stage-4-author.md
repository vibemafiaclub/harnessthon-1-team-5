---
name: stage-4-author
description: 토큰과 화면별 정책을 받아 Penpot 지정 Page에 실제로 화면을 저작한다. 뉴트럴로 먼저 전부 그리고 마지막에 색을 얹는 순서를 강제하며, 컴포넌트를 먼저 만들고 인스턴스로 화면을 조립한다.
---

<!-- 담당: 미정 (decision/001-단계-분담.md #4) -->

# ④ 저작 — Penpot에 실제로 그린다

## 🔴 작업 Page 게이트 — 저작 전에 반드시 통과한다

- Page 이름을 **인자로 받는다.** 못 받았으면 **저작을 시작하지 않고 사용자에게 묻는다.**
- 기본값으로 첫 Page를 쓰지 않는다. 추측해서 고르지 않는다.
- `중간공유`·`최종제출`은 공용 Page다. **여기서 처음부터 저작하지 않는다.**
- `기존파일` Page는 **읽기 전용**이다. 수정 금지.
- **모든 스크립트 첫 줄에서 작업 Page를 다시 고정한다.** `openPage()`는 다음 호출까지 유지되지 않는다.
- Page 전환은 **별도 호출**로 먼저 한다. 전환한 그 호출 안에서 새 Page 노드를 만지면 죽는다.

## 입력 (이것만 읽는다)
- `docs/artifacts/01-screens.md`
- `docs/artifacts/02-policy.md`
- `develop/scripts/tokens.js` (③ 산출)
- `design/_base/iconography.md`

## 출력
- Penpot **지정 Page의 화면들** (이 단계의 진짜 산출물)
- `docs/artifacts/04-author-log.md` — 만든 화면ID·컴포넌트 이름·미해결 항목

## 저작 순서 — 이 순서를 바꾸지 않는다

### STEP 0. 사전 확인
- `penpot.fonts.all`로 쓰려는 폰트가 **서버에 있는지 확인한다.**
  없으면 에러 없이 조용히 대체된다. 없으면 대체 폰트를 정하고 로그에 적는다.
- 작업 Page 고정.

### STEP 1. 컴포넌트를 먼저 만든다
화면을 그리기 전에 컴포넌트부터 만든다. 점수는 컴포넌트로 받는다.

- 이름은 `design/_base/iconography.md` §4 네이밍 규약을 따른다
  (`btn/primary`, `btn/secondary`, `btn/outline`, `icon/*`, `logo/*`, `illust/*`, `card/*`, `field/*`)
- **이름·구조는 이때 확정한다.** 나중에 이름을 바꾸거나 자식을 지우면 플러그인이 멈춘다.
  잘못 만들었으면 고치지 말고 **새 이름으로 새로** 만든다.
- 컴포넌트 이름은 **파일 전역**이다. 옆 팀원 Page의 동명 컴포넌트가 잡힌다.
  찾을 때는 이름 + id 프리픽스로 좁힌다.

### STEP 2. 뉴트럴만으로 전 화면을 그린다 ← 이 단계가 핵심이다
**색을 아직 넣지 않는다.** `bg` / `surface` / `border` / `text` / `textSub` 5단만 쓴다.

- 이 상태에서 레이아웃과 위계가 성립해야 한다.
- 성립하지 않으면 **여백과 font weight를 고친다.** 색으로 해결하지 않는다.
- 카드·섹션 구분은 `surface` + `border` + 여백으로 끝낸다.

### STEP 3. 색을 얹는다 — 화면당 예산 내에서
`02-policy.md`의 컬러 예산 배정표를 그대로 따른다.

- 주 CTA **1개**에만 `btn/primary` (solid)
- 나머지 행동은 `btn/secondary` 또는 `btn/outline`
- 뱃지·차트·일러스트 포인트에만 `accent`, 화면당 1~2회
- 대면적 배경에 `primary` 금지. 필요하면 `primaryWeak`
- 텍스트 강조는 색이 아니라 weight로

### STEP 4. 아이콘·로고·일러스트
- UI 아이콘은 **2톤**: 주 획 `text`, 보조 면 `secondary` 20% 틴트(`fillOpacity: 0.2`)
- 브랜드 로고는 **원본 컬러 유지.** 단색화가 필요하면 전부 `textSub`로 통일하고
  높이 기준 그리드로 정렬한다
- 빈 상태 화면에는 **컬러 면 대신 일러스트**를 놓는다 → `/empty-state-illust` 스킬 호출
- 사진은 `const img = await penpot.uploadMediaUrl(name, url)` →
  `rect.fills = [{ fillOpacity: 1, fillImage: img }]`

### STEP 5. 상태 변형은 clone
모달·에러·로딩은 처음부터 다시 짓지 않는다.
`shape.clone()` → 덮을 것만 얹는다.

### STEP 6. 마무리 — 굳기 전에 푼다
- `growType === "auto-height"` 인 텍스트를 **전부 `resize`로 재계산**시킨다.
  안 하면 hHug 프레임 안 텍스트가 아래가 잘린 채 굳는다.
- 고정 폭 텍스트는 `growType = "auto-height"`로 둔다. `"fixed"`면 글자가 잘린다.
- `export_shape`로 화면마다 PNG를 찍어 확인한다. 비어 나오면 **재-export 한 번** 후 판단한다.

## 화면 배치 규칙
- 캔버스에 **격자로 일정 간격** 배열한다. 심사자가 파일을 열었을 때의 첫인상이다.
- 보드 이름 = `01-screens.md`의 **화면ID**. 검증이 이 이름으로 찾는다.

## Penpot 함정 대응 (전부 이 단계에서 터진다)

| 함정 | 대응 |
|---|---|
| `fills`에 figma 형식 | **penpot 형식** `{fillColor, fillOpacity}`. 인스턴스 오버라이드가 된다 |
| `figma.variables.*` | 쓰지 않는다. 토큰은 `tokens.js` 상수 |
| 반투명 오버레이가 사라짐 | 스크림을 덮지 말고 **뒤 화면 보드의 `opacity`를 낮춘다** |
| `layoutGrow` Spacer가 폭 1로 복귀 | 하단 고정 요소는 Spacer 높이를 **계산해 명시** |
| hug 칸이 텍스트 교체 시 안 따라옴 | 가변 텍스트 칸은 **고정 폭 + 텍스트 정렬** |
| `primaryAxisSizingMode` 등이 안 먹음 | `node.horizontalSizing = "fix"\|"auto"` (penpot 쪽) |
| 비-오토레이아웃 프레임에서 `appendChild`가 자식을 안 옮김 | 붙인 뒤 `c.x = parent.x + dx; c.y = parent.y + dy` |

## 금지
- 작업 Page 이름 없이 저작 시작
- raw hex 직접 사용 — `COLOR.*`로만 호출한다
- 화면당 solid primary 버튼 2개 이상
- 빈 영역을 primary 컬러 면으로 채우기
- 컴포넌트 이름 변경·자식 remove (플러그인이 멈춘다)
- 한 번에 몰아서 실행 — **작게 쪼개 실행 + 검증**을 반복한다
