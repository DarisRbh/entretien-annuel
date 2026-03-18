'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import type { RendezVous, Operateur, Client } from '@/types'

const OP_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444']

export default function CalendrierPage() {
  const supabase = createClient()
  const [current, setCurrent] = useState(new Date())
  const [rdvs, setRdvs] = useState<any[]>([])
  const [operateurs, setOperateurs] = useState<Operateur[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [activeOps, setActiveOps] = useState<string[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [form, setForm] = useState({ client_id: '', operateur_id: '', date: '', heure_debut: '08:00', duree: '2', notes: '' })
  const [saving, setSaving] = useState(false)

  async function fetchData() {
    const start = startOfMonth(current).toISOString()
    const end = endOfMonth(current).toISOString()
    const [{ data: r }, { data: ops }, { data: cls }] = await Promise.all([
      supabase.from('rendez_vous')
        .select('*, clients(nom,prenom,equipement), operateurs(nom,prenom,couleur)')
        .gte('date_heure_debut', start).lte('date_heure_debut', end).neq('statut', 'annulé'),
      supabase.from('operateurs').select('*').eq('actif', true),
      supabase.from('clients').select('id,nom,prenom').order('nom'),
    ])
    setRdvs(r ?? [])
    setOperateurs(ops ?? [])
    setClients(cls ?? [])
    if (activeOps.length === 0 && ops) setActiveOps(ops.map(o => o.id))
  }

  useEffect(() => { fetchData() }, [current])

  // Calendar grid
  const monthStart = startOfMonth(current)
  const monthEnd = endOfMonth(current)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  function getRdvsForDay(day: Date) {
    return rdvs.filter(r => {
      if (!activeOps.includes(r.operateur_id)) return false
      return isSameDay(new Date(r.date_heure_debut), day)
    })
  }

  function toggleOp(id: string) {
    setActiveOps(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function openNewRdv(day?: Date) {
    setForm(f => ({ ...f, date: format(day ?? new Date(), 'yyyy-MM-dd'), client_id: '', operateur_id: '', notes: '' }))
    setSelectedDay(day ?? null)
    setShowModal(true)
  }

  async function createRdv() {
    if (!form.client_id || !form.operateur_id || !form.date) return
    setSaving(true)
    const [h, m] = form.heure_debut.split(':').map(Number)
    const debut = new Date(form.date)
    debut.setHours(h, m, 0, 0)
    const fin = new Date(debut)
    fin.setHours(fin.getHours() + parseInt(form.duree))

    await supabase.from('rendez_vous').insert({
      client_id: form.client_id,
      operateur_id: form.operateur_id,
      date_heure_debut: debut.toISOString(),
      date_heure_fin: fin.toISOString(),
      statut: 'confirmé',
      source: 'manuel',
      notes: form.notes || null,
    })
    // MAJ statut client
    await supabase.from('clients').update({ statut: 'RDV confirmé' }).eq('id', form.client_id)

    setSaving(false)
    setShowModal(false)
    fetchData()
  }

  async function deleteRdv(id: string) {
    await supabase.from('rendez_vous').update({ statut: 'annulé' }).eq('id', id)
    fetchData()
  }

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="btn p-1.5" onClick={() => setCurrent(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })}>
            <ChevronLeft size={14} />
          </button>
          <h1 className="text-base font-medium w-40 text-center capitalize">
            {format(current, 'MMMM yyyy', { locale: fr })}
          </h1>
          <button className="btn p-1.5" onClick={() => setCurrent(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })}>
            <ChevronRight size={14} />
          </button>
          <button className="btn text-xs" onClick={() => setCurrent(new Date())}>Aujourd'hui</button>
        </div>

        <div className="flex items-center gap-4">
          {/* Légende opérateurs */}
          <div className="flex gap-2">
            {operateurs.map(op => (
              <button
                key={op.id}
                onClick={() => toggleOp(op.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all ${
                  activeOps.includes(op.id)
                    ? 'border-white/[0.14] bg-[#1e2535] text-[#e8eaf0]'
                    : 'border-white/[0.07] text-[#6b7280]'
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: op.couleur }} />
                {op.prenom}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => openNewRdv()}>
            <Plus size={13} /> Nouveau RDV
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-white/[0.07]">
          {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
            <div key={d} className="py-2.5 text-center text-[10px] font-mono text-[#6b7280] uppercase tracking-wider bg-[#1e2535]">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7" style={{ gridAutoRows: '110px' }}>
          {days.map(day => {
            const dayRdvs = getRdvsForDay(day)
            const inMonth = isSameMonth(day, current)
            const today = isToday(day)
            return (
              <div
                key={day.toISOString()}
                className={`border-r border-b border-white/[0.04] p-2 cursor-pointer transition-colors hover:bg-white/[0.02] ${!inMonth ? 'opacity-30' : ''} ${today ? 'bg-blue-500/[0.04]' : ''}`}
                onClick={() => openNewRdv(day)}
              >
                <div className={`text-[12px] font-medium mb-1.5 w-6 h-6 flex items-center justify-center rounded-full ${today ? 'bg-blue-500 text-white' : ''}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayRdvs.slice(0, 3).map(rdv => (
                    <div
                      key={rdv.id}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate cursor-pointer group relative"
                      style={{ background: `${rdv.operateurs?.couleur ?? '#3b82f6'}22`, color: rdv.operateurs?.couleur ?? '#3b82f6' }}
                      onClick={e => { e.stopPropagation(); if (confirm(`Annuler le RDV de ${rdv.clients?.prenom} ${rdv.clients?.nom} ?`)) deleteRdv(rdv.id) }}
                      title={`${format(new Date(rdv.date_heure_debut), 'HH')}h · ${rdv.clients?.prenom} ${rdv.clients?.nom} · Cliquer pour annuler`}
                    >
                      {format(new Date(rdv.date_heure_debut), 'HH')}h · {rdv.clients?.prenom} {rdv.clients?.nom}
                    </div>
                  ))}
                  {dayRdvs.length > 3 && (
                    <div className="text-[9px] text-[#6b7280] px-1">+{dayRdvs.length - 3} autres</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal nouveau RDV */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowModal(false)}>
          <div className="bg-[#161b27] border border-white/[0.07] rounded-2xl w-[420px] p-7" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-medium">Nouveau rendez-vous</h2>
              <button className="btn p-1.5" onClick={() => setShowModal(false)}><X size={13} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-1.5 block">Client</label>
                <select className="input" value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}>
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-1.5 block">Date</label>
                  <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-1.5 block">Heure</label>
                  <input type="time" className="input" value={form.heure_debut} onChange={e => setForm(f => ({ ...f, heure_debut: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-1.5 block">Durée</label>
                  <select className="input" value={form.duree} onChange={e => setForm(f => ({ ...f, duree: e.target.value }))}>
                    <option value="1">1h</option>
                    <option value="2">2h</option>
                    <option value="3">3h</option>
                    <option value="4">4h</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-1.5 block">Opérateur</label>
                  <select className="input" value={form.operateur_id} onChange={e => setForm(f => ({ ...f, operateur_id: e.target.value }))}>
                    <option value="">Sélectionner...</option>
                    {operateurs.map(op => <option key={op.id} value={op.id}>{op.prenom} {op.nom}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-1.5 block">Notes</label>
                <textarea className="input resize-none" rows={3} placeholder="Notes sur l'intervention..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="btn flex-1 justify-center" onClick={() => setShowModal(false)}>Annuler</button>
              <button
                className="btn btn-primary flex-1 justify-center"
                onClick={createRdv}
                disabled={saving || !form.client_id || !form.operateur_id || !form.date}
              >
                {saving ? 'Création...' : 'Créer le RDV'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
