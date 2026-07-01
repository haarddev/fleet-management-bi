type ChartPoint = {
  hour: number
  actual: number
  expected: number
}

type EmbeddedVehiclesChartProps = {
  title: string
  data: ChartPoint[]
  currentHour: number
  labels: {
    actual: string
    expected: string
    currentTime: string
    vehicles: string
  }
}

const CHART_W = 420
const CHART_H = 220
const PAD = { top: 16, right: 16, bottom: 36, left: 44 }

function scaleX(hour: number, minH: number, maxH: number) {
  const innerW = CHART_W - PAD.left - PAD.right
  return PAD.left + ((hour - minH) / (maxH - minH)) * innerW
}

function scaleY(value: number, maxVal: number) {
  const innerH = CHART_H - PAD.top - PAD.bottom
  return PAD.top + innerH - (value / maxVal) * innerH
}

function toPath(points: ChartPoint[], key: 'actual' | 'expected', maxVal: number) {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.hour, 0, 24).toFixed(1)} ${scaleY(p[key], maxVal).toFixed(1)}`)
    .join(' ')
}

export function EmbeddedVehiclesChart({ title, data, currentHour, labels }: EmbeddedVehiclesChartProps) {
  const maxVal = Math.max(...data.flatMap((p) => [p.actual, p.expected]), 1) * 1.1
  const currentPoint = data.reduce((closest, p) =>
    Math.abs(p.hour - currentHour) < Math.abs(closest.hour - currentHour) ? p : closest,
  data[0])

  const xCurrent = scaleX(currentHour, 0, 24)
  const yCurrent = scaleY(currentPoint.actual, maxVal)

  const yTicks = [0, Math.round(maxVal / 2), Math.round(maxVal)]

  return (
    <div className="card flex h-full flex-col p-4">
      <h4 className="mb-3 text-sm font-bold text-slate-900">{title}</h4>

      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" role="img" aria-label={title}>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              y1={scaleY(tick, maxVal)}
              x2={CHART_W - PAD.right}
              y2={scaleY(tick, maxVal)}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
            <text x={PAD.left - 8} y={scaleY(tick, maxVal) + 4} textAnchor="end" className="fill-slate-400 text-[10px]">
              {tick}
            </text>
          </g>
        ))}

        {[0, 6, 12, 18, 24].map((hour) => (
          <text
            key={hour}
            x={scaleX(hour, 0, 24)}
            y={CHART_H - 10}
            textAnchor="middle"
            className="fill-slate-500 text-[10px]"
          >
            {hour}
          </text>
        ))}

        <text
          x={CHART_W / 2}
          y={CHART_H - 2}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] font-medium"
        >
          {labels.vehicles}
        </text>

        <path d={toPath(data, 'expected', maxVal)} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" />
        <path d={toPath(data, 'actual', maxVal)} fill="none" stroke="#0f62fe" strokeWidth="2.5" />

        <line x1={xCurrent} y1={PAD.top} x2={xCurrent} y2={CHART_H - PAD.bottom} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx={xCurrent} cy={yCurrent} r="5" fill="#ef4444" stroke="#fff" strokeWidth="2" />
      </svg>

      <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-5 bg-primary" />
          {labels.actual}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0 w-5 border-t-2 border-dashed border-slate-400" />
          {labels.expected}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          {labels.currentTime}
        </span>
      </div>
    </div>
  )
}
