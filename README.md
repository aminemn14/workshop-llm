# Workshop LLM

Application Next.js avec authentification Supabase, interface moderne avec TailwindCSS.

Il est possible d'importer un fichier PDF, de mettre sa clé LLM, ensuite l'outil va analyser le PDF, récupérer les différents produits, proposer de désélectionner certains puis de choisir la semaine de travail. Ensuite, un résumé va être affiché dans l'onglet Résumé, va afficher un tableau avec les différents produits sélectionnés dans Configuration, des logs de l'utilisation du LLM dans l'onglet Logs, l'onglet Json va lui contenir les informations, puis l'onglet Coûts va être un aperçu des coûts d'utilisation.

Nous avons commencé à travailler sur l'export des données vers un fichier Excel, sur la branche feature/recup-info-excel ainsi que sur la gestion des calculs sur la branche 

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. **Créer un projet Supabase** :
   - Allez sur [supabase.com](https://supabase.com)
   - Récupérez l'URL et la clé API

2. **Configurer les variables d'environnement** :
   ```bash
   cp .env.example .env.local
   ```
   
   Puis éditez `.env.local` avec vos clés Supabase :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_publique
   ```

### 3. Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🛠️ Technologies utilisées

- **Next.js 15** - Framework React avec App Router
- **Supabase** - Backend et authentification
- **TailwindCSS** - Framework CSS
- **TypeScript** - Typage statique
- **Zustand** - Gestion d'état

## 🔧 Scripts disponibles

```bash
npm run dev      # Démarrer en mode développement
npm run build    # Construire pour la production
npm run start    # Démarrer en mode production
npm run lint     # Vérifier le code avec ESLint
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
