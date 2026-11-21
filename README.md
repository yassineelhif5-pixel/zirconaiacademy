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
Copy-Item .env.example .env  # PowerShell, depuis la racine du projet
cd backend
python -m venv .venv
# Windows : .venv\Scripts\activate
# Linux/macOS : source .venv/bin/activate
pip install -r requirements.txt
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


## Espace membre et assistant IA

- `/connexion` : création de compte et connexion par JWT.
- `/assistant` : assistant conversationnel réservé aux utilisateurs authentifiés.
- API : `/api/auth/register/`, `/api/auth/token/`, `/api/auth/me/`, `/api/auth/logout/`, `/api/assistant/chat/`.
- L'assistant utilise l'API Chat Completions compatible OpenAI. Il s'appuie sur une base de connaissances fixe et ne doit pas inventer de faits produits ou de dates.

Variables serveur facultatives pour activer l'IA :
`AI_API_KEY`, `AI_BASE_URL` (par défaut `https://api.openai.com/v1`), `AI_MODEL` (par défaut `gpt-4.1-mini`).
Ne jamais placer la clé dans une variable `NEXT_PUBLIC_*` ni dans le frontend. Sans clé, l'API renvoie explicitement un statut 503 et un message de configuration.

Les jetons d'accès sont gardés en sessionStorage dans ce premier incrément. Pour une mise en production, privilégier des cookies HttpOnly Secure SameSite, une procédure de réinitialisation de mot de passe, vérification email, règles de rétention, CAPTCHA, tests de sécurité et revue RGPD.


## Authentification Google, espace apprenant et administration

### Connexion Google
1. Créer un client OAuth 2.0 de type application Web dans Google Cloud Console.
2. Ajouter les origines JavaScript autorisées du site et de localhost.
3. Définir le même identifiant client dans `GOOGLE_CLIENT_ID` (backend) et `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (frontend).
4. L'API vérifie côté serveur la signature, l'audience et le claim `email_verified` du jeton Google. Ne jamais faire confiance à une adresse email simplement envoyée par le navigateur.

### Espace apprenant
- `/espace-apprenant` affiche uniquement les demandes liées à l'identifiant du compte connecté.
- Les nouvelles demandes envoyées depuis une session authentifiée sont associées à ce compte.
- Une date de session confirmée est affichée dans l'historique.

### Console d'administration
- `/admin` est une interface réservée aux utilisateurs Django ayant `is_staff=True`.
- L'API applique `IsAdminUser` à toutes les routes de gestion : un masquage de bouton côté frontend ne constitue jamais une protection.
- L'administrateur peut consulter les demandes, accepter/refuser, choisir une date et activer/désactiver les comptes apprenants.
- Créer le premier administrateur sur le serveur avec `python manage.py createsuperuser`. Le mot de passe est saisi de façon interactive et haché par Django.
- Ne pas mettre de mot de passe admin dans le dépôt, dans le frontend, dans un fichier commité ou dans une variable `NEXT_PUBLIC_*`.

### Migration de base de données
Après mise à jour du code, exécuter :
```bash
python manage.py migrate
```
La migration `0002_registration_ownership_and_date` ajoute l'association facultative aux comptes et la date confirmée.
