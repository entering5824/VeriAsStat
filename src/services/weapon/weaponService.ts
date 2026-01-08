import type { BaseWeapon, Weapon } from '../../types/weapon'

// Cache for loaded weapons
const weaponCache = new Map<string, BaseWeapon[]>()

async function loadWeaponsForGame(game: string): Promise<BaseWeapon[]> {
  const cacheKey = game.toUpperCase()
  
  if (weaponCache.has(cacheKey)) {
    return weaponCache.get(cacheKey)!
  }

  try {
    let filePath = ''
    
    if (game === 'GI') {
      filePath = '/data/gi/weapons.json'
    } else if (game === 'HSR') {
      filePath = '/data/hsr/lightcones.json'
    } else if (game === 'ZZZ') {
      filePath = '/data/zzz/wengines.json'
    } else {
      return []
    }
    
    const response = await fetch(filePath)
    if (!response.ok) {
      throw new Error(`Failed to load weapons for ${game}`)
    }
    
    const weapons = await response.json()
    weaponCache.set(cacheKey, weapons)
    return weapons
  } catch (error) {
    console.error(`Error loading weapons for ${game}:`, error)
    return []
  }
}

export const weaponService = {
  async getWeapons(game: string): Promise<BaseWeapon[]> {
    return loadWeaponsForGame(game)
  },

  async getWeapon(id: string, game: string): Promise<Weapon | null> {
    const weapons = await loadWeaponsForGame(game)
    return weapons.find((w: BaseWeapon) => {
      const wid = (w as any)._id || (w as any).id || (w as any).weaponId
      return String(wid) === String(id)
    }) as Weapon | null
  }
}

