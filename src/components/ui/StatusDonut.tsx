'use client'

const COLORS = {
  'RDV confirmé':           '#10b981',
  'Disponibilités reçues':  '#f59e0b',
  'Email envoyé':           '#3b82f6',
  'A contacter':            '#8b5cf6',
  'Planifié':               '#6b7280',
}

export default function StatusDonut({
  statuts, total,
}: {
  statuts: Record<string, number>
  total: number
}) {
  const r = 28
  const circ = 2 * Math.PI * r
  let offset = 0

  const segments = Object.entries(statuts)
    .filter(([, v]) => v > 0)
    .map(([key, val]) => {
      const pct = val / (total || 1)
      const dash = pct * circ
      const seg = { key, val, dash, offset, color: COLORS[key as keyof typeof COLORS] ?? '#6b7280' }
      offset += dash
      return seg
    })

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 80 80" className="w-20 h-20 flex-shrink-0 -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
        {segments.map(s => (
          <circle
            key={s.key}
            cx="40" cy="40" r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={`${s.dash} ${circ - s.dash}`}
            strokeDashoffset={-s.offset}
          />
        ))}
       <text x="40" y="38" textAnchor="middle" fill="#e8eaf0" fontSize="13" fontWeight="600">
  {total}
</text>
<text x="40" y="50" textAnchor="middle" fill="#6b7280" fontSize="8">
  clients
</text>
      </svg>

      <div className="flex flex-col gap-1.5 flex-1">
        {Object.entries(statuts).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 text-[11px]">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[key as keyof typeof COLORS] ?? '#6b7280' }} />
            <span className="text-[#e8eaf0] truncate">{key}</span>
            <span className="text-[#6b7280] ml-auto font-mono">{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
