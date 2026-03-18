type Color = 'blue' | 'green' | 'amber' | 'red' | 'purple'

const colors: Record<Color, { text: string; progress: string; glow: string }> = {
  blue:   { text: 'text-blue-400',   progress: 'bg-blue-500',   glow: 'bg-blue-500' },
  green:  { text: 'text-emerald-400', progress: 'bg-emerald-500', glow: 'bg-emerald-500' },
  amber:  { text: 'text-amber-400',  progress: 'bg-amber-500',  glow: 'bg-amber-500' },
  red:    { text: 'text-red-400',    progress: 'bg-red-500',    glow: 'bg-red-500' },
  purple: { text: 'text-purple-400', progress: 'bg-purple-500', glow: 'bg-purple-500' },
}

export default function KpiCard({
  label, value, delta, color, progress,
}: {
  label: string
  value: string | number
  delta?: string
  color: Color
  progress?: number
}) {
  const c = colors[color]
  return (
    <div className="card p-5 relative overflow-hidden">
      <div
        className={`absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.06] -translate-y-1/2 translate-x-1/2 ${c.glow}`}
      />
      <div className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-2">{label}</div>
      <div className={`text-3xl font-semibold tracking-tight mb-1 ${c.text}`}>{value}</div>
      {delta && (
        <div className="text-[11px] text-emerald-400">{delta}</div>
      )}
      {progress !== undefined && (
        <div className="h-1 bg-[#1e2535] rounded-full mt-3 overflow-hidden">
          <div className={`h-full rounded-full ${c.progress}`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}
