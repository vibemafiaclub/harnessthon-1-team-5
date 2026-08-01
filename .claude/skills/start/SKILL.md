---
name: start
description: PRD를 입력받아 단계별 sub agent를 순서대로 호출해 Penpot 디자인을 완성하는 하네스 진입점. "/start", "시작해줘", "디자인 만들어줘", "PRD 실행", "하네스 돌려줘" 등에 트리거된다.
---

# start — 하네스 진입점

> 🔒 **공용 파일입니다. 수정하려면 조장 승인이 필요합니다.**
>
> 설계 근거 전문: `../../../survey/HARNESS_DESIGN_v2.md` · 결정 기록: `../../../survey/DECISIONS.md`
>
> ⚠️ **아래 단계 표는 이미 채워져 있습니다. `/scaffold-harness`를 다시 돌리지 마세요.**
> 재실행하면 서베이로 확정한 설계를 초안으로 덮어씁니다.

## 입력

| 인자 | 필수 | 기본값 |
|---|---|---|
| PRD 경로 | ✅ | `docs/PRD.md` |
| **작업 Page 이름** | ✅ | **없음 — 매 실행마다 확인한다** |
| 모드 | | `full` (`pilot`만 돌리려면 `pilot`) |

> 🔴 **Page 이름 없이 시작하지 않는다.** Penpot은 실시간 협업이라 엉뚱한 Page에 저작하면
> 그 즉시 남의 작업을 덮는다. 인자로 안 받았으면 `penpotUtils.getPages()`로 목록을 보여주고
> **물어본 뒤 답을 받고** 시작한다. 추측하지 않고 첫 Page를 기본값으로 쓰지 않는다.

## 실행 원칙

1. **각 단계는 반드시 sub agent에게 위임한다.** 오케스트레이터가 직접 저작하지 않는다.
2. 각 sub agent에게 **입력(읽을 파일)·출력(쓸 파일)·작업 Page 이름**을 명시적으로 넘긴다.
3. **의존관계가 없는 단계는 병렬로** 호출한다.
4. 중간 산출물은 전부 `docs/artifacts/`에 남긴다. 남지 않으면 다음 단계가 읽을 게 없다.
5. **각 단계는 자기 계약에 적힌 입력만 읽는다.** 전체 대화 이력이나 남의 산출물을 마음대로 읽지 않는다.
   — 한 단계의 오류가 다른 단계로 번지는 것을 막는다(scoped context).
6. **만든 agent가 자기 것을 판정하지 않는다.** 검증은 `stage-evaluate`가 한다.
7. 한 단계가 출력 파일을 남기지 못했으면 **다음 단계로 넘어가지 않는다.** 멈추고 보고한다.

## 단계 정의

| # | 단계 | sub agent | 입력 | 출력 | 병렬 |
|---|---|---|---|---|---|
| 1 | 레퍼런스·원칙 도출 | `stage-reference` | `docs/PRD.md` | `docs/artifacts/01-reference.md` | **2와 병렬** |
| 2 | 기존 디자인 인벤토리 | `stage-inventory` | Penpot 기존 디자인 Page | `docs/artifacts/02-inventory.md` | **1과 병렬** |
| 3 | DESIGN.md 작성 | `stage-designmd` | 01 + 02 | `docs/artifacts/DESIGN.md` | — |
| 4 | Penpot 토큰 저작 | `stage-tokens` | `DESIGN.md` | Penpot 토큰 set 3층 + `docs/artifacts/04-tokens.md` | — |
| 5 | 화면 저작 | `stage-compose` | `DESIGN.md` + 01 | Penpot 화면 + `docs/artifacts/05-compose.md` | — |
| 6 | 검증 | `stage-evaluate` | 05 결과 + 01 + `DESIGN.md` | `docs/artifacts/06-verdict.md` | — |
| 7 | 원인 귀인·지침 수리 | `stage-attribute` | 06 + 01~05 전부 | `docs/artifacts/07-patch.md` | **조건부** |
| 99 | 최종 검증 | `stage-verify-penpot` | 지정 Page + `docs/artifacts/` 전부 | `docs/artifacts/99-verify.md` | **고정. 삭제 금지** |

## 실행 순서

```
0. 작업 Page 확정 (없으면 질문하고 대기)

1. stage-reference  ∥  stage-inventory        ← 병렬. 입력이 서로 다르다
   → 01-reference.md, 02-inventory.md 생성 확인

2. stage-designmd
   → DESIGN.md 생성 확인
   ◆ 게이트 G1:  npx -y -p @google/design.md designmd lint docs/artifacts/DESIGN.md
     errors=0 AND warnings=0 이어야 통과.  ★warning도 실패로 취급한다
     실패 → stage-designmd 재호출 (에러 메시지를 그대로 전달)

3. stage-tokens
   → tokenOverview()로 set 3층 + 전부 active 확인

4. stage-compose (mode=pilot)                 ← 대표 화면 1장만
   → 05-compose.md 생성 확인

5. stage-evaluate
   → 06-verdict.md
   ◆ 게이트 G2: export_shape 이미지를 사용자에게 보여주고 방향 확인
     PASS → 6으로
     FAIL → stage-attribute → 07-patch.md → 사람 승인 → 지목된 단계부터 재실행

6. stage-compose (mode=full)                  ← 나머지 화면
7. stage-evaluate (2라운드 기준)
8. stage-verify-penpot                        ← 운영 고정 단계. 건너뛰지 않는다
   → 99-verify.md. 실패 항목이 있으면 완료를 선언하지 않는다
9. 완료 보고
```

## 재시도 예산

| 규칙 | 값 |
|---|---|
| 한 단계의 재시도 | 최대 **3회** |
| 같은 축이 연속 FAIL | **2회**째에 `stage-attribute` 대신 **사람에게 에스컬레이션** |
| `stage-attribute`가 같은 단계를 지목 | **3회**째에 그 단계를 재작성 대상으로 승격하고 중단 |
| 예산 소진 시 | **마지막으로 통과한 상태로 확정**하고 무엇이 미달인지 정직하게 보고 |

> 예산을 무한으로 두지 않는 이유: 재시도 예산 소진이 다단계 파이프라인의 가장 흔한 종료 모드이고,
> 경쟁하는 제약 사이를 왕복하는 oscillation에 빠지면 영원히 끝나지 않는다.

## 마지막 단계 — 검증 (고정, 삭제 금지)

모든 단계가 끝나면 **항상** `stage-verify-penpot` 을 호출한다.

- 지정 Page에 board/frame이 1개 이상 있는가
- PRD가 요구한 화면이 전부 있는가
- 각 단계 산출물이 `docs/artifacts/`에 남아 있는가

결과는 `docs/artifacts/99-verify.md`. **실패 항목이 있으면 완료를 선언하지 않는다.**
해당 단계를 다시 호출하고, 재실행 후에도 실패하면 무엇이 왜 비었는지 사용자에게 보고한다.

## 완료 조건

- Penpot 내 **지정된 작업 Page**에 **토큰 + 컴포넌트 + 화면**이 만들어져 있다
- `docs/artifacts/`에 01·02·DESIGN.md·04·05·06이 남아 있다
- `designmd lint`가 errors=0 warnings=0
- `06-verdict.md`의 4축이 전부 통과 (또는 미달 항목이 명시돼 있다)
- `docs/artifacts/99-verify.md`가 전 항목 통과다

## 보고 형식

끝나면 반드시 아래를 보고한다. **통과하지 못한 것을 숨기지 않는다.**

```
작업 Page:      <이름>
생성 산출물:    <경로 목록>
lint:           errors=N warnings=N
evaluate 4축:   레이아웃 __ / 타이포·컬러 __ / 완성도 __ / PRD충족 __
재시도:         단계별 N회
미달 항목:      <있으면 그대로>
사람 개입:      <횟수와 지점>
99-verify:      <전 항목 통과 / 실패 항목>
```
