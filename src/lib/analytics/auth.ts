import { createHash, timingSafeEqual } from 'crypto';

// 내부 대시보드 비번 게이트. 서버 전용 env INTERNAL_DASHBOARD_PASSWORD 만 사용.
// 쿠키엔 평문 비번이 아니라 sha256 토큰을 저장한다.
export const DASH_COOKIE = 'br_dash';

function expectedPassword(): string {
  return process.env.INTERNAL_DASHBOARD_PASSWORD ?? '';
}

export function isConfigured(): boolean {
  return expectedPassword().length > 0;
}

export function passwordToken(): string {
  const pw = expectedPassword();
  return pw ? createHash('sha256').update(pw).digest('hex') : '';
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

// 로그인 폼 비번 검증
export function verifyPassword(input: string): boolean {
  const pw = expectedPassword();
  if (!pw) return false; // 미설정 = 항상 거부 (fail closed)
  return safeEqual(input, pw);
}

// 요청 쿠키 토큰 검증
export function isAuthed(cookieValue: string | undefined): boolean {
  const token = passwordToken();
  if (!token || !cookieValue) return false;
  return safeEqual(cookieValue, token);
}
