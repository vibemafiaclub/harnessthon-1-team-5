# PRD 샘플 — 하네스 재현성 검증용

> 결정 근거: [`survey/DECISIONS.md`](../../survey/DECISIONS.md) **D5**
> 봉인 해시: [`sealed/SEAL.json`](./sealed/SEAL.json)

---

## 왜 3개인가

심사용 PRD는 **미공개**다. 그래서 "우리 하네스는 처음 보는 PRD에서도 돈다"를
**주장이 아니라 실측으로** 보여야 한다. 그러려면 개발 중에 보지 않은 PRD가 필요하다.

근거 — `src_018` (prompt overfitting 연구):

> "prompt optimization methods **iteratively rewrite prompts using LLM-generated feedback**, but the
> resulting prompts often become longer, **accumulate narrow sample-specific rules**, and
> **generalize poorly beyond the training distribution**"

우리 `stage-attribute`(지침 수리 루프)가 **정확히 저 방법론이다.** 가드 없이 돌리면 지침이
이번 PRD 전용 규칙으로 채워지고 심사용 PRD에서 무너진다.

같은 연구의 대응책:

> "keeping a **sealed holdout set never inspected until release day**"

---

## 3개가 어떻게 다른가 (일부러 어긋나게 설계했다)

| 축 | **PRD-a** 동네반찬 | **PRD-b** 콜드체인 관제 | **sealed** (미공개) |
|---|---|---|---|
| 도메인 | 커머스 | 관제 대시보드 | — |
| 정보 밀도 | **낮음** | **매우 높음** | — |
| 화면 형태 | 사진 그리드 | 데이터 그리드 | — |
| 플랫폼 | 모바일 웹 | 데스크톱 27" ×2 | — |
| 테마 | 라이트 | **다크 기본** | — |
| 톤 | 따뜻함·물성 | 기능적·차가움 | — |
| 색의 역할 | 분위기 | **상태 표현 전용** | — |
| **문서 서식** | 번호 절 + 표 | 서술형 제목 + 표 | **또 다른 형식** |

**문서 서식까지 다르게 쓴 것이 의도적이다.** 하네스가 특정 PRD 서식(예: "## 4. 핵심 기능"이라는
제목)에 의존하면 그것도 과적합이다. 서식이 달라도 **의미를 읽어야** 한다.

---

## 사용 규칙

### 개발 중

- **`PRD-a`와 `PRD-b`만 쓴다.** 두 개로 개발하는 이유: 하나면 그 하나에 과적합했는지
  알 수 없고, 실패해도 원인을 못 짚는다.
- 두 PRD 모두에서 통과할 때까지 하네스를 고친다.

### 🔒 봉인본

- **`sealed/` 안의 파일을 열지 않는다.** 사람도, 에이전트도.
- 하네스 지침(`stage-*.md`, `AGENTS.md`, skill 문서)을 쓸 때 **참조하지 않는다.**
- **마지막에 딱 한 번** 실행한다. 그 결과가 B트랙 "재현성"의 증거다.
- 봉인 해제 후에는 **고치지 않는다.** 실패했으면 실패한 것으로 기록한다.

### 봉인 검증

```bash
python3 -c "
import hashlib,json,os
base='docs/prd-samples'
seal=json.load(open(os.path.join(base,'sealed','SEAL.json'),encoding='utf-8'))
for rel,v in seal['files'].items():
    h=hashlib.sha256(open(os.path.join(base,rel),'rb').read()).hexdigest()
    print(('OK  ' if h==v['sha256'] else 'FAIL'), rel)
"
```

봉인 해제 시 이 검증을 먼저 돌려 **파일이 수정되지 않았음**을 확인하고 결과에 함께 기록한다.

---

## ⚠️ 이 봉인의 한계 (정직하게)

**암호학적 봉인이 아니다.** 이 PRD 3종을 작성한 주체가 하네스도 만든다.
따라서 "봉인본을 본 적 없다"는 것은 **증명되지 않는다.**

이 절차가 실제로 보장하는 것은 두 가지뿐이다:

1. **봉인 이후 파일이 수정되지 않았다** — SHA-256으로 증명됨. 즉 결과에 맞춰
   PRD를 고치는 부정은 배제된다.
2. **하네스 지침에 봉인본 고유명사가 등장하지 않는다** — 문자열 검사로 확인 가능하다.

이 두 가지를 넘어서는 주장(“개발자가 봉인본 내용에 전혀 영향받지 않았다”)은 **하지 않는다.**
더 강한 보장을 원하면 봉인본을 **팀 외부의 사람이 작성**해야 한다.

### 지침 오염 검사 (봉인 해제 전 실행)

```bash
# 봉인본에만 등장하는 고유 문자열이 하네스 지침에 새어들어갔는지
grep -rniE "들추다|완독률|독립출판" .claude/ AGENTS.md README.md docs/artifacts/ 2>/dev/null \
  && echo "⚠️ 오염 발견" || echo "OK — 지침에 봉인본 고유어 없음"
```

---

## 판정 기준

봉인본 실행 결과를 아래로 기록한다. **점수가 낮아도 그대로 적는다.**

| 항목 | PRD-a | PRD-b | **sealed** |
|---|---|---|---|
| `designmd lint` errors / warnings | | | |
| evaluate 4축 통과 여부 | | | |
| 재시도 라운드 수 | | | |
| 사람 개입 횟수 | | | |
| 실패 시 `stage-attribute`가 지목한 단계 | | | |

**sealed 열이 a·b 열과 비슷하면 재현성이 있는 것이고, 확 나쁘면 과적합한 것이다.**
후자여도 그것을 보고하는 것이 B트랙 "재현성" 항목에서 더 나은 답이다 —
측정하지 않은 하네스보다 측정해서 실패를 아는 하네스가 낫다.
