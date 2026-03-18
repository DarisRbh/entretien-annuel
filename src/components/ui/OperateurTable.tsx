import type { Operateur } from '@/types'

export default function OperateurTable({
  operateurs, rdvs,
}: {
  operateurs: Operateur[]
  rdvs: any[]
}) {
  const stats = operateurs.map(op => {
    const opRdvs = rdvs.filter(r => r.operateur_id === op.id)
    const confirmed = opRdvs.filter(r => r.statut === 'confirmé').length
    const taux = opRdvs.length > 0 ? Math.round((confirmed / opRdvs.length) * 100) : 0
    return { op, total: opRdvs.length, confirmed, taux }
  })

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.07]">
            {['Opérateur', 'RDV ce mois', 'Confirmés', 'Taux', 'En attente'].map(h => (
              <th key={h} className="text-left px-5 py-2.5 text-[10px] font-mono text-[#6b7280] uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stats.map(({ op, total, confirmed, taux }) => (
            <tr key={op.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                    style={{ background: op.couleur }}
                  >
                    {op.prenom?.[0]}{op.nom?.[0]}
                  </div>
                  <span className="text-[13px] font-medium">{op.prenom} {op.nom}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-[13px]">{total}</td>
              <td className="px-5 py-3 text-[13px]">{confirmed}</td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-1 w-16 bg-[#1e2535] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${taux}%`,
                        background: taux >= 80 ? '#10b981' : taux >= 60 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#6b7280]">{taux}%</span>
                </div>
              </td>
              <td className="px-5 py-3">
                <span className="pill pill-pending">{total - confirmed}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
