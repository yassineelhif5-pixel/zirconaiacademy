# Guide de déploiement — ProjectAcademy

## Architecture cible

- Domaine : `projectacademy.zirconai.fr`
- Frontend Next.js : service Node.js derrière un reverse proxy HTTPS.
- API Django : service applicatif privé, exposant uniquement les routes nécessaires.
- PostgreSQL : réseau privé, sauvegardes chiffrées.
- Email : fournisseur transactionnel à choisir et configurer.

## DNS et TLS

Créer un enregistrement DNS pour `projectacademy.zirconai.fr` vers le point d'entrée de l'hébergement. Activer TLS et rediriger HTTP vers HTTPS. Le fournisseur DNS / hébergeur n'est pas défini par le dépôt.

## Variables backend

Définir au minimum :
- `DJANGO_SECRET_KEY` : secret aléatoire long et unique.
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS=projectacademy.zirconai.fr,api.projectacademy.zirconai.fr` (adapter aux domaines réellement retenus).
- `CORS_ALLOWED_ORIGINS=https://projectacademy.zirconai.fr`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`

Utiliser une base PostgreSQL managée ou protégée sur un réseau privé. Ne pas publier le port 5432 sur Internet.

## Variables frontend

Configurer `NEXT_PUBLIC_API_URL` avec l'URL HTTPS réelle de l'API. Ne jamais y placer de secret : toute variable `NEXT_PUBLIC_*` est visible dans le navigateur.

## Procédure

1. Provisionner les services et la base.
2. Installer les dépendances et lancer les migrations Django.
3. Créer un compte administrateur Django.
4. Construire Next.js (`npm ci && npm run build`) et lancer le serveur.
5. Configurer le reverse proxy, TLS, CORS et les contrôles de santé.
6. Tester l'inscription, l'intérêt produit, la validation du consentement et les erreurs API.
7. Activer sauvegardes, alertes, centralisation des logs et une politique de mise à jour.

## Emails et assistant IA

Aucun email n'est envoyé par ce starter : les demandes sont enregistrées dans l'administration. Avant activation, intégrer un prestataire email et tester délivrabilité, SPF, DKIM et DMARC.

L'assistant actuel est un FAQ guidé par des réponses éditorialement validées, pas un modèle génératif. Pour une future version LLM/RAG, utiliser une base de connaissances approuvée, des consignes anti-hallucination, des tests de réponses, un mécanisme d'escalade humaine et une journalisation limitée conforme au RGPD.

## Production et conformité

Avant ouverture publique, compléter les mentions légales, la politique de confidentialité, les modalités de retrait du consentement, les durées de conservation et le mécanisme d'effacement. Ajouter captcha / anti-bot, contrôles de débit au proxy et tests de sécurité.
