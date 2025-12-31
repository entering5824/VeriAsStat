import type { Character } from '../../types/character'
import { fetchWithRetry } from '../../utils/fetchWithRetry'
import { LRUCache } from '../../utils/lruCache'
import { validateCharacters } from '../../schemas/character.schema'

// LRU Cache with TTL (1 hour default)
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds
const characterCache = new LRUCache<string, Character[]>(5) // Max 5 games cached

/**
 * Transform validated character entry to Character type
 * Flattens the nested character object structure
 */
function transformCharacterEntry(item: any, game: string): Character {
  return {
    ...item.character,
    id: item.id,
    _id: item.id,
    game: game.toUpperCase() as any,
    base_stats: item.base_stats,
    graduation_stats: item.graduation_stats,
    sub_stats: item.sub_stats,
    sections: item.sections || []
  }
}

/**
 * Load characters for a specific game with caching, retry, and validation
 * 
 * @param game - Game identifier (GI, HSR, ZZZ)
 * @returns Array of validated and transformed characters
 */
async function loadCharactersForGame(game: string): Promise<Character[]> {
  const cacheKey = game.toUpperCase()
  
  // Check cache first
  const cached = characterCache.get(cacheKey)
  if (cached) {
    return cached
  }

  try {
    const gameLower = game.toLowerCase()
    const url = `/data/${gameLower}/characters.json`
    
    // Fetch with retry and timeout
    const response = await fetchWithRetry(
      url,
      {},
      3, // 3 retries
      300, // 300ms initial backoff
      10000 // 10s timeout
    )
    
    const rawData = await response.json()
    
    // Validate with Zod schema
    const validatedEntries = validateCharacters(rawData)
    
    if (validatedEntries.length === 0) {
      console.warn(`No valid characters found for ${game} after validation`)
      return []
    }
    
    // Transform to Character type
    const characters: Character[] = validatedEntries.map(item =>
      transformCharacterEntry(item, game)
    )
    
    // Cache with TTL
    characterCache.set(cacheKey, characters, CACHE_TTL)
    
    return characters
  } catch (error) {
    console.error(`Error loading characters for ${game}:`, error)
    // Return empty array instead of throwing
    return []
  }
}

export const characterService = {
  /**
   * Get all characters for a game
   * 
   * @param game - Game identifier (GI, HSR, ZZZ)
   * @returns Array of characters
   */
  async getCharacters(game: string): Promise<Character[]> {
    return loadCharactersForGame(game)
  },

  /**
   * Get a single character by ID
   * 
   * @param id - Character ID
   * @param game - Game identifier (GI, HSR, ZZZ)
   * @returns Character or null if not found
   */
  async getCharacter(id: string, game: string): Promise<Character | null> {
    const characters = await loadCharactersForGame(game)
    return characters.find((c: Character) => {
      const cid = (c as any)._id || (c as any).id || (c as any).characterId
      return String(cid) === String(id)
    }) || null
  },

  /**
   * Find a character by name (fuzzy search)
   * 
   * @param name - Character name to search for
   * @param game - Game identifier (GI, HSR, ZZZ)
   * @returns Character or null if not found
   */
  async findCharacterByName(name: string, game: string): Promise<Character | null> {
    const characters = await loadCharactersForGame(game)
    const cleanName = name.replace(/\s*\d+★.*$/i, '').replace(/\s*\(.*?\)\s*/g, '').trim()
    
    return characters.find((c: Character) => {
      const charName = c.name || ''
      return charName.toLowerCase() === cleanName.toLowerCase() ||
             charName.toLowerCase().includes(cleanName.toLowerCase()) ||
             cleanName.toLowerCase().includes(charName.toLowerCase())
    }) || null
  },

  /**
   * Clear cache for a specific game or all games
   * 
   * @param game - Game identifier (optional, clears all if not provided)
   */
  clearCache(game?: string): void {
    if (game) {
      characterCache.delete(game.toUpperCase())
    } else {
      characterCache.clear()
    }
  }
}

