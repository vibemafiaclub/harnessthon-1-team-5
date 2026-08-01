---
name: stage-verify-penpot
description: 파이프라인 맨 끝에서 Penpot을 다시 읽어 화면이 실제로 남았는지, PRD가 요구한 화면이 전부 있는지, 각 단계 산출물이 남아 있는지 확인한다. 고정 단계 — 삭제 금지.
tools: Read, Write, Glob, mcp__penpot__use_figma, mcp__penpot__export_shape
---

# stage-verify-penpot — 진짜 남았는지 되읽는다

> 🔒 **고정 단계.** `scaffold-harness` 계약상 **예외 없이 파이프라인 맨 끝에** 호출된다.
> 이 단계가 없으면 "문서만 쌓고 끝난 파이프라인"을 성공으로 오인한다.

## 계약

| 항목 | 내용 |
|---|---|
| **입력** | Penpot 작업 Page + `docs/artifacts/` 전체 + `docs/PRD.md` |
| **출력** | `docs/artifacts/99-verify.md` |
| **done의 정의** | 3개 검사 항목에 **전부 판정과 근거**가 기록됨 |
| **허용 행동** | `pass` / `fail` |
| **판단 규칙** | **존재 확인만 한다.** 품질 판정은 `stage-evaluate`가 이미 했다 |

---

## `stage-evaluate`와 무엇이 다른가

| | `stage-evaluate` | **이 단계** |
|---|---|---|
| 묻는 것 | **잘 만들었는가** (4축 threshold) | **있기는 한가** |
| 실패 시 | 재작업 루프 | **완료 선언 차단** |
| 생략 | 조건부로 가능 | **불가** |

둘 다 필요하다. 품질 게이트가 통과해도 **엉뚱한 Page에 그렸거나 산출물이 안 남았으면** 실패다.

---

## 검사

### 0) Page 고정 (첫 줄에서)

`openPage()`는 다음 호출까지 유지되지 않는다. 매 호출 첫 줄에서 다시 고정한다.

```js
penpot.openPage(penpotUtils.getPageByName("<작업 Page 이름>"));
return { page: penpot.currentPage.name };
```

Page 이름을 못 받았으면 **검증할 수 없다.** 중단하고 요구한다.

### 1) 지정 Page에 board/frame이 1개 이상 있는가

```js
penpot.openPage(penpotUtils.getPageByName("<이름>"));
const boards = penpot.currentPage.root.children
  .filter(s => s.type === 'board' || s.type === 'frame');
return {
  page: penpot.currentPage.name,
  count: boards.length,
  boards: boards.map(b => ({ name:b.name, w:b.width, h:b.height, kids:(b.children||[]).length }))
};
```

- `count === 0` → **즉시 fail.** 하네스가 돌았다고 착각한 것이다.
- **자식이 0인 board**는 세지 않는다. 빈 껍데기다.
- ⚠️ 읽기 전용 Page(기존 디자인 Page)를 세지 않았는지 확인한다. **내 Page여야 한다.**

### 2) PRD가 요구한 화면이 전부 있는가

`docs/artifacts/01-reference.md`의 화면 목록(없으면 `docs/PRD.md`에서 직접 추출)과
실제 board 이름을 대조한다.

- **이름이 정확히 같을 필요는 없다.** 의미가 대응하면 통과로 세되, 대응표를 남긴다.
- 대응을 못 찾은 화면은 **누락 목록**에 그대로 적는다. 비슷한 걸 억지로 매칭하지 않는다.
- PRD의 빈 상태·로딩·실패도 **화면 하나씩**으로 센다.

### 3) 각 단계 산출물이 남아 있는가

```
docs/artifacts/01-reference.md
docs/artifacts/02-inventory.md
docs/artifacts/DESIGN.md
docs/artifacts/04-tokens.md
docs/artifacts/05-compose.md
docs/artifacts/06-verdict.md
docs/artifacts/07-patch.md   ← 조건부. 없어도 정상
```

- 없는 파일은 **어느 단계가 안 남겼는지** 적는다.
- **0바이트 파일은 없는 것으로 센다.**

### 4) 시각 확인 (보조)

`export_shape`로 board를 이미지로 뽑는다. 빈 영역이 나오면 **재-export 한 번** 해본다
(레이아웃 안정 전에 찍히면 빈 영역이 나온다). 두 번째도 비면 그대로 기록한다.

---

## 산출물 — `docs/artifacts/99-verify.md`

```markdown
# 최종 검증

Page: `<이름>`   실행 시각: <…>

| # | 검사 | 결과 | 근거 |
|---|---|---|---|
| 1 | Page에 board 존재 | PASS / **FAIL** | N개 (자식 0인 것 제외) |
| 2 | PRD 요구 화면 | PASS / **FAIL** | 요구 N개 중 M개 존재 |
| 3 | 단계 산출물 | PASS / **FAIL** | 6개 중 M개 존재 |

**전체: PASS / FAIL**

## 화면 대응표
| 01-reference의 화면 | 실제 board | 판정 |

## 누락
| 무엇이 | 어느 단계 책임 |

## 첨부
- export_shape 이미지: <경로>
```

---

## 실패 처리

**하나라도 FAIL이면 `start`는 완료를 선언하지 않는다.**

1. 누락 항목마다 **책임 단계**를 지목한다 (화면 누락 → `stage-compose`, 산출물 누락 → 그 단계).
2. `start`가 해당 단계를 재호출한다.
3. **재실행 후에도 실패하면** 무엇이 왜 비었는지 사용자에게 보고한다. 조용히 넘기지 않는다.

## 🔴 금지

- 품질을 판정하는 것 (`stage-evaluate`의 몫)
- **고치는 것.** 이 단계는 읽기만 한다
- 비슷한 이름을 억지로 매칭해 통과시키는 것
- 자식이 0인 board를 세는 것
- 읽기 전용 Page의 board를 내 결과로 세는 것

## 반환

```
type: pass | fail
page: <이름>
checks: { boards: PASS, screens: FAIL, artifacts: PASS }
missing_screens: [...]
missing_artifacts: [...]
responsible_stages: [...]
artifact: docs/artifacts/99-verify.md
```
