/**
 * Asset loader for images, JSON, and audio files.
 * Caches loaded assets to prevent duplicate loads.
 */

export class AssetLoader {
  constructor() {
    this._cache = new Map();
    this._loading = new Map();
  }

  /**
   * Load an image asset.
   * @param {string} key - Cache key
   * @param {string} src - Image URL/path
   * @returns {Promise<HTMLImageElement>}
   */
  loadImage(key, src) {
    if (this._cache.has(key)) return Promise.resolve(this._cache.get(key));
    if (this._loading.has(key)) return this._loading.get(key);

    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this._cache.set(key, img);
        this._loading.delete(key);
        resolve(img);
      };
      img.onerror = () => {
        this._loading.delete(key);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });

    this._loading.set(key, promise);
    return promise;
  }

  /**
   * Load a JSON asset.
   * @param {string} key - Cache key
   * @param {string} src - JSON file URL/path
   * @returns {Promise<object>}
   */
  async loadJSON(key, src) {
    if (this._cache.has(key)) return this._cache.get(key);
    if (this._loading.has(key)) return this._loading.get(key);

    const promise = fetch(src)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load JSON: ${src} (${res.status})`);
        return res.json();
      })
      .then(data => {
        this._cache.set(key, data);
        this._loading.delete(key);
        return data;
      });

    this._loading.set(key, promise);
    return promise;
  }

  /**
   * Load multiple assets in parallel.
   * @param {Array<{ type: 'image'|'json', key: string, src: string }>} manifest
   * @returns {Promise<Map<string, any>>}
   */
  async loadAll(manifest) {
    const promises = manifest.map(entry => {
      if (entry.type === 'image') return this.loadImage(entry.key, entry.src);
      if (entry.type === 'json') return this.loadJSON(entry.key, entry.src);
      return Promise.reject(new Error(`Unknown asset type: ${entry.type}`));
    });

    await Promise.all(promises);
    return this._cache;
  }

  /** Get a cached asset by key. Returns undefined if not loaded. */
  get(key) {
    return this._cache.get(key);
  }

  /** Check if an asset is loaded. */
  has(key) {
    return this._cache.has(key);
  }

  /** Clear all cached assets. */
  clear() {
    this._cache.clear();
    this._loading.clear();
  }
}
