# Guide de déploiement — ProjectAcademy

## Architecture cible

- Domaine : `projectacademy.zirconai.fr`
- Frontend Next.js : service Node.js derrière un reverse proxy HTTPS.
- API Django : service applicatif privé.
- Base de données : PostgreSQL managé Supabase (connexion directe ou pooler Supavisor).
- Email : fournisseur transactionnel à configurer.

## Provisionner Supabase

1. Créer un projet dans Supabase et choisir une région proche de l'hébergement de l'API.
2. Dans **Project Settings > Database > Connection string**, choisir le format URI.
3. Pour un backend Django/Gunicorn qui conserve ses connexions, utiliser de préférence le **Session pooler**. Le port et l'hôte doivent être ceux affichés dans le dashboard Supabase.
4. Copier l'URI dans le gestionnaire de secrets de l'hébergeur sous `DATABASE_URL`. Ne pas la placer dans le frontend, dans `NEXT_PUBLIC_*), dans Git ou dans un ticket public.
5. Définir `DB_POOLER_MODE=session`. Si l'infrastructure impose le Transaction pooler, définir `DB_POOLER_MODE=transaction` : le projet désactive alors les connexions persistantes et les curseurs serveur.
6. Vérifier que le mot de passe dans l'URI est correctement encodé en URL si celui-ci contient des caractères spéciaux.

Le backend utilise directement le moteur PostgreSQL de Supabase via psycopg et TLS obligatoire. Il n'utilise pas la clé Supabase `anon` ni la `service_role` : ces clés ne doivent pas être ajoutées au frontend pour cet accès Django. Les permissions applicatives sont gérées par Django. Restreindre les connexions réseau et ne jamais exposer le mot de passe PostgreSQL.

## Variables backend

Définir au minimum :
- `DJANGO_SECRET_KEY` : secret aléatoire long et unique.
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS` : noms d'hôtes réels.
- `CORS_ALLOWED_ORIGINS` : origine HTTPS du frontend.
- `DATABASE_URL` : URI PostgreSQL Supabase.
- `DB_POOLER_MODE=session` (ou `transaction` si port/endpoint transaction pooler).
- `GOOGLE_CLIENT_ID` et paramètres SMTP si ces fonctions sont activées.

Quand `DATABASE_URL` est présent, il est prioritaire sur les paramètres PostgreSQL locaux. Sans cette variable, Django conserve le fallback PostgreSQL local ou SQLite de développement.

## Migration et vérification

Après configuration du secret dans l'environnement backend :

```bash
cd backend
python manage.py check --deploy
python manage.py migrate --plan
python manage.py migrate
python manage.py showmigrations
python manage.py createsuperuser
```

Effectuer une sauvegarde Supabase avant toute migration en production. Les migrations Django créent les tables applicatives et les tables Django standard dans le schéma PostgreSQL configuré. Ne pas exécuter les migrations contre une base contenant déjà des données à conserver sans sauvegarde et plan de migration.

## Développement local

- Avec PostgreSQL local Docker : `docker compose --profile local-db up -d`, en laissant `DATABASE_URL` vide et `DB_HOST=db`.
- Avec Supabase : renseigner `DATABASE_URL` dans le fichier local `.env`, puis lancer `docker compose up -d --build`. Le conteneur PostgreSQL local est optionnel et n'est pas démarré par défaut.
- Sans PostgreSQL configuré, le lancement Django direct utilise SQLite pour le développement seulement.

## Frontend

Configurer `NEXT_PUBLIC_API_URL` avec l'URL HTTPS réelle de l'API. Ne jamais y placer d'identifiant ou de mot de passe PostgreSQL, ni de clé Supabase secrète.

## Sécurité, sauvegardes et exploitation

- Activer et vérifier les sauvegardes/PITR Supabase selon le plan choisi.
- Utiliser un mot de passe DB unique et le faire tourner périodiquement.
- Limiter les IP autorisées lorsque l'hébergement permet une sortie IP fixe.
- Ne pas exposer le port PostgreSQL à Internet.
- Activer TLS, secrets gérés par l'hébergeur, logs sans credentials et alertes de connexion.
- Tester restauration, migrations et accès apprenant/admin avant ouverture publique.
- Ajouter politiques de rétention et effacement RGPD.

## Emails et assistant IA

Configurer le prestataire email et tester la délivrabilité (SPF, DKIM, DMARC). L'assistant actuel est un FAQ guidé, pas un modèle génératif.
