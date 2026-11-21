# ProjectAcademy by ZirconAI

Portail commercial et pédagogique de ZirconAI.

- **Domaine cible :** https://projectacademy.zirconai.fr
- **Frontend :** Next.js App Router + TypeScript
- **Backend :** Django REST Framework
- **Base de données :** PostgreSQL
- **Formations :** gratuites, 4 heures, organisées le dimanche en février 2027. Les dimanches envisagés sont les 7, 14, 21 et 28 février 2027 ; la session exacte est confirmée individuellement par email.

## Catalogue officiel

| Produit | Statut | URL |
|---|---|---|
| Smart Tower Project | Disponible | https://www.smarttowerproject.zirconai.fr/ |
| GrowthAI | Disponible | https://www.growthai.zirconai.fr/ |
| ZirconShield AI | Disponible prochainement | Pas encore commercialisé |
| Docyra AI | Disponible prochainement | Pas encore commercialisé |
| StockPilot AI | Disponible prochainement | Pas encore commercialisé |
| ZirconAcademy AI | Disponible prochainement | Pas encore commercialisé |

Les produits « Disponible prochainement » proposent uniquement une demande d'information sur leur lancement, jamais une demande de démo présentée comme disponible.

## Démarrage local

### API Django

```bash
cd backend
python -m venv .venv
# Windows : .venv\Scripts\activate
# Linux/macOS : source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env  # Windows ; sous Linux : cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

L'API est accessible sur `http://localhost:8000/api/` et l'administration sur `http://localhost:8000/admin/`.

### Frontend Next.js

```bash
cd frontend
npm install
# Copier .env.local.example vers .env.local
npm run dev
```

Le site est accessible sur `http://localhost:3000`. Configurer `NEXT_PUBLIC_API_URL=http://localhost:8000`.

### PostgreSQL avec Docker

Depuis la racine : `docker compose up -d db`. Sans Docker, le backend utilise SQLite par défaut pour le développement local.

## Fonctionnalités de cet incrément

- Présentation de ZirconAI et catalogue SaaS avec vrais liens pour les deux produits disponibles.
- Fiches descriptives, statuts de commercialisation explicites et liste d'intérêt pour les produits à venir.
- Présentation interactive des deux formations gratuites.
- Inscriptions enregistrées par l'API, avec consentement obligatoire.
- Assistant FAQ guidé par un contenu statique validé ; il ne prétend pas être un LLM ni inventer une date.
- Administration Django pour consulter les demandes.
- API santé, validation serveur, protection anti-spam de base via throttling DRF.

## À réaliser avant production

- Configurer DNS et TLS pour `projectacademy.zirconai.fr`.
- Définir `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` et les paramètres PostgreSQL.
- Ajouter un fournisseur d'email transactionnel et des modèles d'emails ; aucun email n'est envoyé par défaut dans cette version.
- Connecter un LLM/RAG après constitution et validation de la base de connaissances.
- Ajouter captcha / honeypot, règles de rétention et processus d'effacement RGPD.
- Mettre en place CI/CD, sauvegardes, logs, supervision et tests de charge.
- Ne jamais committer de secrets ni de données personnelles.

## Déploiement

Consulter [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Ce dépôt ne déploie pas automatiquement le domaine et ne configure pas le DNS.
