# Gestion des flux et multi-tenancy

Ce document explique comment organiser les rôles (administrateurs par établissement versus développeur central), la séparation des données, les mécanismes de contrôle et les vérifications pour déployer l'application à plusieurs établissements.

## 1. Architecture de l'application

L'application est construite sur **Supabase / PostgreSQL** avec RLS (Row-Level Security). Chaque enregistrement (profils, classes, etc.) est associé à un **établissement** par une colonne `school_id` ou l'équivalent. Le modèle de données actuel n'a pas cette colonne mais il faudra l'ajouter pour produire un véritable multi-tenant.

Les tenants (établissements) accèdent à la même base, mais leurs données sont isolées par des politiques RLS. Cela évite le partage de données entre clients.

### 1.1 Modèle proposé
- `schools` table : liste des établissements.
- Toutes les tables métier (`profiles`, `classes`, `grades`, …) incluront `school_id uuid REFERENCES schools(id)`.
- Les policies RLS filtrent `school_id = current_setting('app.school_id')::uuid` ou sont basées sur le profil de l'utilisateur.

## 2. Rôles et permissions

| Rôle | Description | Visibilité/Accès |
|------|-------------|------------------|
| `developer` (vous) | Gestion du code, déploiement, configuration Supabase | Accès à la base complète (via service role key). Pas d'utilisation métier. |
| `superadmin` (optionnel) | Comptes internes de l'entreprise SaaS | Peut voir/éditer tous les établissements (si nécessaire). |
| `admin` d'établissement | Administrateur d'un établissement spécifique | Gère uniquement les données de son établissement (politiques RLS). Pas d'accès aux autres. |
| `teacher`, `student`, `parent` | Utilisateurs métier rattachés à un établissement | Restrictions RLS encore plus strictes (leur propre profil, classe, etc.) |

### 2.1 Différence entre développeur et admins établissements
- Vous, en tant que développeur, détenez **la clé de service (service_role)** qui ignore RLS et vous permet de créer/ou mettre à jour des schémas, des policies, de lire toutes les données à des fins de debug/migration.
- Les `admin` des établissements utilisent les comptes Supabase authentifiés ; leur session est soumise aux policies RLS. Ils ne voient que leur tenant.

## 3. Isolation et échange de données

Si les données sont correctement associées à un `school_id` et les policies RLS appliquées, **il n'y a aucun échange de données automatique** entre établissements. Chaque requête client inclut implicitement ou explicitement `school_id` via la logique de policy.

Si vous découvrez un accès inter-tenant, c'est généralement dû à un manque de condition `AND school_id = ...` dans une policy ou une jointure mal construite. Vous pouvez vérifier en analysant les policies :

```sql
SELECT policyname, tablename, permissive, using, check
FROM pg_policies
WHERE schemaname = 'public';
```

Et en testant via un compte d'un établissement A puis B.

## 4. Vérifications et contrôles

1. **Revue des policies RLS** : s'assurer que chaque table dispose d'une clause `USING (school_id = auth.uid() OR exists(...))` ou utilisant `current_setting`.
2. **Tests de confinement** : automatiser des requêtes avec des comptes factices attachés à différents school_id, tenter de lire/écrire dans les autres.
3. **Audits** : capture des requêtes (log PostgreSQL) pour confirmer que la `school_id` est toujours présente.
4. **Déploiement** : garder un environnement de staging séparé, et limiter l'accès service_role à des membres de l'équipe.

## 5. Accès et responsabilité du développeur

- **Clés** : Ne partagez jamais la `service_role` aux admins de clients. Fournissez-le uniquement au personnel de maintenance.
- **Mises à jour** : vous appliquerez migrations, corrections de bugs, modifications RLS via scripts/migrations stockés dans le repo (`supabase/migrations`).
- **Monitoring** : mettez en place des alertes d'erreur (Sentry, logs Supabase) pour détecter les accès non autorisés.

## 6. Autres informations importantes

- **Quota d'email** : Supabase impose un rate limit. Prévoir des mécanismes d'envoi externe (SendGrid) si usage intensif.
- **Environnement** : prévoir des variables d'environnement pour `SUPABASE_URL`, `SERVICE_ROLE_KEY`,  `ANON_KEY` par tenant si vous montez des déploiements isolés.
- **RGPD / Sécurité** : chiffrement des données sensibles, politique de sauvegarde.
- **Utilisateurs multiples** : une structure de `profiles` avec `id` globalement unique (uuid) et `school_id` pour l'isolation.

---

Ce document doit être ajouté à la documentation de projet (README ou dossier `docs/`). Il servira de référence pour la maintenance et la conformité lorsque plusieurs établissements utiliseront la plateforme.