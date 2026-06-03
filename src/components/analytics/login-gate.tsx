'use client';

import { useState } from 'react';

export function LoginGate({ configured }: { configured: boolean }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    const res = await fetch('/api/internal/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) {
      window.location.reload();
    } else {
      setErr('비밀번호가 올바르지 않습니다.');
    }
  }

  return (
    <div className="mx-auto mt-24 max-w-xs">
      <h1 className="mb-1 text-lg font-bold text-[#373737]">버짓로드 분석</h1>
      <p className="mb-4 text-xs text-[#737373]">내부 전용 · 비밀번호가 필요합니다.</p>

      {!configured ? (
        <div className="rounded-lg border border-[#F0C0C0] bg-[#FFF5F5] p-3 text-xs text-[#9B2C2C]">
          환경변수 <code className="font-mono">INTERNAL_DASHBOARD_PASSWORD</code> 가
          설정되지 않았습니다. 서버(.env.local 또는 Vercel 환경변수)에 추가한 뒤 다시
          시도하세요.
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-2">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호"
            className="w-full rounded-md border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#AAC7E1]"
            autoFocus
          />
          {err && <p className="text-xs text-[#9B2C2C]">{err}</p>}
          <button
            type="submit"
            disabled={loading || !pw}
            className="w-full rounded-md bg-[#373737] py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? '확인 중…' : '들어가기'}
          </button>
        </form>
      )}
    </div>
  );
}
