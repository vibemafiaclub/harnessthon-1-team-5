/**
 * color-audit.js — 컬러 예산 검사
 *
 * 디자이너 피드백 v1.1 §1-3 "그레이스케일 검수"의 Penpot 대체 구현.
 * Penpot에는 그레이스케일 미리보기가 없으므로 계산으로 같은 것을 본다.
 *
 * 사용: use_figma 에 아래 본문을 넣고 실행 → 반환된 JSON을 ⑤ 검증이 표로 옮긴다.
 * 판정 기준은 design/_base/color.md §2 와 같다.
 *
 * ⚠️ 초안이다. 실제 Penpot 연결에서 아직 검증되지 않았다.
 *    첫 실행 때 보드 1개로 먼저 돌려보고 필드명을 맞춘 뒤 전체에 적용한다.
 */

// ── 인자 ────────────────────────────────────────────────
const PAGE_NAME = "{작업 Page 이름}";   // 반드시 넘겨받는다. 추측 금지
const COLOR = {
  primary: "#______",
  bg: "#FFFFFF", surface: "#F7F8FA", border: "#E5E8EC",
  textSub: "#6B7280", text: "#1A1D21",
};

const LIMIT = {
  solidPrimaryButton: 1,   // 화면당 solid primary 버튼
  primaryElement: 5,       // primary 칠해진 요소 총 개수
  primaryAreaRatio: 0.10,  // primary 채색 면적 비율
  neutralSteps: 5,         // 뉴트럴 5단이 실제로 다 쓰였는가
};

// ── 실행 ────────────────────────────────────────────────
const page = penpot.currentFile.pages.find(p => p.name === PAGE_NAME);
if (!page) return { error: `Page '${PAGE_NAME}' 없음. 저작을 시작하지 않는다.` };
penpot.openPage(page);

const norm = c => (c || "").toString().trim().toUpperCase();
const NEUTRALS = [COLOR.bg, COLOR.surface, COLOR.border, COLOR.textSub, COLOR.text].map(norm);

function fillsOf(node) {
  const f = node.fills;
  return Array.isArray(f) ? f : [];
}

// 이 노드가 특정 색으로 "칠해져" 있는가 (불투명도 0.5 이상만 채색으로 친다)
function paintedWith(node, hex) {
  return fillsOf(node).some(f =>
    norm(f.fillColor) === norm(hex) && (f.fillOpacity == null || f.fillOpacity >= 0.5)
  );
}

function walk(node, out = []) {
  out.push(node);
  const kids = node.children || [];
  for (const k of kids) walk(k, out);
  return out;
}

const boards = (page.children || []).filter(n => n.type === "board" || n.type === "frame");
if (!boards.length) return { error: "지정 Page에 board/frame이 없음" };

const result = boards.map(board => {
  const nodes = walk(board).slice(1);           // 보드 자신 제외
  const boardArea = (board.width || 0) * (board.height || 0);

  const primaryNodes = nodes.filter(n => paintedWith(n, COLOR.primary));
  const primaryArea = primaryNodes.reduce((s, n) => s + (n.width || 0) * (n.height || 0), 0);

  // 버튼 판별은 네이밍 규약에 의존한다 (design/_base/iconography.md §4)
  // 이름이 안 지켜져 있으면 이 수치는 신뢰할 수 없다 → nameCompliance 로 함께 보고
  const named = nodes.filter(n => typeof n.name === "string");
  const solidPrimaryButtons = named.filter(n =>
    n.name.startsWith("btn/primary") && paintedWith(n, COLOR.primary)
  );

  const neutralStepsUsed = NEUTRALS.filter(hex =>
    nodes.some(n => fillsOf(n).some(f => norm(f.fillColor) === hex))
  ).length;

  const unnamed = named.filter(n =>
    /^(Rectangle|Ellipse|Board|Frame|Group|Path|Text)\s*\d*$/i.test(n.name)
  ).length;

  const m = {
    screen: board.name,
    solidPrimaryButtonCount: solidPrimaryButtons.length,
    primaryElementCount: primaryNodes.length,
    primaryAreaRatio: boardArea ? +(primaryArea / boardArea).toFixed(3) : null,
    neutralStepsUsed,
    unnamedNodeCount: unnamed,
  };

  m.fail = [
    m.solidPrimaryButtonCount !== LIMIT.solidPrimaryButton
      && `solid primary 버튼 ${m.solidPrimaryButtonCount}개 (기준 1개) → 주 행동 1개만 남기고 btn/secondary로 강등`,
    m.primaryElementCount > LIMIT.primaryElement
      && `primary 요소 ${m.primaryElementCount}개 (기준 ≤5) → 재배치`,
    m.primaryAreaRatio > LIMIT.primaryAreaRatio
      && `primary 면적 ${(m.primaryAreaRatio * 100).toFixed(1)}% (기준 ≤10%) → primaryWeak/surface로 교체`,
    m.neutralStepsUsed < LIMIT.neutralSteps
      && `뉴트럴 ${m.neutralStepsUsed}/5단만 사용 → 컬러로 구조를 대신한 것. surface/border 도입`,
  ].filter(Boolean);

  m.pass = m.fail.length === 0;
  return m;
});

return {
  page: PAGE_NAME,
  screens: result,
  failedScreens: result.filter(r => !r.pass).map(r => r.screen),
  verdict: result.every(r => r.pass) ? "통과" : "실패",
};
