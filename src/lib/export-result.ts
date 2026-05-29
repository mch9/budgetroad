// 결과 탭을 이미지/PDF로 저장.
// html2canvas-pro 사용 — html2canvas/html-to-image와 달리 oklch/oklab 색을 지원해
// Tailwind v4 토큰이 섞여도 깨지지 않음.
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

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

// 각 탭 캔버스를 한 PDF의 개별 페이지로(페이지 크기 = 캡처 크기) 묶어 저장.
export function canvasesToPdf(canvases: HTMLCanvasElement[], filename: string) {
  let pdf: jsPDF | null = null;
  for (const canvas of canvases) {
    const w = canvas.width;
    const h = canvas.height;
    const orientation = w > h ? 'landscape' : 'portrait';
    if (!pdf) {
      pdf = new jsPDF({ unit: 'px', format: [w, h], orientation });
    } else {
      pdf.addPage([w, h], orientation);
    }
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
  }
  pdf?.save(filename);
}
