/**
 * LRU Cache with TTL (Time To Live) support
 * 
 * @template K - Key type
 * @template V - Value type
 */
export class LRUCache<K, V> {
  private max: number
  private map = new Map<K, { value: V; expiresAt?: number }>()

  /**
   * @param max - Maximum number of entries (default: 50)
   */
  constructor(max = 50) {
    this.max = max
  }

  /**
   * Get value from cache
   * Returns undefined if key doesn't exist or entry has expired
   * 
   * @param key - Cache key
   * @returns Cached value or undefined
   */
  get(key: K): V | undefined {
    const entry = this.map.get(key)
    
    if (!entry) {
      return undefined
    }
    
    // Check if entry has expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.map.delete(key)
      return undefined
    }
    
    // Move to end (most recently used)
    this.map.delete(key)
    this.map.set(key, entry)
    
    return entry.value
  }

  /**
   * Set value in cache
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (optional)
   */
  set(key: K, value: V, ttl?: number): void {
    // Remove existing entry if present
    if (this.map.has(key)) {
      this.map.delete(key)
    }
    
    // Calculate expiration time if TTL provided
    const expiresAt = ttl ? Date.now() + ttl : undefined
    
    // Add new entry
    this.map.set(key, { value, expiresAt })
    
    // Evict oldest entry if cache is full
    if (this.map.size > this.max) {
      const firstKey = this.map.keys().next().value
      if (firstKey !== undefined) {
        this.map.delete(firstKey)
      }
    }
  }

  /**
   * Delete entry from cache
   * 
   * @param key - Cache key
   */
  delete(key: K): void {
    this.map.delete(key)
  }

  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.map.clear()
  }

  /**
   * Get current cache size
   * 
   * @returns Number of entries in cache
   */
  size(): number {
    return this.map.size
  }

  /**
   * Check if key exists in cache (and hasn't expired)
   * 
   * @param key - Cache key
   * @returns True if key exists and is valid
   */
  has(key: K): boolean {
    const entry = this.map.get(key)
    
    if (!entry) {
      return false
    }
    
    // Check if entry has expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.map.delete(key)
      return false
    }
    
    return true
  }
}

