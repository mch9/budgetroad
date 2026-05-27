#!/usr/bin/env node
// 가격 정보 DB.csv → src/lib/budget-engine/data/*.ts 변환 스크립트
// 실행: npm run build:pricing
// CSV 갱신 시 재실행 후 생성된 4개 TS 파일을 commit한다.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CSV_PATH = path.join(ROOT, '가격 정보 DB.csv');
const OUT_DIR = path.join(ROOT, 'src/lib/budget-engine/data');

// ── 매핑 정의 ──

// 사용자 응답 지역 → CSV 지역 (다중 지역 평균)
// 예식장 카테고리는 도시 단위, 스드메는 광역 단위로 데이터가 섞여 있어 array로 매핑.
// 가용한 매칭만 평균에 반영(없는 지역은 자동 skip).
const REGION_MAP = {
  서울: ['서울', '서울(강남외)', '서울(강남)'],
  수도권: ['수도권', '경기도'],
  광역시: ['5대 광역시', '부산', '대구', '대전', '광주', '울산', '인천'],
  이외: ['이외 지역', '비수도권', '강원도', '충청도', '전라도', '경상도', '제주도'],
};

const PEAK_MONTHS = ['3월', '4월', '5월', '6월', '9월', '10월', '11월'];
const OFF_PEAK_MONTHS = ['7월', '8월', '12월', '1월', '2월'];

// spec 토글 ID → CSV 항목명 매핑 (1:N 가능)
// note: 본식 도우미 = 본식드레스도우미 평균, 축하공연 섭외 = 축가/축하공연 + 축주비 합산, 혼주 메이크업 = 남성혼주+여성혼주 평균
const TOGGLE_CSV_MAP = {
  // [스튜디오]
  '원본 구매': { category: '스튜디오', items: ['원본구매비'], agg: 'sum' },
  '담당자 지정': { category: '스튜디오', items: ['담당자 지정'], agg: 'sum' },
  '서브 스냅': { category: '스튜디오', items: ['서브 스냅'], agg: 'sum' },
  '야외 촬영': { category: '스튜디오', items: ['야외촬영'], agg: 'sum' },
  '얼리스타트': { category: '스튜디오', items: ['얼리스타트비'], agg: 'sum' },
  // [드레스]
  '드레스 지정': { category: '드레스', items: ['드레스 지정비'], agg: 'sum' },
  '본식 헬퍼': { category: '드레스', items: ['본식 헬퍼'], agg: 'sum' },
  '2부 드레스': { category: '드레스', items: ['2부 드레스'], agg: 'sum' },
  '퍼스트웨어': { category: '드레스', items: ['퍼스트웨어'], agg: 'sum' },
  '가봉 스냅': { category: '드레스', items: ['가봉스냅'], agg: 'sum' },
  '턱시도 대여': { category: '드레스', items: ['턱시도 대여'], agg: 'sum' },
  // [메이크업]
  '혼주 메이크업': {
    category: '메이크업',
    items: ['남성혼주 헤어&메이크업', '여성혼주 헤어&메이크업'],
    agg: 'avg', // 양가 평균 단가
  },
  '헤어변형': { category: '메이크업', items: ['헤어변형'], agg: 'sum' },
  // [예식장 연출]
  '생화 꽃장식': { category: '예식장', items: ['생화꽃장식'], agg: 'sum' },
  '부케': { category: '예식장', items: ['부케'], agg: 'sum' },
  '플라워 샤워': { category: '예식장', items: ['플라워 샤워'], agg: 'sum' },
  '포토테이블': { category: '예식장', items: ['포토테이블'], agg: 'sum' },
  '웨딩 케이크': { category: '예식장', items: ['웨딩케이크'], agg: 'sum' },
  // [예식장 진행·가족]
  '본식 사회자': { category: '예식장', items: ['본식 사회자'], agg: 'sum' },
  '주례': { category: '예식장', items: ['주례비'], agg: 'sum' },
  '축하공연 섭외': {
    category: '예식장',
    items: ['축가/축하공연', '축주비'],
    agg: 'sum', // 공연 비용 + 축의금 합산
  },
  '본식 도우미': {
    category: '예식장',
    items: ['본식 도우미', '본식드레스도우미'],
    agg: 'avg', // handoff 결정: 동일 역할 통합
  },
  '폐백 음식': { category: '예식장', items: ['폐백 음식'], agg: 'sum' },
  '폐백 수모': { category: '예식장', items: ['폐백 수모비'], agg: 'sum' },
  '한복 대여': { category: '예식장', items: ['한복대여'], agg: 'sum' },
};

// ── CSV 파싱 ──

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      result.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCSVLine(line);
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = cells[i];
    return row;
  });
}

// "-"나 빈 값은 null. 숫자 변환.
function parsePrice(v) {
  if (!v || v === '-' || v.trim() === '') return null;
  const n = Number(v.replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

// CSV 행을 표준 객체로
function normalize(row) {
  return {
    region: row['지역'],
    month: row['시기'],
    category: row['대분류'],
    item: row['항목'],
    type: row['유형'],
    // P10/P25/P50/P75/P90
    p10: parsePrice(row['6열']),
    p25: parsePrice(row['7열']),
    mid: parsePrice(row['8열']),
    p75: parsePrice(row['9열']),
    p90: parsePrice(row['10열']),
  };
}

// mid 우선, 없으면 p50 추정(p25+p75 평균), 그도 없으면 p10/p90 평균
function pickPrice(r) {
  if (r.mid !== null) return r.mid;
  if (r.p25 !== null && r.p75 !== null) return Math.round((r.p25 + r.p75) / 2);
  if (r.p10 !== null && r.p90 !== null) return Math.round((r.p10 + r.p90) / 2);
  return null;
}

function avg(nums) {
  const valid = nums.filter((n) => n !== null && Number.isFinite(n));
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0) / valid.length);
}

function sum(nums) {
  const valid = nums.filter((n) => n !== null && Number.isFinite(n));
  if (valid.length === 0) return null;
  return Math.round(valid.reduce((a, b) => a + b, 0));
}

// ── 집계 ──

// 특정 지역(들)·월 묶음에서 카테고리·항목의 가격을 추출
// csvRegions가 array면 모든 지역의 가격을 평탄화 (다중 지역 평균 계산용).
function pricesFor(rows, csvRegions, months, category, items) {
  const regions = Array.isArray(csvRegions) ? csvRegions : [csvRegions];
  const result = [];
  for (const m of months) {
    for (const it of items) {
      const matched = rows.filter(
        (r) =>
          regions.includes(r.region) &&
          r.month === m &&
          r.category === category &&
          r.item === it
      );
      for (const r of matched) {
        const p = pickPrice(r);
        if (p !== null) result.push(p);
      }
    }
  }
  return result;
}

// 시즌별 평균 가격
function seasonAvg(rows, csvRegion, category, items) {
  return {
    peak: avg(pricesFor(rows, csvRegion, PEAK_MONTHS, category, items)),
    offPeak: avg(pricesFor(rows, csvRegion, OFF_PEAK_MONTHS, category, items)),
  };
}

// ── 출력 빌더 ──

function buildRegionProfiles(rows) {
  const out = {};
  for (const [userRegion, csvRegion] of Object.entries(REGION_MAP)) {
    out[userRegion] = {
      peak: {
        bojeung: avg(pricesFor(rows, csvRegion, PEAK_MONTHS, '예식장', ['최소보증인원'])),
        perHead: avg(pricesFor(rows, csvRegion, PEAK_MONTHS, '예식장', ['1인당 식대(대인)'])),
        daegwan: avg(pricesFor(rows, csvRegion, PEAK_MONTHS, '예식장', ['대관비용'])),
        baseMeal: avg(pricesFor(rows, csvRegion, PEAK_MONTHS, '예식장', ['기본식대(총금액)'])),
        baseDecoration: avg(pricesFor(rows, csvRegion, PEAK_MONTHS, '예식장', ['기본 장식비'])),
      },
      offPeak: {
        bojeung: avg(pricesFor(rows, csvRegion, OFF_PEAK_MONTHS, '예식장', ['최소보증인원'])),
        perHead: avg(pricesFor(rows, csvRegion, OFF_PEAK_MONTHS, '예식장', ['1인당 식대(대인)'])),
        daegwan: avg(pricesFor(rows, csvRegion, OFF_PEAK_MONTHS, '예식장', ['대관비용'])),
        baseMeal: avg(pricesFor(rows, csvRegion, OFF_PEAK_MONTHS, '예식장', ['기본식대(총금액)'])),
        baseDecoration: avg(pricesFor(rows, csvRegion, OFF_PEAK_MONTHS, '예식장', ['기본 장식비'])),
      },
    };
  }
  return out;
}

// 카테고리 base — 사용자 유형별 베이스에 따라 다른 항목 평균
// 스튜디오: "20페이지 앨범, 20R 액자 제공" (단일)
// 드레스: 본식 / 본식 + 촬영 / 촬영 (유형별 선택)
// 메이크업: (실장)/(부원장)/(원장)본식+촬영 (유형별 등급)
function buildCategoryBase(rows) {
  const studioItem = '20페이지 앨범, 20R 액자 제공';
  const dressItems = ['본식', '본식 + 촬영', '촬영'];
  const makeupItems = ['(실장)본식+촬영', '(부원장)본식+촬영', '(원장)본식+촬영'];

  const out = {};
  for (const [userRegion, csvRegion] of Object.entries(REGION_MAP)) {
    const seasonData = (months) => ({
      studio: avg(pricesFor(rows, csvRegion, months, '스튜디오', [studioItem])),
      dress: {
        본식만: avg(pricesFor(rows, csvRegion, months, '드레스', ['본식'])),
        본식촬영: avg(pricesFor(rows, csvRegion, months, '드레스', ['본식 + 촬영'])),
        촬영만: avg(pricesFor(rows, csvRegion, months, '드레스', ['촬영'])),
      },
      makeup: {
        실장: avg(pricesFor(rows, csvRegion, months, '메이크업', ['(실장)본식+촬영'])),
        부원장: avg(pricesFor(rows, csvRegion, months, '메이크업', ['(부원장)본식+촬영'])),
        원장: avg(pricesFor(rows, csvRegion, months, '메이크업', ['(원장)본식+촬영'])),
      },
    });
    out[userRegion] = {
      peak: seasonData(PEAK_MONTHS),
      offPeak: seasonData(OFF_PEAK_MONTHS),
    };
  }
  return out;
}

function buildTogglePrices(rows) {
  const out = {};
  for (const [toggleId, def] of Object.entries(TOGGLE_CSV_MAP)) {
    out[toggleId] = {};
    for (const [userRegion, csvRegion] of Object.entries(REGION_MAP)) {
      const seasonAggregate = (months) => {
        // items가 여러개면 agg에 따라 합산/평균
        const perItem = def.items.map((item) =>
          avg(pricesFor(rows, csvRegion, months, def.category, [item]))
        );
        if (def.agg === 'sum') return sum(perItem);
        if (def.agg === 'avg') return avg(perItem);
        return perItem[0] ?? null;
      };
      out[toggleId][userRegion] = {
        peak: seasonAggregate(PEAK_MONTHS),
        offPeak: seasonAggregate(OFF_PEAK_MONTHS),
      };
    }
  }
  return out;
}

// ── TS 파일 생성 ──

const HEADER = `// AUTO-GENERATED by scripts/build-pricing.mjs — do not edit by hand.
// CSV 갱신 시 \`npm run build:pricing\` 재실행 후 commit.
// 단위: 만원. \`bojeung\`만 인원수.

`;

// JSON 그대로 출력 — 모든 키에 따옴표 유지 (공백·숫자 시작 키 안전)
function jsonStringifyPretty(obj) {
  return JSON.stringify(obj, null, 2);
}

function writeRegionProfiles(out) {
  const filepath = path.join(OUT_DIR, 'region-profiles.ts');
  const body = `${HEADER}import type { UserRegion } from '../types';

export type SeasonProfile = {
  bojeung: number;       // 최소 보증 인원
  perHead: number;       // 1인당 식대 (만원)
  daegwan: number;       // 대관 비용 (만원)
  baseMeal: number;      // 기본 식대 총금액 (만원)
  baseDecoration: number; // 기본 장식비 (만원)
};

export type RegionProfile = {
  peak: SeasonProfile;
  offPeak: SeasonProfile;
};

export const REGION_PROFILES: Record<UserRegion, RegionProfile> = ${jsonStringifyPretty(out)};
`;
  fs.writeFileSync(filepath, body);
  console.log('  wrote', path.relative(ROOT, filepath));
}

function writeCategoryBase(out) {
  const filepath = path.join(OUT_DIR, 'category-base.ts');
  const body = `${HEADER}import type { UserRegion } from '../types';

export type DressBase = '본식만' | '본식촬영' | '촬영만';
export type MakeupGrade = '실장' | '부원장' | '원장';

export type CategoryBaseSeason = {
  studio: number;
  dress: Record<DressBase, number>;
  makeup: Record<MakeupGrade, number>;
};

export type CategoryBase = {
  peak: CategoryBaseSeason;
  offPeak: CategoryBaseSeason;
};

export const CATEGORY_BASE: Record<UserRegion, CategoryBase> = ${jsonStringifyPretty(out)};
`;
  fs.writeFileSync(filepath, body);
  console.log('  wrote', path.relative(ROOT, filepath));
}

function writeTogglePrices(out) {
  const filepath = path.join(OUT_DIR, 'toggle-prices.ts');
  const body = `${HEADER}import type { ToggleId, UserRegion } from '../types';

export type TogglePriceSeason = {
  peak: number | null;
  offPeak: number | null;
};

export const TOGGLE_PRICES: Record<ToggleId, Record<UserRegion, TogglePriceSeason>> = ${jsonStringifyPretty(out)};
`;
  fs.writeFileSync(filepath, body);
  console.log('  wrote', path.relative(ROOT, filepath));
}

// ── 메인 ──

function main() {
  console.log('Reading', path.relative(ROOT, CSV_PATH));
  const csvText = fs.readFileSync(CSV_PATH, 'utf-8');
  const rawRows = parseCSV(csvText);
  const rows = rawRows.map(normalize);
  console.log(`  parsed ${rows.length} rows`);

  console.log('Building region-profiles…');
  const profiles = buildRegionProfiles(rows);
  writeRegionProfiles(profiles);

  console.log('Building category-base…');
  const base = buildCategoryBase(rows);
  writeCategoryBase(base);

  console.log('Building toggle-prices…');
  const toggles = buildTogglePrices(rows);
  writeTogglePrices(toggles);

  // sanity check
  console.log('\nSanity check:');
  for (const region of Object.keys(REGION_MAP)) {
    const p = profiles[region];
    console.log(`  ${region} peak per-head:`, p.peak.perHead, '/ off-peak:', p.offPeak.perHead);
  }
  console.log('\nDone.');
}

main();
