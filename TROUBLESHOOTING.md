# Dépannage - Erreurs Supabase

## Erreurs Rencontrées

### 1. **404 (Not Found) sur `subjects`**
```
GET https://njiwgecenbhkgfbdrlwl.supabase.co/rest/v1/subjects?select=id 404 (Not Found)
```

**Lieu:** AdminDashboard.tsx (ligne 64)

**Cause Possible:**
- La migration `20260111234103_create_school_platform_schema.sql` n'a pas été exécutée sur Supabase
- La table `subjects` n'existe pas dans la base de données

**Solutions:**
1. **Vérifier les migrations Supabase:**
   - Allez sur le Dashboard Supabase
   - Allez dans "SQL Editor" → "Migrations"
   - Vérifiez que les migrations ont été exécutées avec succès

2. **Exécuter les migrations manuellement:**
   ```bash
   supabase db push
   ```

3. **Ou exécuter le SQL directement dans Supabase SQL Editor:**
   ```sql
   CREATE TABLE IF NOT EXISTS subjects (
     id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
     name text NOT NULL,
     code text UNIQUE,
     description text,
     created_at timestamptz DEFAULT now()
   );
   
   ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "All authenticated can view subjects"
     ON subjects FOR SELECT
     TO authenticated
     USING (true);
   
   CREATE POLICY "Admins can manage subjects"
     ON subjects FOR ALL
     TO authenticated
     USING (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid() AND role = 'admin'
       )
     )
     WITH CHECK (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

4. **Insérer les données de démonstration:**

   **Option A - Via la CLI Supabase (Recommandé):**
   ```bash
   supabase db push
   ```
   Cette commande exécute automatiquement toutes les migrations, y compris `insert_demo_data.sql`

   **Option B - Exécuter directement dans Supabase SQL Editor:**
   1. Ouvrez le [Dashboard Supabase](https://app.supabase.com)
   2. Allez à **SQL Editor**
   3. Cliquez sur **New Query**
   4. Copiez-collez le contenu du fichier `supabase/migrations/20260111234656_insert_demo_data.sql`
   5. Cliquez sur **Run**

   **Option C - Via la ligne de commande Supabase:**
   ```bash
   # Exécuter une migration spécifique
   supabase db execute --file supabase/migrations/20260111234656_insert_demo_data.sql
   ```

---

### 2. **400 (Bad Request) sur `profiles`**
```
GET https://njiwgecenbhkgfbdrlwl.supabase.co/rest/v1/profiles?select=*&order=created_at.desc&limit=5 400 (Bad Request)
```

**Lieu:** AdminDashboard.tsx (lignes 68-72)

**Cause Possible:**
- Les politiques RLS de la table `profiles` empêchent la lecture
- Un problème de chaînage des requêtes

**Solutions:**

1. **Vérifier les politiques RLS:**
   - Les politiques `USING` et `WITH CHECK` doivent permettre aux admins de lire tous les profils
   - La politique "Admins can view all profiles" (ligne 327-335 du schéma) doit exister

2. **Exécuter le SQL pour ajouter les politiques si elles manquent:**
   ```sql
   CREATE POLICY "Admins can view all profiles"
     ON profiles FOR SELECT
     TO authenticated
     USING (
       EXISTS (
         SELECT 1 FROM profiles
         WHERE id = auth.uid() AND role = 'admin'
       )
     );
   ```

3. **Alternative - Simplifier la requête pour tester:**
   ```tsx
   // Au lieu de:
   const recentUsersRes = await supabase
     .from('profiles')
     .select('*')
     .order('created_at', { ascending: false })
     .limit(5);
   
   // Essayer sans order d'abord:
   const recentUsersRes = await supabase
     .from('profiles')
     .select('*')
     .limit(5);
   ```

4. **Vérifier les données de la table:**
   - Assurez-vous qu'il y a des données dans la table `profiles`
   - Vérifiez que votre utilisateur administrateur existe réellement

---

## Checklist de Déploiement

- [ ] Vérifier que toutes les migrations ont été exécutées sur Supabase
- [ ] Vérifier que les tables existent: `subjects`, `profiles`, `classes`, `students`
- [ ] Vérifier que les politiques RLS sont correctes
- [ ] Vérifier que les données de démonstration ont été insérées
- [ ] Tester la connexion avec un compte admin
- [ ] Vérifier les onglets Network dans les dev tools du navigateur pour les erreurs

---

## Commandes Utiles

```bash
# Synchroniser la base locale avec Supabase
supabase db push

# Vérifier l'état de la base
supabase status

# Exécuter une migration spécifique
supabase db execute --file supabase/migrations/20260111234103_create_school_platform_schema.sql
```
