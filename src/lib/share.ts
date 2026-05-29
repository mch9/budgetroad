export type ShareInput = {
  totalWon: number;
  siteUrl: string;
};

export function buildShareText({ totalWon, siteUrl }: ShareInput) {
  const title = '버짓로드 — 우리 결혼 예산 결과';
  const text = [
    '💍 우리 결혼 예산 초안이 나왔어요',
    '',
    `예상 총 비용 ${totalWon.toLocaleString()}원`,
    '',
    '결과 보러 가기 👉',
  ].join('\n');
  return { title, text, url: siteUrl };
}

export function buildShareClipboard(input: ShareInput): string {
  const { text, url } = buildShareText(input);
  return `${text}\n${url}`;
}
