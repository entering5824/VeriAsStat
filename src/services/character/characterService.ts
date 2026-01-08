import type { Character } from '../../types/character'
import { fetchWithRetry, LRUCache } from '../../utils/common'
import { validateCharacters } from '../../schemas/character.schema'

// LRU Cache with TTL (1 hour default)
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds
const characterCache = new LRUCache<string, Character[]>(5) // Max 5 games cached

/**
 * Transform validated character entry to Character type
 * Handles both nested structure (with character object) and flat structure
 * Ensures iconPath and splashPath are preserved correctly
 */
function transformCharacterEntry(item: any, game: string): Character {
  // Check if this is a nested structure (has character object) or flat structure
  const isNested = item.character && typeof item.character === 'object'
  
  if (isNested) {
    // Nested structure: { id, character: { name, iconPath, ... }, base_stats, ... }
    return {
      ...item.character,
      id: item.id,
      _id: item.id,
      game: game.toUpperCase() as any,
      base_stats: item.base_stats,
      graduation_stats: item.graduation_stats,
      sub_stats: item.sub_stats,
      sections: item.sections || [],
      // Explicitly preserve iconPath and splashPath from character object
      iconPath: item.character?.iconPath,
      splashPath: item.character?.splashPath
    }
  } else {
    // Flat structure: { id, name, iconPath, splashPath, base_stats, ... }
    return {
      ...item,
      id: item.id,
      _id: item.id,
      game: game.toUpperCase() as any,
      base_stats: item.base_stats,
      graduation_stats: item.graduation_stats,
      sub_stats: item.sub_stats,
      sections: item.sections || [],
      // Preserve iconPath and splashPath from root level
      iconPath: item.iconPath,
      splashPath: item.splashPath
    }
  }
}

/**
 * Process raw character data and return validated characters
 */
function processCharacterData(rawData: any, game: string): Character[] {
  // Handle backward compatibility: convert { characters: [...] } to [...]
  let dataToValidate = rawData
  if (!Array.isArray(rawData) && rawData && typeof rawData === 'object' && Array.isArray(rawData.characters)) {
    console.warn(`Warning: ${game}/characters.json uses legacy format. Please run convert-to-array-format.js`)
    dataToValidate = rawData.characters
  }
  
  // Validate with Zod schema
  const validatedEntries = validateCharacters(dataToValidate)
  
  if (validatedEntries.length === 0) {
    console.warn(`No valid characters found for ${game} after validation`)
    return []
  }
  
  // Transform to Character type
  const characters: Character[] = validatedEntries.map(item =>
    transformCharacterEntry(item, game)
  )
  
  return characters
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
    let response: Response
    try {
      response = await fetchWithRetry(
        url,
        {},
        3, // 3 retries
        300, // 300ms initial backoff
        10000 // 10s timeout
      )
    } catch (fetchError: any) {
      // Log fetch error details
      console.error(`[characterService] Fetch error for ${url}:`, {
        message: fetchError?.message,
        status: fetchError?.status,
        url: url,
        fullUrl: window.location.origin + url
      })
      throw new Error(`Failed to fetch ${url}: ${fetchError?.message || 'Network error'}`)
    }
    
    // Log response details for debugging
    const responseStatus = response.status
    const responseStatusText = response.statusText
    const contentType = response.headers.get('content-type') || ''
    
    if (responseStatus !== 200) {
      console.error(`[characterService] Non-200 response for ${url}:`, {
        status: responseStatus,
        statusText: responseStatusText,
        contentType: contentType,
        url: url,
        fullUrl: window.location.origin + url
      })
      throw new Error(`HTTP ${responseStatus} ${responseStatusText} when fetching ${url}`)
    }
    
    // Get response text first to check if it's HTML
    const text = await response.text()
    
    // Check if response is HTML (common for 404 pages or error pages)
    const trimmedText = text.trim()
    if (trimmedText.startsWith('<!') || trimmedText.startsWith('<html') || trimmedText.toLowerCase().startsWith('<!doctype')) {
      // Log first 500 chars of HTML for debugging
      const htmlPreview = text.substring(0, 500)
      console.error(`[characterService] Received HTML instead of JSON from ${url}:`, {
        status: responseStatus,
        contentType: contentType,
        htmlPreview: htmlPreview,
        url: url,
        fullUrl: window.location.origin + url,
        suggestion: 'Check if file exists in public/data directory and Vite is configured to serve static files'
      })
      throw new Error(`Received HTML instead of JSON from ${url}. The file may not exist or the server returned an error page. Status: ${responseStatus}, Content-Type: ${contentType}`)
    }
    
    // Check content-type to ensure we got JSON (contentType already declared above)
    if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
      console.warn(`Unexpected content-type for ${url}: ${contentType}. Attempting to parse as JSON.`)
    }
    
    // Parse JSON from text
    let rawData: any
    try {
      rawData = JSON.parse(text)
    } catch (parseError) {
      throw new Error(`Failed to parse response from ${url} as JSON. Content-type: ${contentType}. Response may be HTML or invalid JSON.`)
    }
    
    // Process and validate character data
    const characters = processCharacterData(rawData, game)
    
    // Cache with TTL (even if empty, to prevent repeated failed requests)
    characterCache.set(cacheKey, characters, CACHE_TTL)
    
    return characters
  } catch (error: any) {
    // Log error with context
    const errorMessage = error?.message || 'Unknown error'
    console.error(`[characterService] Error loading characters for ${game}:`, errorMessage, error)
    
    // Cache empty array to prevent repeated failed requests for a short time (5 minutes)
    characterCache.set(cacheKey, [], 5 * 60 * 1000)
    
    // Return empty array instead of throwing to prevent error propagation
    // The calling code should check for empty array and handle accordingly
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

