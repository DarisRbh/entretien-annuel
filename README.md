# EDR SAV — Plateforme de gestion

Dashboard Next.js 14 connecté à Supabase pour la gestion des entretiens annuels et planification des rendez-vous.

## Stack

- **Next.js 14** (App Router, Server Components)
- **Supabase** (PostgreSQL + Auth + REST API)
- **Tailwind CSS**
- **Vercel** (déploiement)

## Installation locale

```bash
# 1. Cloner le repo
git clone <votre-repo>
cd edr-sav

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.local.example .env.local
# Remplir avec vos clés Supabase

# 4. Lancer en dev
npm run dev
```

## Variables d'environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://pxlvckkmmkafqdchiljk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<votre_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<votre_service_role_key>
N8N_WEBHOOK_URL=https://n8n.srv852893.hstgr.cloud
```

## Déploiement sur Vercel

### Option 1 — Via GitHub (recommandé)
1. Pusher le projet sur GitHub
2. Aller sur [vercel.com](https://vercel.com) → New Project
3. Importer le repo GitHub
4. Ajouter les variables d'environnement dans Vercel
5. Deploy

### Option 2 — Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

## Créer un utilisateur admin Supabase

Dans Supabase → Authentication → Users → Invite user :
- Email : votre email
- Password : définir un mot de passe fort

## Structure du projet

```
src/
├── app/
│   ├── login/          # Page de connexion
│   ├── dashboard/
│   │   ├── page.tsx    # Tableau de bord (KPIs)
│   │   ├── clients/    # Gestion clients
│   │   └── calendrier/ # Vue calendrier
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx
│   └── ui/
│       ├── KpiCard.tsx
│       ├── StatusDonut.tsx
│       ├── UpcomingRdv.tsx
│       └── OperateurTable.tsx
├── lib/
│   ├── supabase.ts         # Client browser
│   └── supabase-server.ts  # Client server
├── types/
│   └── index.ts            # Types TypeScript
└── middleware.ts            # Protection routes auth
```

## Fonctionnalités

### Tableau de bord
- KPIs : RDV ce mois, taux de confirmation, clients en attente, échéances dépassées
- Liste des prochains RDV avec filtre par opérateur
- Donut des statuts clients
- Performance par opérateur

### Clients
- Tableau paginé avec recherche et filtre par statut
- Export Excel
- Import Excel (ajout en masse)
- Fiche client latérale avec commentaire éditable
- Envoi email de planification via n8n

### Calendrier
- Vue mensuelle
- Filtrage par opérateur
- Création manuelle de RDV (modal)
- Annulation de RDV au clic
