// 결과 페이지 전체를 이미지(PNG) 한 장으로 캡처 ("전체 화면 저장").
// html2canvas-pro 사용 — html2canvas/html-to-image와 달리 oklch/oklab 색을 지원해
// Tailwind v4 토큰이 섞여도 깨지지 않음.
import html2canvas from 'html2canvas-pro';

// html2canvas는 flex/grid의 gap을 렌더하지 않아 간격이 0으로 붕괴된다(카드가 붙고
// 정렬이 깨짐). 캡처 클론에서 gap을 등가 margin으로 변환해 화면과 동일한 간격을 재현.
function gapToMargin(doc: Document) {
  const win = doc.defaultView;
  if (!win) return;
  doc.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const cs = win.getComputedStyle(el);
    const disp = cs.display;
    const isFlex = disp === 'flex' || disp === 'inline-flex';
    const isGrid = disp === 'grid' || disp === 'inline-grid';
    if (!isFlex && !isGrid) return;
    const rowGap = parseFloat(cs.rowGap) || 0;
    const colGap = parseFloat(cs.columnGap) || 0;
    if (!rowGap && !colGap) return;
    const kids = Array.from(el.children).filter(
      (n): n is HTMLElement => n instanceof HTMLElement,
    );
    if (isFlex) {
      const col = cs.flexDirection.startsWith('column');
      kids.forEach((k, i) => {
        if (i === 0) return;
        if (col) k.style.marginTop = `${rowGap}px`;
        else k.style.marginLeft = `${colGap}px`;
      });
    } else {
      const cols = cs.gridTemplateColumns.split(' ').filter(Boolean).length || 1;
      kids.forEach((k, i) => {
        if (i >= cols && rowGap) k.style.marginTop = `${rowGap}px`;
        if (i % cols !== 0 && colGap) k.style.marginLeft = `${colGap}px`;
      });
    }
    el.style.gap = '0px';
  });
}

export async function captureNode(
  node: HTMLElement,
  scale = 2,
  viewportWidth?: number,
): Promise<HTMLCanvasElement> {
  return html2canvas(node, {
    backgroundColor: '#F9FAFB',
    scale,
    useCORS: true,
    logging: false,
    // 미디어쿼리(sm: 등)를 이 폭으로 평가 — 데스크톱 뷰포트에서도 모바일 레이아웃으로
    // 캡처되게(요소 폭과 뷰포트 폭 불일치로 sm: 레이아웃이 구겨지는 문제 방지).
    ...(viewportWidth ? { windowWidth: viewportWidth } : {}),
    onclone: (doc) => gapToMargin(doc),
  });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
