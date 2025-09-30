import { createClient } from '@/lib/supabase/client';
import { ApiKey, CreateApiKeyRequest, ApiKeyResponse, LLMProvider } from '@/types/api-keys';
import { SimpleEncryption } from './encryption';

export class ApiKeyService {
  private static supabase = createClient();

  // Récupérer toutes les clés API de l'utilisateur
  static async getUserApiKeys(): Promise<ApiKey[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await this.supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des clés API:', error);
      return [];
    }
  }

  // Récupérer une clé API pour un provider spécifique
  static async getApiKeyForProvider(provider: LLMProvider): Promise<string | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await this.supabase
        .from('api_keys')
        .select('api_key_encrypted')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la récupération de la clé API:', error);
        return null;
      }

      if (!data) return null;

      // Déchiffrer la clé
      return SimpleEncryption.decrypt(data.api_key_encrypted);
    } catch (error) {
      console.error('Erreur lors de la récupération de la clé API:', error);
      return null;
    }
  }

  // Sauvegarder une nouvelle clé API
  static async saveApiKey(request: CreateApiKeyRequest): Promise<ApiKeyResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      // Chiffrer la clé API
      const encryptedKey = SimpleEncryption.encrypt(request.api_key);

      // Vérifier si une clé existe déjà pour ce provider
      const { data: existingKey } = await this.supabase
        .from('api_keys')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', request.provider)
        .maybeSingle();

      let result;
      if (existingKey) {
        // Mettre à jour la clé existante
        const { data, error } = await this.supabase
          .from('api_keys')
          .update({
            api_key_encrypted: encryptedKey,
            active: true,
          })
          .eq('id', existingKey.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Créer une nouvelle clé
        const { data, error } = await this.supabase
          .from('api_keys')
          .insert({
            user_id: user.id,
            provider: request.provider,
            api_key_encrypted: encryptedKey,
            active: true,
          })
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la clé API:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  // Supprimer une clé API
  static async deleteApiKey(provider: LLMProvider): Promise<ApiKeyResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      const { error } = await this.supabase
        .from('api_keys')
        .update({ active: false })
        .eq('user_id', user.id)
        .eq('provider', provider);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la clé API:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }

  // Vérifier si une clé API existe pour un provider
  static async hasApiKeyForProvider(provider: LLMProvider): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await this.supabase
        .from('api_keys')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .eq('active', true)
        .maybeSingle();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  // Récupérer le provider actif de l'utilisateur
  static async getActiveProvider(): Promise<LLMProvider | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await this.supabase
        .from('api_keys')
        .select('provider')
        .eq('user_id', user.id)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la récupération du provider actif:', error);
        return null;
      }

      if (!data) return null;
      return data.provider as LLMProvider;
    } catch (error) {
      console.error('Erreur lors de la récupération du provider actif:', error);
      return null;
    }
  }

  // Définir le provider actif
  static async setActiveProvider(provider: LLMProvider): Promise<ApiKeyResponse> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      // Désactiver toutes les clés existantes
      const { error: deactivateError } = await this.supabase
        .from('api_keys')
        .update({ active: false })
        .eq('user_id', user.id)
        .neq('active', false); // Seulement si elles sont actives

      if (deactivateError) {
        console.error('Erreur lors de la désactivation des clés:', deactivateError);
        // Continue même en cas d'erreur
      }

      // Vérifier si une clé existe pour ce provider avant de l'activer
      const { data: existingKey, error: checkError } = await this.supabase
        .from('api_keys')
        .select('id')
        .eq('user_id', user.id)
        .eq('provider', provider)
        .maybeSingle();

      if (checkError) {
        console.error('Erreur lors de la vérification de la clé:', checkError);
        return { success: false, error: checkError.message };
      }

      // Si une clé existe, l'activer
      if (existingKey) {
        const { data, error: activateError } = await this.supabase
          .from('api_keys')
          .update({ active: true })
          .eq('id', existingKey.id)
          .select()
          .single();

        if (activateError) {
          console.error('Erreur lors de l\'activation du provider:', activateError);
          return { success: false, error: activateError.message };
        }

        return { success: true, data };
      }

      // Si aucune clé n'existe pour ce provider, c'est normal
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la définition du provider actif:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  }
}
