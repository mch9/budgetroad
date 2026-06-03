'use client';

import { useEffect, useState } from 'react';
import type { AnalyticsData } from '@/lib/analytics/queries';
import {
  Card,
  CompareBars,
  DataTable,
  FunnelBar,
  KpiCard,
  LineChart,
  RateText,
  RatioBars,
  ScoreCard,
  SectionTitle,
  StatCard,
  pct,
} from './charts';

const PRESETS = [
  { k: 'today', label: '오늘' },
  { k: 'yesterday', label: '어제' },
  { k: '7d', label: '최근 7일' },
  { k: '30d', label: '최근 30일' },
  { k: 'all', label: '전체' },
];

const DARK = '#373737';
const SECONDARY = '#7499BA';
const ACCENT = '#AAC7E1';

function rateStr(num: number, denom: number): string {
  const p = pct(num, denom);
  return p === null ? '—' : `${p.toFixed(0)}%`;
}

export function AnalyticsDashboard() {
  const [preset, setPreset] = useState('7d');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let url = '/api/internal/analytics';
    if (preset === 'custom') {
      if (!from || !to) return;
      url += `?preset=custom&from=${from}&to=${to}`;
    } else {
      url += `?preset=${preset}`;
    }
    let alive = true;
    setLoading(true);
    fetch(url)
      .then((r) => {
        if (r.status === 401) {
          window.location.reload();
          return null;
        }
        return r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`);
      })
      .then((d) => {
        if (alive && d) {
          setData(d);
          setError('');
        }
      })
      .catch((e) => alive && setError(String(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [preset, from, to]);

  const w = data?.window;
  const inputFrom = preset === 'custom' ? from : (w?.from ?? '');
  const inputTo = preset === 'custom' ? to : (w?.to ?? '');

  function editFrom(value: string) {
    setPreset('custom');
    setFrom(value);
    if (!to) setTo(w?.to ?? value);
  }
  function editTo(value: string) {
    setPreset('custom');
    setTo(value);
    if (!from) setFrom(w?.from ?? value);
  }

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-bold text-[#373737]">버짓로드 분석</h1>
        {w && (
          <span className="text-xs text-[#737373]">
            세션 {w.sessions} · 방문자 {w.visitors}
          </span>
        )}
      </div>

      {/* 기간 컨트롤 */}
      <div className="sticky top-0 z-10 mt-3 rounded-lg border border-[#E5E7EB] bg-white/95 p-3 backdrop-blur">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.k}
              onClick={() => setPreset(p.k)}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                preset === p.k
                  ? 'bg-[#373737] text-white'
                  : 'bg-[#F3F4F6] text-[#737373]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-[#737373]">
          <input
            type="date"
            value={inputFrom}
            max={inputTo || undefined}
            onChange={(e) => editFrom(e.target.value)}
            className="rounded border border-[#E5E7EB] px-2 py-1 tabular-nums"
          />
          <span>~</span>
          <input
            type="date"
            value={inputTo}
            min={inputFrom || undefined}
            onChange={(e) => editTo(e.target.value)}
            className="rounded border border-[#E5E7EB] px-2 py-1 tabular-nums"
          />
          {loading && <span className="ml-1 text-[#AAC7E1]">불러오는 중…</span>}
        </div>
        <p className="mt-1.5 text-[10px] text-[#9CA3AF]">
          모든 수치는 선택한 기간({inputFrom || '…'} ~ {inputTo || '…'})만 집계합니다.
          누적 아님. 세션 추적 시작 2026-06-01.
        </p>
      </div>

      {error && (
        <div className="mt-3 rounded-lg border border-[#F0C0C0] bg-[#FFF5F5] p-3 text-xs text-[#9B2C2C]">
          불러오기 실패: {error}
        </div>
      )}

      {data && (
        <>
          {/* ── 개요 ── */}
          <SectionTitle>개요</SectionTitle>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {data.overview.scorecards.map((c) => (
              <ScoreCard key={c.label} label={c.label} value={c.value} />
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Card title="핵심 퍼널">
              <FunnelBar steps={data.overview.funnel} />
            </Card>
            <Card title="일자별 추이">
              <LineChart
                rows={data.overview.daily}
                series={[
                  { key: 'sessions', label: '세션', color: DARK },
                  { key: 'entered', label: '랜딩진입', color: SECONDARY },
                  { key: 'result_viewed', label: '결과확인', color: ACCENT },
                ]}
              />
            </Card>
          </div>
          <div className="mt-3">
            <Card title="온보딩 질문별 답변 도달">
              <DataTable
                columns={[
                  { key: 'question_id', label: '질문' },
                  { key: 'sessions', label: '세션', align: 'right' },
                  { key: 'answers', label: '답변 수', align: 'right' },
                ]}
                rows={data.overview.onboarding}
              />
            </Card>
          </div>

          {/* ── 결정로그 ── */}
          <SectionTitle>결정로그 (KPI + 관찰지표)</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.decisionLog.kpis.map((k) => (
              <KpiCard key={k.name} {...k} />
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Card title="추가비용 케어 탭 조회율 (Leading)">
              <div className="text-lg">
                <RateText {...data.decisionLog.careTabRate} />
              </div>
              <p className="mt-1 text-xs text-[#737373]">케어 탭 클릭 / 랜딩 진입</p>
            </Card>
            <StatCard
              label="결과 페이지 체류시간"
              value={`${data.decisionLog.dwell.avg}초`}
              sub={`중앙값 ${data.decisionLog.dwell.median}초 · n=${data.decisionLog.dwell.n}`}
            />
            <Card title="결과 탐색 도달률 (결과확인 대비)">
              <RatioBars items={data.decisionLog.explore} />
            </Card>
            <Card title="저장/공유 전환율 세부 (결과확인 대비)">
              <RatioBars items={data.decisionLog.saveShare} />
            </Card>
          </div>
          <div className="mt-3">
            <Card title="종합설계서 스크롤 깊이 분포">
              <DataTable
                columns={[
                  { key: 'depth_pct', label: '깊이(%)' },
                  { key: 'sessions', label: '세션', align: 'right' },
                  { key: 'events', label: '이벤트', align: 'right' },
                ]}
                rows={data.decisionLog.scrollDepth}
              />
            </Card>
          </div>

          {/* ── 전략 OKR ── */}
          <SectionTitle>전략 OKR (R1~R4)</SectionTitle>
          <div className="grid gap-2 sm:grid-cols-2">
            {data.strategyOkr.map((k) => (
              <KpiCard key={k.name} {...k} />
            ))}
          </div>

          {/* ── 실행 OKR ── */}
          <SectionTitle>실행 OKR</SectionTitle>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card title="케어 탭 진입자 중 옵션 조정 발생률">
              <div className="text-lg">
                <RateText {...data.executionOkr.careAdjust} />
              </div>
              <p className="mt-1 text-xs text-[#737373]">조정·일괄토글 / 케어 탭 진입</p>
            </Card>
            <Card title="공유 링크 통한 진입 (바이럴)">
              <div className="text-2xl font-bold tabular-nums text-[#171717]">
                {data.executionOkr.viaShareLink}
              </div>
              <p className="mt-1 text-xs text-[#737373]">shared_result_viewed 세션</p>
            </Card>
            <Card title="조정 vs 미조정 — 예산 재확인율">
              <CompareBars
                groups={data.executionOkr.adjustComparison.map((g) => ({
                  label: g.group,
                  num: g.budget_recheck,
                  denom: g.n,
                }))}
              />
              <p className="mt-2 text-[10px] text-[#9CA3AF]">
                예산 재확인 = 항목별 내역 탭 재방문(proxy)
              </p>
            </Card>
            <Card title="조정 vs 미조정 — 저장/공유율">
              <CompareBars
                groups={data.executionOkr.adjustComparison.map((g) => ({
                  label: g.group,
                  num: g.saved_shared,
                  denom: g.n,
                }))}
              />
            </Card>
            <Card title="재진입률 — 저장/공유 vs 미저장">
              <CompareBars
                groups={data.executionOkr.revisit.map((g) => ({
                  label: g.group,
                  num: g.revisited,
                  denom: g.visitors,
                }))}
              />
              <p className="mt-2 text-[10px] text-[#9CA3AF]">
                재진입 = 기간 내 동일 방문자 세션 2개 이상
              </p>
            </Card>
            <Card title="유형 매칭 만족도">
              <div className="text-lg">
                <RateText
                  num={data.executionOkr.satisfaction.matched_yes}
                  denom={data.executionOkr.satisfaction.total}
                />
              </div>
              <p className="mt-1 text-xs text-[#737373]">matched=yes 응답 비율</p>
            </Card>
          </div>
          <div className="mt-3">
            <Card title="조정 깊이(0/1/2+)별 저장/공유 · 이탈">
              <DataTable
                columns={[
                  { key: 'depth', label: '조정 깊이' },
                  { key: 'n', label: 'n', align: 'right' },
                  { key: 'save', label: '저장/공유', align: 'right' },
                  { key: 'exit', label: '이탈', align: 'right' },
                ]}
                rows={data.executionOkr.depthComparison.map((d) => ({
                  depth: d.depth,
                  n: d.n,
                  save: `${d.saved_shared} (${rateStr(d.saved_shared, d.n)})`,
                  exit: `${d.exited} (${rateStr(d.exited, d.n)})`,
                }))}
              />
            </Card>
          </div>

          <p className="mt-8 text-center text-[10px] text-[#9CA3AF]">
            n&lt;10 지표는 흐리게 표시됨 — 표본이 작아 변동성이 큼. 추세 판단용.
          </p>
        </>
      )}
    </div>
  );
}
