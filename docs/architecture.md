# Architecture et règles de publication

## Catalogue
- Smart Tower Project — disponible : https://www.smarttowerproject.zirconai.fr/
- GrowthAI — disponible : https://www.growthai.zirconai.fr/
- ZirconShield AI, Docyra AI, StockPilot AI, ZirconAcademy AI — disponible prochainement.

Les URL des produits disponibles sont externes. Les fiches projets futurs ne doivent pas suggérer que le produit est déjà livré.

## Formations
Les deux formations gratuites durent quatre heures. Le calendrier cible est les dimanches 7, 14, 21 et 28 février 2027. L'affectation finale d'un participant à une date est effectuée par l'équipe et confirmée par email ; ne pas afficher de confirmation automatique de date.

## Architecture logicielle
Le frontend Next.js présente le catalogue, les détails, les formulaires d'intérêt et d'inscription. L'API Django REST valide les entrées et stocke les demandes. PostgreSQL est utilisé en déploiement ; SQLite est prévu pour le développement sans configuration DB.

## Sécurité et transparence
- La clé secrète Django est obligatoire hors mode DEBUG.
- Les formulaires publics imposent le consentement et sont soumis au throttling DRF.
- Les emails ne sont pas encore envoyés automatiquement.
- L'assistant fourni est un FAQ à réponses préparées, pas un agent LLM/RAG connecté.
- Pas de stockage de mot de passe utilisateur ni d'espace de connexion dans cet incrément.
- Ajouter captcha, politique de rétention RGPD, procédure de suppression, SPF/DKIM/DMARC, supervision, sauvegardes et tests avant ouverture publique.
