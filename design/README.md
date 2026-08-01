# Design

디자인 시스템 문서 모음. 각 파일은 300줄 이내로 유지한다.

## 포함 문서

| 파일 | 설명 |
|---|---|
| `token.md` | 디자인 토큰 — Color, Typography, Spacing, Radius |
| `component.md` | 컴포넌트 정의 — 재사용 가능한 UI 컴포넌트 목록과 규격 |
| `iconography.md` | 아이콘 체계 — 아이콘 스타일, 사이즈, 사용 규칙 |
| `voice.md` | 보이스 & 톤 — 당근 문구 분석 기반 writing 가이드 |
| `layout.md` | 레이아웃 — 그리드, 여백, 화면 구성 규칙 |

## token.md 구조

```
Color     — primary, accent, neutral, semantic 색상 팔레트
Typography — font family, size scale, weight, line height
Spacing    — 간격 체계 (4px 기반)
Radius     — border radius 단계
```

## voice.md 작성 방법

1. 기존 당근 앱의 문구(버튼, 안내문, 에러 메시지 등)를 수집한다
2. 패턴을 분석한다 (어조, 존댓말 여부, 문장 길이, 이모지 사용 등)
3. writing 가이드라인으로 정리한다
4. 하네스가 화면 생성 시 이 가이드를 참조하여 문구를 작성한다

## 규칙

- 각 파일 **300줄 이내**
- 토큰 값은 Penpot 토큰 셋(`daangn-tokens`)과 동기화한다
- 하드코딩된 값 대신 토큰 이름을 참조한다
