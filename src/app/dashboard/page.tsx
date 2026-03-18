import { createServerSupabase } from '@/lib/supabase-server'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { fr } from 'date-fns/locale'
import KpiCard from '@/components/ui/KpiCard'
import StatusDonut from '@/components/ui/StatusDonut'
import UpcomingRdv from '@/components/ui/UpcomingRdv'
import OperateurTable from '@/components/ui/OperateurTable'

export default async function DashboardPage() {
  const supabase = createServerSupabase()

  const [{ data: clients }, { data: rdvs }, { data: operateurs }] = await Promise.all([
    supabase.from('clients').select('*'),
    supabase.from('rendez_vous').select('*, clients(nom,prenom,ville,equipement), operateurs(nom,prenom,couleur)').order('date_heure_debut'),
    supabase.from('operateurs').select('*').eq('actif', true),
  ])

  const now = new Date()
  const moisDebut = startOfMonth(now).toISOString()
  const moisFin = endOfMonth(now).toISOString()

  const rdvCeMois = (rdvs ?? []).filter(r =>
    r.date_heure_debut >= moisDebut && r.date_heure_debut <= moisFin
  )
  const rdvAVenir = (rdvs ?? []).filter(r =>
    r.date_heure_debut >= now.toISOString() && r.statut !== 'annulé'
  )
  const rdvConfirmes = rdvCeMois.filter(r => r.statut === 'confirmé')
  const tauxConfirmation = rdvCeMois.length > 0
    ? Math.round((rdvConfirmes.length / rdvCeMois.length) * 100)
    : 0

  const statuts: Record<string, number> = {
    'A contacter': 0, 'Email envoyé': 0,
    'Disponibilités reçues': 0, 'RDV confirmé': 0, 'Planifié': 0,
  }
  ;(clients ?? []).forEach(c => {
    if (c.statut in statuts) statuts[c.statut]++
  })

  const clientsUrgents = (clients ?? []).filter(c =>
    c.prochaine_echeance && new Date(c.prochaine_echeance) < now && c.statut === 'A contacter'
  ).length

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-base font-medium">Tableau de bord</h1>
          <p className="text-xs text-[#6b7280] font-mono mt-0.5">
            {format(now, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard label="RDV ce mois" value={rdvCeMois.length} delta="+12%" color="blue" />
        <KpiCard label="Taux de confirmation" value={`${tauxConfirmation}%`} delta="+3pts" color="green" progress={tauxConfirmation} />
        <KpiCard label="En attente réponse" value={statuts['Email envoyé'] + statuts['Disponibilités reçues']} color="amber" />
        <KpiCard label="Échéances dépassées" value={clientsUrgents} color="red" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Prochains RDV */}
        <div className="col-span-2 card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/[0.07] flex items-center justify-between">
            <span className="text-[13px] font-medium">Prochains rendez-vous</span>
            <select className="select text-[11px]">
              <option>Tous les opérateurs</option>
              {(operateurs ?? []).map(op => (
                <option key={op.id}>{op.prenom} {op.nom}</option>
              ))}
            </select>
          </div>
          <UpcomingRdv rdvs={rdvAVenir.slice(0, 6)} />
        </div>

        {/* Statuts */}
        <div className="flex flex-col gap-4">
          <div className="card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-white/[0.07]">
              <span className="text-[13px] font-medium">Statuts clients</span>
            </div>
            <div className="p-5">
              <StatusDonut statuts={statuts} total={clients?.length ?? 0} />
            </div>
          </div>
        </div>
      </div>

      {/* Opérateurs */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.07]">
          <span className="text-[13px] font-medium">Performance par opérateur</span>
        </div>
        <OperateurTable operateurs={operateurs ?? []} rdvs={rdvCeMois} />
      </div>
    </div>
  )
}
