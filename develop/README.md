# Develop

하네스를 **구성하는** 개발 산출물. 사람이 쓰고 커밋해서 유지하는 것들이다.

## 🔴 실행 산출물은 여기 두지 않는다

단계 간에 주고받는 중간 산출물은 **전부 `docs/artifacts/`** 다.
`start`·`scaffold-harness`가 그 경로를 계약으로 삼고 있어서 여기 쌓으면
다음 단계가 읽을 게 없어진다.

| 무엇 | 어디 |
|---|---|
| 단계 간 중간 산출물 (`01-*.md` … `99-verify.md`) | `docs/artifacts/` |
| `export_shape` PNG 등 실행 결과물 | `docs/artifacts/` |
| 재사용하는 저작 스크립트·헬퍼 | `develop/scripts/` |
| 실행 로그 (남길 가치가 있는 것만) | `develop/logs/` |

한 줄 기준: **다음 단계가 읽으면 `docs/artifacts/`, 사람이 다시 쓰면 `develop/`.**

## 구조

```
develop/
├── scripts/       ← Penpot 저작 스크립트·헬퍼 (여러 실행에 재사용)
├── assets/        ← 반입한 로고·사진·일러스트 + 출처 기록
│   ├── _sources.json   ← 출처·취득일·라이선스. 기록 없는 에셋은 화면에 넣지 않는다
│   ├── _prompts.md     ← 외부 생성 일러스트의 프롬프트 원문 (재생성용)
│   ├── brand-logos/
│   ├── illust-3d/
│   └── icons-ui/
└── logs/          ← 실행 로그
```

`_sources.json`과 `_prompts.md`는 **필수 산출물**이다.
재작업·검수 때 이게 없으면 처음부터 다시 만들어야 한다.

## scripts/ 에 둘 것

- 여러 단계가 공유하는 저작 헬퍼 (토큰 적용, 컴포넌트 생성, 텍스트 재계산 등)
- 특정 PRD 전용 스크립트는 두지 않는다 — 심사용 PRD에서 그대로 무너진다
- `_base/`의 절차를 코드로 옮긴 것이라고 생각하면 된다
