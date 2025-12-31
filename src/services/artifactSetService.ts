import type { ArtifactSet } from '../types/artifact'
import { fetchWithRetry } from '../utils/fetchWithRetry'

/**
 * Service for fetching artifact set data from JSON files
 */
class ArtifactSetService {
  private cache = new Map<string, ArtifactSet[]>()

  /**
   * Get artifact sets for a specific game
   * 
   * @param game - Game code ('GI', 'HSR', 'ZZZ')
   * @returns Array of artifact sets
   */
  async getArtifactSets(game: string): Promise<ArtifactSet[]> {
    const gameUpper = game.toUpperCase()
    
    // Check cache first
    if (this.cache.has(gameUpper)) {
      return this.cache.get(gameUpper)!
    }

    try {
      // Map game codes to file paths
      const fileMap: Record<string, string> = {
        'GI': '/data/gi/artifacts.json',
        'HSR': '/data/hsr/relics.json',
        'ZZZ': '/data/zzz/disks.json'
      }

      const filePath = fileMap[gameUpper]
      if (!filePath) {
        console.warn(`[artifactSetService] Unknown game: ${gameUpper}`)
        return []
      }

      const response = await fetchWithRetry(filePath)
      if (!response.ok) {
        console.warn(`[artifactSetService] File not found: ${filePath} (${response.status})`)
        // Cache empty array to avoid repeated failed requests
        this.cache.set(gameUpper, [])
        return []
      }

      const data = await response.json()
      
      // Ensure data is an array
      const artifactSets: ArtifactSet[] = Array.isArray(data) ? data : []
      
      // Add game property to each set if not present
      artifactSets.forEach(set => {
        if (!set.game) {
          set.game = gameUpper as 'GI' | 'HSR' | 'ZZZ'
        }
      })

      // Cache the result
      this.cache.set(gameUpper, artifactSets)
      
      return artifactSets
    } catch (error) {
      console.error(`[artifactSetService] Error loading artifact sets for ${gameUpper}:`, error)
      return []
    }
  }

  /**
   * Get a specific artifact set by name
   * 
   * @param name - Artifact set name
   * @param game - Game code ('GI', 'HSR', 'ZZZ')
   * @returns Artifact set or null if not found
   */
  async getArtifactSet(name: string, game: string): Promise<ArtifactSet | null> {
    const sets = await this.getArtifactSets(game)
    return sets.find(set => 
      set.name.toLowerCase() === name.toLowerCase()
    ) || null
  }

  /**
   * Clear cache for a specific game or all games
   * 
   * @param game - Optional game code to clear specific cache
   */
  clearCache(game?: string): void {
    if (game) {
      this.cache.delete(game.toUpperCase())
    } else {
      this.cache.clear()
    }
  }
}

export const artifactSetService = new ArtifactSetService()

