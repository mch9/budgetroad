export type ShareMethod = 'native' | 'clipboard' | 'aborted' | 'failed';

export type ShareInput = {
  totalWon: number;
  summary: string;
  siteUrl: string;
};

export function buildShareText({ totalWon, summary, siteUrl }: ShareInput) {
  const title = '버짓로드 — 내 결혼 예산 초안';
  const text = [
    '💍 내 결혼 예산 초안',
    `약 ${totalWon.toLocaleString()}원`,
    summary,
    '',
    '나도 만들어보기 →',
  ].join('\n');
  return { title, text, url: siteUrl };
}

export async function shareResult(input: ShareInput): Promise<ShareMethod> {
  const payload = buildShareText(input);

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share(payload);
      return 'native';
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return 'aborted';
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(`${payload.text}\n${payload.url}`);
      return 'clipboard';
    } catch {
      return 'failed';
    }
  }

  return 'failed';
}
