# 예시 PRD

개발·테스트용 예시 PRD 2종입니다. **심사용 PRD는 미공개**이며, 당일 `docs/PRD.md`에
운영이 배포합니다.

| 파일 | 과제 | 읽을 기존 자산 Page |
|---|---|---|
| [`daangn-stock.md`](./daangn-stock.md) | 당근마켓 팀의 **증권 서비스** | `1-daangn` |
| [`airbnb-dating.md`](./airbnb-dating.md) | Airbnb 팀의 **소개팅 서비스** | `2-airbnb` |

## 쓰는 법

하네스를 돌려볼 때 둘 중 하나를 `docs/PRD.md`에 복사해 넣고 `/start` 를 실행합니다.

```bash
cp docs/examples/daangn-stock.md docs/PRD.md
```

**두 개를 다 돌려보세요.** 하나에서만 돌아가는 하네스는 심사용 PRD에서 무너집니다.
같은 하네스가 두 PRD 모두에서 작동해야 재현성이 있는 것입니다.

⚠️ **이 파일들의 고유명사를 agent 지침이나 코드에 박지 마세요.**
"당근"·"Airbnb"·"화면 5개" 같은 값이 하드코딩되어 있으면 심사에서 그대로 실패합니다.
