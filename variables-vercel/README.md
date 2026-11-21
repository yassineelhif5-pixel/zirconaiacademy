# Variables Vercel — ProjectAcademy

Ce dossier contient des modèles de variables d'environnement pour les deux projets Vercel. Il ne contient volontairement aucun secret réel.

## Fichiers

- `backend.env.example` : variables du projet Vercel Django (Root Directory = `backend`).
- `frontend.env.example` : variables du projet Vercel Next.js (Root Directory = `frontend`).

## Configuration Vercel

Pour chaque projet Vercel :

1. Ouvrir **Settings > Environment Variables**.
2. Copier les variables du fichier correspondant.
3. Renseigner les vraies valeurs directement dans Vercel.
4. Sélectionner les environnements nécessaires (Production / Preview / Development).
5. Redéployer après ajout ou modification des variables.

## Valeurs à adapter

- Remplacer `projectacademy-api.vercel.app` par le domaine API attribué par Vercel si différent.
- Remplacer `https://projectacademy.zirconai.fr` si le domaine frontend change.
- Récupérer `DATABASE_URL` dans Supabase > Connect > Transaction Pooler. Le backend Vercel utilise le port 6543 et `DB_POOLER_MODE=transaction`.
- Générer `DJANGO_SECRET_KEY` avec un générateur cryptographiquement sûr.
- Utiliser le même `GOOGLE_CLIENT_ID` côté frontend et backend.
- Les variables SMTP et IA peuvent rester non configurées tant que les fonctionnalités correspondantes ne sont pas activées.

## Sécurité

- Ne jamais committer les valeurs réelles de `DATABASE_URL`, `DJANGO_SECRET_KEY`, `EMAIL_HOST_PASSWORD` ou `AI_API_KEY`.
- Ne jamais ajouter de secret à une variable `NEXT_PUBLIC_*`.
- Ne jamais utiliser une clé Supabase `service_role` / secret key dans le navigateur.
- Les environnements Preview ne doivent pas utiliser la base de production. Créer une base de test ou désactiver ces variables pour Preview.
- Les valeurs de ce dossier sont des exemples : elles ne configurent pas automatiquement Vercel.
