import type { ArtifactSet } from '../../types/artifact'
import { fetchWithRetry } from '../../utils/common'

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
      let artifactSets: ArtifactSet[] = []

      if (gameUpper === 'GI') {
        // GI: artifact-sets.json
        artifactSets = await this.loadArtifactFile('/data/GI/artifact-sets.json', gameUpper)
      } else if (gameUpper === 'HSR') {
        // HSR: merge relic-sets.json and planetary-sets.json
        const relicSets = await this.loadArtifactFile('/data/HSR/relic-sets.json', gameUpper)
        const planetarySets = await this.loadArtifactFile('/data/HSR/planetary-sets.json', gameUpper)
        artifactSets = [...relicSets, ...planetarySets]
      } else if (gameUpper === 'ZZZ') {
        // ZZZ: disk-drives.json
        artifactSets = await this.loadArtifactFile('/data/ZZZ/disk-drives.json', gameUpper)
      } else {
        console.warn(`[artifactSetService] Unknown game: ${gameUpper}`)
        return []
      }

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
      // Cache empty array to avoid repeated failed requests
      this.cache.set(gameUpper, [])
      return []
    }
  }

  /**
   * Load artifact data from a JSON file
   * 
   * @param filePath - Path to the JSON file
   * @param game - Game code for error messages
   * @returns Array of artifact sets
   */
  private async loadArtifactFile(filePath: string, game: string): Promise<ArtifactSet[]> {
    try {
      const response = await fetchWithRetry(filePath, {}, 3, 300, 10000)
      
      const responseStatus = response.status
      const contentType = response.headers.get('content-type') || ''

      if (responseStatus !== 200) {
        console.error(`[artifactSetService] Non-200 response for ${filePath}:`, {
          status: responseStatus,
          contentType: contentType,
          url: filePath,
          fullUrl: window.location.origin + filePath
        })
        return []
      }

      const text = await response.text()
      const trimmedText = text.trim()
      
      // Check if response is HTML (404 page, etc.)
      if (trimmedText.startsWith('<!') || trimmedText.startsWith('<html') || trimmedText.toLowerCase().startsWith('<!doctype')) {
        const htmlPreview = text.substring(0, 500)
        console.error(`[artifactSetService] Received HTML instead of JSON from ${filePath}:`, {
          status: responseStatus,
          contentType: contentType,
          htmlPreview: htmlPreview,
          url: filePath,
          fullUrl: window.location.origin + filePath,
          suggestion: 'Check if file exists in public/data directory'
        })
        return []
      }

      if (!contentType.includes('application/json') && !contentType.includes('text/json')) {
        console.warn(`[artifactSetService] Unexpected content-type for ${filePath}: ${contentType}. Attempting to parse as JSON.`)
      }

      let data: any
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error(`[artifactSetService] Failed to parse response from ${filePath} as JSON. Content-type: ${contentType}.`)
        return []
      }

      // Ensure data is an array
      return Array.isArray(data) ? data : []
    } catch (error: any) {
      console.error(`[artifactSetService] Error loading ${filePath}:`, {
        message: error?.message,
        status: error?.status,
        url: filePath,
        fullUrl: window.location.origin + filePath
      })
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

