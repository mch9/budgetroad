// 결과 탭을 이미지(PNG)로 저장. (PDF는 브라우저 native 인쇄로 처리 — globals.css @media print)
// html2canvas-pro 사용 — html2canvas/html-to-image와 달리 oklch/oklab 색을 지원해
// Tailwind v4 토큰이 섞여도 깨지지 않음.
import html2canvas from 'html2canvas-pro';

export async function captureNode(node: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(node, {
    backgroundColor: '#F9FAFB',
    scale: 2,
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
