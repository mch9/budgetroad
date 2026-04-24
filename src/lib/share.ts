export type ShareInput = {
  totalWon: number;
  siteUrl: string;
};

export function buildShareText({ totalWon, siteUrl }: ShareInput) {
  const title = '버짓로드 — 내 결혼 예산 초안';
  const text = [
    '💍 우리 결혼식, 미리 그려봤어요',
    '',
    `예상 총 비용 ${totalWon.toLocaleString()}원`,
    '',
    '나도 내 예산 그려보기 👉',
  ].join('\n');
  return { title, text, url: siteUrl };
}

export function buildShareClipboard(input: ShareInput): string {
  const { text, url } = buildShareText(input);
  return `${text}\n${url}`;
}
