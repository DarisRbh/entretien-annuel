export type StatutClient =
  | 'A contacter'
  | 'Email envoyé'
  | 'Disponibilités reçues'
  | 'RDV confirmé'
  | 'Planifié'

export type StatutRdv = 'confirmé' | 'proposé' | 'annulé' | 'effectué'

export interface Client {
  id: string
  nom: string
  prenom: string | null
  email: string | null
  telephone: string | null
  adresse: string | null
  ville: string | null
  code_postal: string | null
  latitude: number | null
  longitude: number | null
  equipement: string | null
  duree_min: number
  derniere_visite: string | null
  prochaine_echeance: string | null
  statut: StatutClient
  commentaire: string | null
  date_envoi_email: string | null
  nb_relances: number
  created_at: string
  updated_at: string
}

export interface Operateur {
  id: string
  nom: string
  prenom: string | null
  email: string | null
  bigchange_id: string | null
  couleur: string
  actif: boolean
}

export interface RendezVous {
  id: string
  client_id: string
  operateur_id: string | null
  date_heure_debut: string
  date_heure_fin: string
  statut: StatutRdv
  notes: string | null
  source: string
  created_at: string
  clients?: Pick<Client, 'nom' | 'prenom' | 'adresse' | 'ville' | 'equipement'>
  operateurs?: Pick<Operateur, 'nom' | 'prenom' | 'couleur'>
}

export interface Proposition {
  id: string
  client_id: string
  proposition_1: string | null
  proposition_2: string | null
  proposition_3: string | null
  operateur_1_id: string | null
  operateur_2_id: string | null
  operateur_3_id: string | null
  statut: 'en attente' | 'accepté' | 'refusé'
  choix_client: number | null
  created_at: string
}

export interface KpiData {
  total_clients: number
  rdv_ce_mois: number
  rdv_confirmes_a_venir: number
  clients_a_contacter: number
  clients_en_attente: number
  taux_confirmation: number
  statuts: Record<StatutClient, number>
}
