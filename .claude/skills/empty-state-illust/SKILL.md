---
name: empty-state-illust
description: 빈 상태·검색결과 없음·오류·완료·권한 화면에 들어갈 3D풍 일러스트를 Penpot 도형으로 조립한다. 빈 영역을 primary 컬러 면으로 때우는 것을 막는다. "빈 상태 아이콘 만들어줘", "일러스트 필요해", "/empty-state-illust" 에 트리거된다.
---

# empty-state-illust — 빈 영역을 컬러 면으로 때우지 않기

> 디자이너 피드백 v1.1 §3 대응.
> **이 하네스에는 이미지 생성 모델이 없다.** 그래서 벡터 조립이 주 경로다.

## 경로 선택

| 경로 | 조건 | 방법 |
|---|---|---|
| **A. 벡터 조립** | 기본 | 아래 레시피로 Penpot 도형 조립 |
| B. 외부 생성본 반입 | `develop/assets/illust-3d/`에 PNG가 이미 있을 때 | `uploadMediaUrl` |

B를 쓸 때만 §외부 반입을 읽는다. 없으면 A로 간다. **없다고 건너뛰지 않는다.**

## 입력
- 상태 종류 (`empty-list` / `search-empty` / `first-add` / `error` / `done` / `auth`)
- `develop/scripts/tokens.js` 의 `COLOR`
- 작업 Page 이름

## A. 벡터 조립 레시피

### 공통 조형 상수 — 세트 전체에서 절대 바꾸지 않는다
바꾸는 것은 **주제 도형과 accent 위치뿐**이다. 이게 흔들리면 세트가 깨진다.

```js
const ART = {
  box: 160,              // 일러스트 보드 크기
  faceTop:  "#FFFFFF",   // 좌상단 광원 → 윗면이 가장 밝다
  faceFront:"#F0F2F5",
  faceSide: "#E5E8EC",   // 오른쪽 면이 가장 어둡다
  radius: 12,
  offset: 10,            // 3/4 입체감을 만드는 면 오프셋. 전 컷 동일
  shadowY: 18,           // 접지 그림자 위치
};
```

- 광원은 **좌상단 하나.** 윗면 > 앞면 > 옆면 순으로 밝다.
- accent는 **한 부분에만**, 아이콘 면적의 **20% 미만**.
- 배경 투명. 카드 배경이 필요하면 `COLOR.surface`로 바깥에서 처리한다.
- 사람·문자·숫자·로고를 그리지 않는다.

### 기본 골격 (모든 상태 공통)

```js
// 작업 Page 고정 — 스크립트 첫 줄에서 매번 다시 한다
const page = penpot.currentFile.pages.find(p => p.name === PAGE_NAME);
penpot.openPage(page);

function base(name, x, y) {
  const g = figma.createFrame();
  g.name = `illust/${name}`;
  g.resize(ART.box, ART.box);
  g.x = x; g.y = y;
  g.fills = [];                         // 투명

  // 접지 그림자 — blur 없이 2겹으로 부드럽게
  const s1 = figma.createEllipse();
  s1.resize(96, 16); s1.x = 32; s1.y = ART.box - ART.shadowY;
  s1.fills = [{ fillColor: COLOR.textSub, fillOpacity: 0.10 }];
  const s2 = figma.createEllipse();
  s2.resize(64, 10); s2.x = 48; s2.y = ART.box - ART.shadowY + 3;
  s2.fills = [{ fillColor: COLOR.textSub, fillOpacity: 0.12 }];
  g.appendChild(s1); g.appendChild(s2);
  return g;
}

function face(w, h, x, y, color) {
  const r = figma.createRectangle();
  r.resize(w, h); r.x = x; r.y = y;
  r.fills = [{ fillColor: color, fillOpacity: 1 }];
  r.cornerRadius = ART.radius;
  return r;
}
```

> ⚠️ 비-오토레이아웃 프레임은 `appendChild`가 자식을 옮기지 않는다.
> 붙인 뒤 `c.x = parent.x + dx; c.y = parent.y + dy` 로 좌표를 다시 잡는다.

### 상태별 주제 도형

| 상태 | 주제 | 구성 | accent 위치 |
|---|---|---|---|
| `empty-list` | 빈 리스트 카드 | 카드 3장 겹침, 위 카드만 `faceTop` | 맨 위 카드 왼쪽 작은 바 |
| `search-empty` | 돋보기 + 빈 카드 | 카드 1장 + 원형 렌즈 + 손잡이 | 렌즈 테두리 |
| `first-add` | 플러스 카드 | 카드 1장 + 중앙 십자 | 십자 전체 |
| `error` | 끊긴 연결 | 블록 2개가 어긋나게 분리 | 어긋난 틈 사이 작은 도형 |
| `done` | 체크 배지 | 원형 배지 + 체크 획 | 체크 획 |
| `auth` | 자물쇠 | 몸통 사각 + 위쪽 고리 | 열쇠구멍 |

주제를 늘리지 않는다. **장식·부가 요소 금지.**

### 조립 순서
1. `base()` 로 프레임 + 접지 그림자
2. `faceSide` → `faceFront` → `faceTop` 순으로 면을 쌓는다 (뒤에서 앞으로)
3. accent 도형 **1개**를 얹는다
4. 컴포넌트로 만든다 — 이름 `illust/{state}`. **이름은 이때 확정한다**
5. `export_shape`로 확인. 비면 재-export 한 번

### 배치
빈 상태 화면 안에서:
```
일러스트(160)  →  간격 24  →  안내 문구  →  간격 16  →  btn/secondary 1개
```
전부 **가운데 정렬**, 화면 세로 중앙보다 살짝 위(-40px)에 둔다.

## B. 외부 반입

```js
const img = await penpot.uploadMediaUrl(`illust-${state}`, url);
rect.fills = [{ fillOpacity: 1, fillImage: img }];
```

- 원본은 정사각 투명 PNG. 배경을 흰색으로 굽지 않는다.
- 생성에 쓴 프롬프트 원문을 `develop/assets/_prompts.md`에 남긴다. 없으면 재생성이 불가능하다.
- 출처가 외부면 `develop/assets/_sources.json`에 출처·취득일·라이선스를 기록한다.
  **기록 없는 에셋은 화면에 넣지 않는다.**

## 세트 검수 — 마지막에 반드시 한다
6컷을 **한 캔버스에 나열해 비교**한다.

- 각도·광원 방향이 다른 컷 → 재조립
- accent 면적이 20%를 넘는 컷 → 축소
- 혼자 튀는 컷 → 공통 상수로 되돌린다

## 금지
- 빈 영역을 `primary` 컬러 면으로 채우기 (이 스킬이 존재하는 이유다)
- 캐릭터 신규 생성 — `기존파일` Page에 브랜드 캐릭터가 있을 때만 사용
- 컷마다 각도·광원·재질을 다르게 하기
- 일러스트에 문자·숫자·로고 넣기
