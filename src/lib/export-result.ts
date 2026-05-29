// 결과 페이지 전체를 이미지(PNG) 한 장으로 캡처 ("전체 화면 저장").
// html2canvas-pro 사용 — html2canvas/html-to-image와 달리 oklch/oklab 색을 지원해
// Tailwind v4 토큰이 섞여도 깨지지 않음.
import html2canvas from 'html2canvas-pro';

export async function captureNode(node: HTMLElement, scale = 2): Promise<HTMLCanvasElement> {
  return html2canvas(node, {
    backgroundColor: '#F9FAFB',
    scale,
    useCORS: true,
    logging: false,
  });
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
