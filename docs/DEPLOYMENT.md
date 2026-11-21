# Déploiement ProjectAcademy — Vercel + Supabase

## Architecture cible

- Frontend Next.js : projet Vercel séparé, Root Directory `frontend`.
- Backend Django REST Framework : projet Vercel séparé, Root Directory `backend`.
- PostgreSQL : projet Supabase `odwcbbfbdxnxifgfwrwu`, région Paris (`eu-west-3`).
- Région des Vercel Functions : Paris (`cdg1`), au plus près de Supabase.

## Projet Vercel backend

Importer le dépôt GitHub `yassineelhif5-pixel/zirconaiacademy` dans Vercel, puis créer un projet dédié à l'API :

- Root Directory : `backend`
- Framework Preset : Django (détection automatique)
- Python : 3.12 (fichier `.python-version`)
- Ajouter le domaine API souhaité, par exemple `api-projectacademy.zirconai.fr`.

Vercel détecte les projets Django depuis `manage.py` et `WSGI_APPLICATION`. Le backend ne nécessite pas de Docker/Gunicorn sur Vercel : Vercel sert Django dans ses Python Functions.

## Variables d'environnement backend

Dans Vercel > Project > Settings > Environment Variables, définir pour Production (et Preview uniquement avec une base de test distincte) :

- `DJANGO_SECRET_KEY` : secret aléatoire long, propre à cet environnement.
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS=<domaine-api-vercel>,api-projectacademy.zirconai.fr` (adapter aux domaines effectivement utilisés).
- `CORS_ALLOWED_ORIGINS=https://projectacademy.zirconai.fr` (origine exacte du frontend).
- `DATABASE_URL` : URI Supabase **Transaction Pooler** (port 6543).
- `DB_POOLER_MODE=transaction`
- `GOOGLE_CLIENT_ID` : identifiant OAuth Web vérifié côté serveur.
- Paramètres SMTP si les emails sont activés.

Ne jamais placer `DATABASE_URL`, le mot de passe PostgreSQL ou une clé Supabase secrète dans Git, dans le frontend ou dans une variable `NEXT_PUBLIC_*`.

### URI PostgreSQL Supabase

Dans Supabase > Connect > Transaction Pooler, copier l'URI au port 6543. Le pooler transaction est adapté aux fonctions serverless courtes et à leurs connexions éphémères. Ne pas utiliser l'URI de connexion directe IPv6 ni le Session Pooler pour ce backend Vercel.

Le code configure TLS, `CONN_MAX_AGE=0`, désactive les curseurs serveur et les prepared statements pour la compatibilité transaction pooling. Encoder les caractères spéciaux du mot de passe dans l'URI.

## Migrations Django

Les tables initiales `core_trainingregistration`, `core_productinterest` et `django_migrations` sont déjà présentes. La migration `core.0001_initial` est enregistrée. Il reste à faire appliquer par Django ses dépendances standard (auth, admin, sessions, JWT blacklist) ainsi que `core.0002` et `core.0003`.

Avant d'ouvrir le site au public, lancer les migrations une seule fois contre la base de production, depuis un environnement contrôlé avec les mêmes variables backend :

```bash
cd backend
python -m pip install -r requirements.txt
python manage.py migrate --plan
python manage.py migrate --noinput
python manage.py showmigrations
python manage.py createsuperuser
```

Ne pas exécuter les migrations sur chaque build Preview ni en parallèle sur plusieurs builds. Sauvegarder la base avant la première migration. Créer le compte administrateur avec `createsuperuser` ; aucun mot de passe admin ne doit être codé dans le dépôt.

## Projet Vercel frontend

Créer/configurer le projet frontend avec Root Directory `frontend` et définir :

- `NEXT_PUBLIC_API_URL=https://<domaine-api>/api`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` : le même client OAuth Web que celui configuré côté backend.

Les variables `NEXT_PUBLIC_*` sont intégrées au code navigateur : elles ne doivent contenir que des valeurs publiques.

## Sécurité Supabase

Les tables du schéma `public` doivent avoir RLS activé avant toute exposition par la Data API. Le navigateur ne doit pas interroger directement les tables de formation ou de comptes : il passe par l'API Django, qui applique les contrôles d'accès. Ne pas activer RLS sans définir et tester les politiques adaptées. Le rôle PostgreSQL utilisé par Django doit rester côté serveur.

## Limites Vercel

Vercel exécute Django dans des fonctions serverless : le disque applicatif est éphémère/lecture seule hors répertoire temporaire. Ne pas stocker des uploads localement ni dépendre d'un processus worker permanent. Utiliser Supabase Storage pour les fichiers et un service de queue/worker séparé pour les traitements longs ou planifiés.
