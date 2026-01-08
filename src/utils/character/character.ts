/**
 * Game type for character utilities
 */
export type Game = 'GI' | 'HSR' | 'ZZZ'

/**
 * Format priority by game (first format is preferred)
 */
export const GAME_FORMAT_PRIORITY: Record<Game, string[]> = {
  GI: ['png', 'webp'],
  HSR: ['png', 'webp'],
  ZZZ: ['webp', 'png']
}

/**
 * Build image path for a character
 * 
 * @param game - Game type (GI, HSR, ZZZ)
 * @param type - Image type ('icon' or 'splash')
 * @param name - Character name or filename (without extension)
 * @param ext - File extension (png, webp, etc.)
 * @returns Full image path
 */
function buildPath(game: Game, type: 'icon' | 'splash', name: string, ext: string): string {
  const gameLower = game.toLowerCase()
  const typeFolder = type === 'icon' ? 'icon' : 'splashart'
  return `/images/${gameLower}/characters/${typeFolder}/${encodeURIComponent(name)}.${ext}`
}

/**
 * Extract character name from path or character object
 * Uses same logic as VersionCard for consistency
 * 
 * @param char - Character object or path string
 * @returns Character name/filename (cleaned and normalized)
 */
function extractCharacterName(char: any): string {
  if (typeof char === 'string') {
    // If it's a path, extract the filename
    const match = char.match(/\/([^/]+)\.(png|jpg|jpeg|webp)$/i)
    if (match) return match[1]!
    return char
  }
  
  // Try to get name from character object (same as VersionCard)
  if (char?.name) {
    // Clean name: remove rarity stars, parentheses, trim
    const cleanName = char.name
      .replace(/\s*\d+★.*$/i, '')  // Remove " 5★" suffix
      .replace(/\s*\(.*?\)\s*/g, '')  // Remove parentheses content
      .trim()
    
    // Normalize for path: lowercase, replace spaces with underscore, remove special chars
    return cleanName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  }
  
  // Try to extract from iconPath or splashPath
  const path = char?.iconPath || char?.character?.iconPath || char?.splashPath || char?.character?.splashPath || ''
  if (path) {
    const match = path.match(/\/([^/]+)\.(png|jpg|jpeg|webp)$/i)
    if (match) {
      // Remove extension and return
      return match[1]
    }
  }
  
  return ''
}

/**
 * Get game type from character object
 * 
 * @param char - Character object
 * @returns Game type or 'GI' as default
 */
function getGameFromChar(char: any): Game {
  const game = char?.game || char?.character?.game || 'GI'
  const gameUpper = game.toUpperCase()
  if (gameUpper === 'GI' || gameUpper === 'HSR' || gameUpper === 'ZZZ') {
    return gameUpper as Game
  }
  return 'GI'
}

/**
 * Returns array of candidate URLs in order of preference.
 * Consumer can attempt them in order or use <picture>/<source> where appropriate.
 * 
 * @param game - Game type (GI, HSR, ZZZ)
 * @param type - Image type ('icon' or 'splash')
 * @param name - Character name or filename (without extension)
 * @returns Array of candidate URLs in priority order
 */
export function getCharacterImageCandidates(
  game: Game,
  type: 'icon' | 'splash',
  name: string
): string[] {
  const exts = GAME_FORMAT_PRIORITY[game] ?? ['webp', 'png']
  return exts.map(ext => buildPath(game, type, name, ext))
}

/**
 * Returns srcset string for responsive loading
 * 
 * @param game - Game type (GI, HSR, ZZZ)
 * @param type - Image type ('icon' or 'splash')
 * @param name - Character name or filename (without extension)
 * @param widths - Array of image widths for srcset (default: [64, 128, 256])
 * @returns Srcset string like "/.../name@64.webp 64w, /.../name@128.webp 128w"
 */
export function makeSrcSet(
  game: Game,
  type: 'icon' | 'splash',
  name: string,
  widths: number[] = [64, 128, 256]
): string {
  const exts = GAME_FORMAT_PRIORITY[game] ?? ['webp', 'png']
  const chosen = exts[0] // Use preferred format for srcset
  
  return widths
    .map(w => {
      const gameLower = game.toLowerCase()
      const typeFolder = type === 'icon' ? 'icon' : 'splashart'
      const path = `/images/${gameLower}/characters/${typeFolder}/${encodeURIComponent(name)}@${w}.${chosen}`
      return `${path} ${w}w`
    })
    .join(', ')
}

/**
 * Get placeholder URL for missing images
 * 
 * @param game - Game type (GI, HSR, ZZZ)
 * @param type - Image type ('icon' or 'splash')
 * @returns Placeholder image URL
 */
export function placeholderFor(game: Game, type: 'icon' | 'splash'): string {
  return `/images/shared/placeholder/${type}-${game.toLowerCase()}.png`
}

/**
 * Get character icon URL (backward compatible)
 * Uses same logic as VersionCard: prefer iconPath from data, fallback to constructed path
 * 
 * @param char - Character object
 * @returns Icon URL
 */
export function getCharacterIconUrl(char: any): string {
  if (!char) return getFallbackIconUrl()
  
  const game = getGameFromChar(char)
  const iconPath = char.iconPath || char.character?.iconPath || ''
  
  let basePath: string
  
  if (iconPath) {
    // Use iconPath from character data (remove extension if present)
    // Preserve original case from path (file may have uppercase first letter)
    basePath = iconPath.replace(/\.(png|jpg|jpeg|webp)$/i, '')
  } else {
    // Fallback: construct path from name and game (same as VersionCard)
    const name = extractCharacterName(char)
    if (!name) return getFallbackIconUrl()
    
    const gamePath = game.toLowerCase()
    basePath = `/images/${gamePath}/characters/icon/${name}`
  }
  
  // Get format based on game
  const format = GAME_FORMAT_PRIORITY[game]?.[0] || 'png'
  return `${basePath}.${format}`
}

/**
 * Get character splash URL (backward compatible)
 * Uses same logic as VersionCard: prefer splashPath from data, fallback to constructed path
 * 
 * @param char - Character object
 * @returns Splash URL
 */
export function getCharacterSplashUrl(char: any): string {
  if (!char) return ''
  
  const game = getGameFromChar(char)
  const splashPath = char.splashPath || char.character?.splashPath || ''
  
  let basePath: string
  
  if (splashPath) {
    // Use splashPath from character data (remove extension if present)
    // Normalize path: replace /splash/ with /splashart/ if needed
    // Preserve original case from path (file may have uppercase first letter)
    basePath = splashPath.replace(/\.(png|jpg|jpeg|webp)$/i, '').replace(/\/splash\//g, '/splashart/')
  } else {
    // Fallback: construct path from name and game (same as VersionCard)
    const name = extractCharacterName(char)
    if (!name) return ''
    
    const gamePath = game.toLowerCase()
    basePath = `/images/${gamePath}/characters/splashart/${name}`
  }
  
  // Get format based on game
  const format = GAME_FORMAT_PRIORITY[game]?.[0] || 'png'
  return `${basePath}.${format}`
}

/**
 * Get fallback icon URL (backward compatible)
 * 
 * @returns Fallback placeholder URL
 */
export function getFallbackIconUrl(): string {
  return '/images/shared/placeholder/character.png'
}

// Build guide helpers
export function isBuildGuideGI(guide: any): boolean {
  return guide?.game === 'GI' || guide?.weapons || guide?.artifactSets
}

export function isBuildGuideHSR(guide: any): boolean {
  return guide?.game === 'HSR' || guide?.lightCones || guide?.relicSets
}

export function isBuildGuideZZZ(guide: any): boolean {
  return guide?.game === 'ZZZ' || guide?.wEngines || guide?.diskSets
}

export function getBuildGuideGame(guide: any): string {
  if (isBuildGuideGI(guide)) return 'GI'
  if (isBuildGuideHSR(guide)) return 'HSR'
  if (isBuildGuideZZZ(guide)) return 'ZZZ'
  return 'GI'
}

export function getStatLabel(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase())
}

