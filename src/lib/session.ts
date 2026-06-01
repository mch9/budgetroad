const SESSION_KEY = 'budgetroad_session';
const TIMEOUT_MS = 30 * 60 * 1000; // 30분 비활동 시 새 세션

export type SessionRecord = { id: string; ts: number; seq: number };

// 순수 코어 — 저장 레코드 + 현재시각 + 새 id → 갱신 레코드 (I/O 없음, 검증 용이)
export function rotateSession(
  stored: SessionRecord | null,
  now: number,
  newId: string,
): SessionRecord {
  if (!stored || now - stored.ts > TIMEOUT_MS) {
    return { id: newId, ts: now, seq: 0 };
  }
  return { id: stored.id, ts: now, seq: stored.seq + 1 };
}

// 브라우저 래퍼 — localStorage 읽기 → rotate → 쓰기 → 컨텍스트 반환
export function nextSessionContext(): { session_id: string; event_seq: number } {
  if (typeof window === 'undefined') return { session_id: '', event_seq: 0 };
  let stored: SessionRecord | null = null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) stored = JSON.parse(raw) as SessionRecord;
  } catch {
    /* ignore */
  }
  const next = rotateSession(stored, Date.now(), crypto.randomUUID());
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return { session_id: next.id, event_seq: next.seq };
}
