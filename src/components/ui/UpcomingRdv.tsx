import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const statusClasses: Record<string, string> = {
  confirmé: 'pill-confirmed',
  proposé:  'pill-pending',
  annulé:   'pill-refused',
  effectué: 'pill-planned',
}
const statusLabels: Record<string, string> = {
  confirmé: 'Confirmé', proposé: 'Proposé', annulé: 'Annulé', effectué: 'Effectué',
}

export default function UpcomingRdv({ rdvs }: { rdvs: any[] }) {
  if (rdvs.length === 0) {
    return <div className="p-8 text-center text-[#6b7280] text-sm">Aucun rendez-vous à venir</div>
  }
  return (
    <div className="divide-y divide-white/[0.05]">
      {rdvs.map(rdv => {
        const d = new Date(rdv.date_heure_debut)
        const df = new Date(rdv.date_heure_fin)
        return (
          <div key={rdv.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
            <div className="w-11 h-11 bg-[#1e2535] rounded-lg flex flex-col items-center justify-center flex-shrink-0">
              <div className="text-base font-semibold leading-none">{format(d, 'd')}</div>
              <div className="text-[9px] text-[#6b7280] font-mono uppercase">{format(d, 'MMM', { locale: fr })}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium">
                {rdv.clients?.prenom} {rdv.clients?.nom}
              </div>
              <div className="text-[11px] text-[#6b7280] mt-0.5">
                {format(d, 'HH')}h–{format(df, 'HH')}h · {rdv.clients?.equipement ?? rdv.clients?.ville ?? '—'}
              </div>
            </div>
            {rdv.operateurs && (
              <div className="text-[10px] font-mono text-[#6b7280] bg-[#1e2535] px-2 py-1 rounded-md">
                {rdv.operateurs.prenom?.[0]}. {rdv.operateurs.nom}
              </div>
            )}
            <span className={`pill ${statusClasses[rdv.statut] ?? 'pill-planned'}`}>
              {statusLabels[rdv.statut] ?? rdv.statut}
            </span>
          </div>
        )
      })}
    </div>
  )
}
