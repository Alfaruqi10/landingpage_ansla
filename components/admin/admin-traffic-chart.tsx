type TrafficTrendPoint = {
  date: Date;
  dateKey: string;
  shortLabel: string;
  orderCount: number;
  leadCount: number;
  messageCount: number;
};

type SeriesConfig = {
  key: "orderCount" | "leadCount" | "messageCount";
  label: string;
  stroke: string;
  fill: string;
};

const chartSeries: SeriesConfig[] = [
  {
    key: "orderCount",
    label: "Pesanan",
    stroke: "#c6a979",
    fill: "rgba(198, 169, 121, 0.16)"
  },
  {
    key: "leadCount",
    label: "Leads",
    stroke: "#6fb3a5",
    fill: "rgba(111, 179, 165, 0.16)"
  },
  {
    key: "messageCount",
    label: "Pesan Kontak",
    stroke: "#8aa4d6",
    fill: "rgba(138, 164, 214, 0.16)"
  }
];

function buildLinePath(
  values: number[],
  width: number,
  height: number,
  maxValue: number
) {
  if (values.length === 0) {
    return "";
  }

  const stepX = values.length > 1 ? width / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = index * stepX;
      const y = height - (value / maxValue) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(
  values: number[],
  width: number,
  height: number,
  maxValue: number
) {
  if (values.length === 0) {
    return "";
  }

  const linePath = buildLinePath(values, width, height, maxValue);
  return `${linePath} L ${width} ${height} L 0 ${height} Z`;
}

export function AdminTrafficChart({
  trend
}: {
  trend: TrafficTrendPoint[];
}) {
  const chartWidth = 680;
  const chartHeight = 250;
  const chartPaddingX = 18;
  const chartPaddingTop = 18;
  const chartPaddingBottom = 32;
  const chartInnerWidth = chartWidth - chartPaddingX * 2;
  const chartInnerHeight = chartHeight - chartPaddingTop - chartPaddingBottom;
  const allValues = trend.flatMap((point) => [
    point.orderCount,
    point.leadCount,
    point.messageCount
  ]);
  const maxValue = Math.max(...allValues, 1);
  const tickCount = Math.min(4, maxValue);
  const yTicks =
    tickCount > 0
      ? Array.from({ length: tickCount + 1 }, (_, index) =>
          Math.round((maxValue / tickCount) * index)
        )
      : [0, maxValue];

  return (
    <div className="surface-panel p-6 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-eyebrow">Traffic 7 Hari</p>
          <h3 className="mt-2 text-3xl">Tren leads, pesanan, dan pesan masuk</h3>
          <p className="mt-2 max-w-2xl text-sm">
            Lihat pergerakan data masuk selama 7 hari terakhir untuk cepat membaca momentum
            traffic dan konversi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {chartSeries.map((series) => {
            const total = trend.reduce((sum, point) => sum + point[series.key], 0);

            return (
              <div
                key={series.key}
                className="rounded-full border border-border/70 bg-[hsl(var(--background)/0.45)] px-4 py-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: series.stroke }}
                  />
                  <span className="text-foreground">{series.label}</span>
                  <span className="font-medium text-foreground">{total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.35rem] border border-border/70 bg-[hsl(var(--background)/0.45)] p-4 sm:p-5">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="h-[280px] w-full"
          role="img"
          aria-label="Grafik traffic dashboard admin 7 hari terakhir"
        >
          <g transform={`translate(${chartPaddingX}, ${chartPaddingTop})`}>
            {yTicks.map((tickValue) => {
              const y = chartInnerHeight - (tickValue / maxValue) * chartInnerHeight;

              return (
                <g key={tickValue}>
                  <line
                    x1={0}
                    y1={y}
                    x2={chartInnerWidth}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.12"
                  />
                  <text
                    x={-8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fill="currentColor"
                    opacity="0.55"
                  >
                    {tickValue}
                  </text>
                </g>
              );
            })}

            {chartSeries.map((series) => {
              const values = trend.map((point) => point[series.key]);
              const stepX = trend.length > 1 ? chartInnerWidth / (trend.length - 1) : 0;

              return (
                <g key={series.key}>
                  {series.key === "orderCount" ? (
                    <path
                      d={buildAreaPath(values, chartInnerWidth, chartInnerHeight, maxValue)}
                      fill={series.fill}
                    />
                  ) : null}
                  <path
                    d={buildLinePath(values, chartInnerWidth, chartInnerHeight, maxValue)}
                    fill="none"
                    stroke={series.stroke}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {values.map((value, index) => {
                    const x = index * stepX;
                    const y = chartInnerHeight - (value / maxValue) * chartInnerHeight;

                    return (
                      <circle
                        key={`${series.key}-${trend[index]?.dateKey}`}
                        cx={x}
                        cy={y}
                        r="4"
                        fill={series.stroke}
                        stroke="hsl(var(--card))"
                        strokeWidth="2"
                      />
                    );
                  })}
                </g>
              );
            })}

            {trend.map((point, index) => {
              const x =
                trend.length > 1 ? index * (chartInnerWidth / (trend.length - 1)) : chartInnerWidth / 2;

              return (
                <text
                  key={point.dateKey}
                  x={x}
                  y={chartInnerHeight + 22}
                  textAnchor="middle"
                  fontSize="11"
                  fill="currentColor"
                  opacity="0.6"
                >
                  {point.shortLabel}
                </text>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
