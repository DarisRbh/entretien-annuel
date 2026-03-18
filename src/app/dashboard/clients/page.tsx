'use client'
import { Search, Download, Upload, Mail, ChevronLeft, ChevronRight, X, Save, Plus } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Download, Upload, Mail, ChevronLeft, ChevronRight, X, Save } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Client, StatutClient } from '@/types'
import * as XLSX from 'xlsx'

const STATUTS: StatutClient[] = ['A contacter', 'Email envoyé', 'Disponibilités reçues', 'RDV confirmé', 'Planifié']

const pillClass: Record<StatutClient, string> = {
  'RDV confirmé':           'pill-confirmed',
  'Disponibilités reçues':  'pill-pending',
  'Email envoyé':           'pill-contact',
  'A contacter':            'pill-contact',
  'Planifié':               'pill-planned',
}

const N8N_WEBHOOK = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? 'https://n8n.srv852893.hstgr.cloud'

export default function ClientsPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statutFilter, setStatutFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)
  const [comment, setComment] = useState('')
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const PER_PAGE = 10

  async function fetchClients() {
    setLoading(true)
    let q = supabase.from('clients').select('*').order('prochaine_echeance')
    if (statutFilter) q = q.eq('statut', statutFilter)
    if (search) q = q.or(`nom.ilike.%${search}%,prenom.ilike.%${search}%,email.ilike.%${search}%`)
    const { data } = await q
    setClients(data ?? [])
    setLoading(false)
    setPage(1)
  }

  useEffect(() => { fetchClients() }, [search, statutFilter])

  function openClient(c: Client) {
    setSelected(c)
    setComment(c.commentaire ?? '')
  }

  async function saveComment() {
    if (!selected) return
    setSaving(true)
    await supabase.from('clients').update({ commentaire: comment }).eq('id', selected.id)
    setClients(prev => prev.map(c => c.id === selected.id ? { ...c, commentaire: comment } : c))
    setSaving(false)
  }

  async function sendEmail(client: Client) {
    setSendingEmail(client.id)
    try {
      await fetch(`${N8N_WEBHOOK}/webhook/edr-sav-send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: client.id }),
      })
      await supabase.from('clients').update({ statut: 'Email envoyé', date_envoi_email: new Date().toISOString() }).eq('id', client.id)
      await fetchClients()
    } catch (e) { console.error(e) }
    setSendingEmail(null)
  }

  // Export Excel
  function exportExcel() {
    const rows = clients.map(c => ({
      Nom: c.nom, Prénom: c.prenom, Email: c.email, Téléphone: c.telephone,
      Adresse: c.adresse, Ville: c.ville, 'Code postal': c.code_postal,
      Équipement: c.equipement, 'Dernière visite': c.derniere_visite,
      'Prochaine échéance': c.prochaine_echeance, Statut: c.statut,
      Commentaire: c.commentaire,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Clients')
    XLSX.writeFile(wb, `edr-sav-clients-${format(new Date(), 'yyyy-MM-dd')}.xlsx`)
  }

  // Import Excel
  async function importExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(ws) as any[]
    const toInsert = rows.map(r => ({
      nom: r['Nom'] ?? r['nom'] ?? '',
      prenom: r['Prénom'] ?? r['prenom'] ?? null,
      email: r['Email'] ?? r['email'] ?? null,
      telephone: r['Téléphone'] ?? r['telephone'] ?? null,
      adresse: r['Adresse'] ?? r['adresse'] ?? null,
      ville: r['Ville'] ?? r['ville'] ?? null,
      code_postal: r['Code postal'] ?? r['code_postal'] ?? null,
      equipement: r['Équipement'] ?? r['equipement'] ?? null,
      derniere_visite: r['Dernière visite'] ?? r['derniere_visite'] ?? null,
      prochaine_echeance: r['Prochaine échéance'] ?? r['prochaine_echeance'] ?? null,
      statut: r['Statut'] ?? r['statut'] ?? 'A contacter',
      commentaire: r['Commentaire'] ?? r['commentaire'] ?? null,
    })).filter(r => r.nom)
    if (toInsert.length > 0) {
      await supabase.from('clients').insert(toInsert)
      await fetchClients()
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  // Pagination
  const paginated = clients.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(clients.length / PER_PAGE)

  function isEchu(c: Client) {
    return c.prochaine_echeance && new Date(c.prochaine_echeance) < new Date()
  }

  return (
    <div className="p-7">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-medium">Clients</h1>
          <p className="text-xs text-[#6b7280] font-mono mt-0.5">{clients.length} clients</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
  <Plus size={13} /> Nouveau client
</button>
          <button className="btn" onClick={exportExcel}>
            <Download size={13} /> Exporter Excel
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            <Upload size={13} /> Importer Excel
          </button>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]" />
          <input
            className="input pl-8 text-xs"
            placeholder="Rechercher un client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select"
          value={statutFilter}
          onChange={e => setStatutFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07]">
                {['Client', 'Équipement', 'Dernière visite', 'Échéance', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-mono text-[#6b7280] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[#6b7280] text-sm">Chargement...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-[#6b7280] text-sm">Aucun client trouvé</td></tr>
              ) : paginated.map(c => (
                <tr
                  key={c.id}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => openClient(c)}
                >
                  <td className="px-4 py-3">
                    <div className="text-[13px] font-medium">{c.prenom} {c.nom}</div>
                    <div className="text-[11px] font-mono text-[#6b7280] mt-0.5">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-[#6b7280]">
                    {c.equipement ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-[#6b7280]">
                    {c.derniere_visite
                      ? format(new Date(c.derniere_visite), 'dd/MM/yyyy')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] font-mono ${isEchu(c) ? 'text-red-400' : 'text-[#6b7280]'}`}>
                      {c.prochaine_echeance
                        ? format(new Date(c.prochaine_echeance), 'dd/MM/yyyy')
                        : '—'}
                      {isEchu(c) && <span className="ml-1.5 text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">ÉCHU</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`pill ${pillClass[c.statut] ?? 'pill-planned'}`}>
                      {c.statut}
                    </span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button
                      className={`btn text-[11px] ${c.statut === 'A contacter' || isEchu(c) ? 'btn-primary' : ''}`}
                      disabled={sendingEmail === c.id}
                      onClick={() => sendEmail(c)}
                    >
                      <Mail size={11} />
                      {sendingEmail === c.id ? '...' : c.nb_relances > 0 ? 'Relancer' : 'Email'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-white/[0.07] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#6b7280]">
            {clients.length} clients · Page {page}/{totalPages || 1}
          </span>
          <div className="flex gap-1">
            <button className="btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  className={`btn text-[11px] ${page === p ? 'btn-primary' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            })}
            <button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <div className="fixed inset-0 z-50" onClick={() => setSelected(null)}>
          <div
            className="absolute right-0 top-0 h-full w-80 bg-[#161b27] border-l border-white/[0.07] flex flex-col overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between sticky top-0 bg-[#161b27] z-10">
              <div>
                <div className="text-[14px] font-medium">{selected.prenom} {selected.nom}</div>
                <div className="text-[10px] font-mono text-[#6b7280] mt-0.5">{selected.equipement ?? 'Équipement non renseigné'}</div>
              </div>
              <button className="btn p-1.5" onClick={() => setSelected(null)}><X size={13} /></button>
            </div>

            <div className="p-5 flex-1 space-y-5">
              {/* Statut */}
              <div>
                <div className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-2">Statut</div>
                <span className={`pill ${pillClass[selected.statut] ?? 'pill-planned'}`}>{selected.statut}</span>
              </div>

              {/* Contact */}
              <div>
                <div className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-2">Contact</div>
                <div className="text-[13px]">{selected.email ?? '—'}</div>
                <div className="text-[13px] text-[#6b7280]">{selected.telephone ?? '—'}</div>
              </div>

              {/* Adresse */}
              <div>
                <div className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-2">Adresse</div>
                <div className="text-[13px]">{selected.adresse}, {selected.code_postal} {selected.ville}</div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-1">Dernière visite</div>
                  <div className="text-[13px]">
                    {selected.derniere_visite ? format(new Date(selected.derniere_visite), 'dd/MM/yyyy') : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-1">Échéance</div>
                  <div className={`text-[13px] ${isEchu(selected) ? 'text-red-400' : ''}`}>
                    {selected.prochaine_echeance ? format(new Date(selected.prochaine_echeance), 'dd/MM/yyyy') : '—'}
                  </div>
                </div>
              </div>

              <div className="h-px bg-white/[0.07]" />

              {/* Commentaire */}
              <div>
                <div className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-2">Commentaire</div>
                <textarea
                  className="input text-[12px] resize-none"
                  rows={3}
                  placeholder="Ajouter un commentaire..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                />
              </div>

              {/* Relances */}
              <div>
                <div className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider mb-1">Relances envoyées</div>
                <div className="text-[13px]">{selected.nb_relances}</div>
              </div>
            </div>

            {/* Panel actions */}
            <div className="px-5 py-4 border-t border-white/[0.07] flex gap-2 sticky bottom-0 bg-[#161b27]">
              <button
                className="btn flex-1 justify-center text-[12px]"
                onClick={() => sendEmail(selected)}
                disabled={sendingEmail === selected.id}
              >
                <Mail size={12} />
                {sendingEmail === selected.id ? '...' : 'Envoyer email'}
              </button>
              <button
                className="btn btn-primary flex-1 justify-center text-[12px]"
                onClick={saveComment}
                disabled={saving}
              >
                <Save size={12} />
                {saving ? '...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
