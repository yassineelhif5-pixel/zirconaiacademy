# ProjectAcademy by ZirconAI

Portail de présentation, de formation et de génération de prospects de ZirconAI.

## Produit
- Domaine cible : https://projectacademy.zirconai.fr
- Stack cible : Next.js (App Router) + TypeScript + Django REST Framework + PostgreSQL
- Identité : bleu nuit, or et turquoise, univers cyber / IA futuriste
- Formations gratuites de 4 heures, prévues les dimanches de février 2027 ; chaque date précise reste à confirmer par email.

## Catalogue
| Produit | Statut |
|---|---|
| Project Control Tower | Disponible — https://www.projectcontroltower.zirconia.fr |
| GrowthAI | Disponible — https://growthai.zirconai.fr |
| ZirconShield AI | Disponible prochainement |
| Docyra AI | Disponible prochainement |
| StockPilot AI | Disponible prochainement |
| ZirconAcademy AI | Disponible prochainement |

Les produits marqués « Disponible prochainement » ne doivent pas afficher de demande de démonstration comme s'ils étaient commercialisés. Ils peuvent proposer une inscription à une liste d'information.

## Structure prévue
- `frontend/` : application Next.js.
- `backend/` : API Django REST Framework.
- `docs/` : architecture, décisions et guide d'exploitation.

## Principes de sécurité
- Ne jamais stocker de secret dans Git.
- Les clés API et paramètres sensibles proviennent de variables d'environnement.
- L'assistant de formation doit répondre depuis une base de connaissances approuvée ; en cas d'information absente, il le dit poliment et propose un contact humain.
- La confirmation d'inscription est distincte d'une simple demande d'information.
- Prévoir consentement, minimisation, durée de conservation et suppression des données personnelles (RGPD).

## État initial
Ce dépôt était vide lors de son initialisation. Les dossiers applicatifs seront ajoutés par incréments testables. Aucun déploiement ni service externe n'est configuré par ce dépôt à lui seul.
