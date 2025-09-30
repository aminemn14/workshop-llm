# Workshop LLM

Application Next.js avec authentification Supabase, interface moderne avec TailwindCSS.

## 🚀 Démarrage rapide

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration Supabase

1. **Créer un projet Supabase** :
   - Allez sur [supabase.com](https://supabase.com)
   - Créez un nouveau projet
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

3. **Configurer l'authentification dans Supabase** :
   - Allez dans **Authentication** > **Settings**
   - Décochez **"Enable email confirmations"** pour le développement
   - Ajoutez `http://localhost:3000` dans **Site URL**

### 3. Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🔐 Fonctionnalités d'authentification

- ✅ **Inscription/Connexion** avec email et mot de passe
- ✅ **Page de profil** protégée
- ✅ **Protection automatique** du dashboard
- ✅ **Déconnexion** avec bouton dans la TopBar
- ✅ **Validation d'email** côté client
- ✅ **Messages d'erreur** en français
- ✅ **Interface responsive** avec TailwindCSS

## 📁 Structure du projet

```
src/
├── app/
│   ├── login/page.tsx          # Page de connexion/inscription
│   ├── profile/page.tsx        # Page de profil protégée
│   ├── layout.tsx              # Layout avec AuthProvider
│   └── page.tsx                # Dashboard protégé
├── components/
│   ├── AuthGuard.tsx           # Protection des routes
│   └── TopBar.tsx              # Barre supérieure avec infos utilisateur
├── contexts/
│   └── AuthContext.tsx         # Contexte d'authentification
├── hooks/
│   ├── useAuth.ts              # Hook d'authentification
│   └── useRequireAuth.ts       # Hook de protection des routes
└── lib/
    └── supabase/
        ├── client.ts           # Client Supabase côté client
        └── server.ts           # Client Supabase côté serveur
```

## 🛠️ Technologies utilisées

- **Next.js 15** - Framework React avec App Router
- **Supabase** - Backend et authentification
- **TailwindCSS** - Framework CSS
- **TypeScript** - Typage statique
- **Zustand** - Gestion d'état

## 📝 Notes importantes

- **Développement** : Désactivez la confirmation d'email dans Supabase
- **Production** : Réactivez la confirmation d'email et configurez SMTP
- **Sécurité** : Ne commitez jamais vos clés API dans le code

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