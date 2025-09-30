// Utilitaires de chiffrement côté client
// Note: Pour la production, utilisez une bibliothèque de chiffrement plus robuste

export class SimpleEncryption {
  private static readonly KEY = 'workshop-llm-encryption-key-2024';

  static encrypt(text: string): string {
    try {
      // Chiffrement simple avec btoa (Base64) + clé
      const combined = this.KEY + text;
      return btoa(combined);
    } catch (error) {
      console.error('Erreur de chiffrement:', error);
      return text;
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      // Déchiffrement simple avec atob (Base64) + clé
      const decrypted = atob(encryptedText);
      return decrypted.replace(this.KEY, '');
    } catch (error) {
      console.error('Erreur de déchiffrement:', error);
      return encryptedText;
    }
  }

  // Masquer complètement une clé API pour l'affichage
  static maskApiKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 8) return '••••••••';
    return '••••••••••••••••';
  }
}
