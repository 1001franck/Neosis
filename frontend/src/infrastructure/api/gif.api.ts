/**
 * INFRASTRUCTURE - API GIF (Giphy)
 * Gère les appels à l'API Giphy pour les GIFs
 *
 * Endpoints utilisés :
 * - /trending : GIFs tendance
 * - /search   : Recherche par mot-clé
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- réponse brute Giphy API externe
type GiphyRaw = any;

const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? 'REMPLACE_PAR_MA_CLE_GIPHY';
const GIPHY_BASE_URL = 'https://api.giphy.com/v1/gifs';

/**
 * Résultat GIF normalisé pour le frontend
 */
export interface GifResult {
  id: string;
  title: string;
  /** URL envoyée dans le message (taille affichage chat) */
  url: string;
  /** URL miniature pour le picker (plus légère) */
  previewUrl: string;
  previewWidth: number;
  previewHeight: number;
}

/**
 * Convertit la réponse brute Giphy en GifResult[]
 */
function mapGifs(data: GiphyRaw[]): GifResult[] {
  return data
    .filter((gif) => gif?.images?.fixed_height?.url && gif?.images?.fixed_height_small?.url)
    .map((gif) => ({
      id: gif.id,
      title: gif.title ?? '',
      url: gif.images.fixed_height.url,
      previewUrl: gif.images.fixed_height_small.url,
      previewWidth: parseInt(gif.images.fixed_height_small.width ?? '100', 10),
      previewHeight: parseInt(gif.images.fixed_height_small.height ?? '80', 10),
    }));
}

export const gifApi = {
  /**
   * Récupère les GIFs tendance
   */
  async trending(limit = 24): Promise<GifResult[]> {
    const res = await fetch(
      `${GIPHY_BASE_URL}/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`
    );
    if (!res.ok) throw new Error(`Giphy trending error: ${res.status}`);
    const json = await res.json();
    return mapGifs(json.data ?? []);
  },

  /**
   * Recherche des GIFs par mot-clé
   */
  async search(query: string, limit = 24): Promise<GifResult[]> {
    if (!query.trim()) return gifApi.trending(limit);
    const res = await fetch(
      `${GIPHY_BASE_URL}/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}&rating=g`
    );
    if (!res.ok) throw new Error(`Giphy search error: ${res.status}`);
    const json = await res.json();
    return mapGifs(json.data ?? []);
  },
};
