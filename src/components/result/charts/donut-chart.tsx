// SVG 도넛 차트 — 5등분, 비중 따라 호 길이 조정
// 외부 의존성 없음.

type Segment = { label: string; value: number; color: string };

type Props = {
  data: Segment[];
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerValue?: string;
};

export function DonutChart({
  data,
  size = 180,
  stroke = 24,
  centerLabel,
  centerValue,
}: Props) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={stroke}
          />
          {data.map((d, i) => {
            const ratio = d.value / total;
            const dash = ratio * circumference;
            const seg = (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return seg;
          })}
        </g>
      </svg>
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerLabel && (
            <span className="text-[11px] text-[#737373]">{centerLabel}</span>
          )}
          {centerValue && (
            <span className="text-base font-bold tabular-nums text-[#171717]">
              {centerValue}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
