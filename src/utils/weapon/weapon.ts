/**
 * Get weapon icon URL
 * Supports WebP with PNG fallback
 */
export function getWeaponIconUrl(weapon: any): string {
  if (!weapon) return ''
  
  // If weapon has iconPath
  if (weapon.iconPath) {
    const basePath = weapon.iconPath.replace(/\.(png|jpg|jpeg|webp)$/i, '')
    return `${basePath}.png` // Default to PNG for weapons
  }
  
  // If weapon has icon
  if (weapon.icon) {
    return weapon.icon
  }
  
  // Fallback: construct from name and game
  const game = (weapon.game || 'GI').toUpperCase()
  const name = (weapon.name || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  
  if (!name) return ''
  
  // Weapon images are typically in /images/gi/weapons/
  return `/images/gi/weapons/${name}.png`
}

/**
 * Check if weapon is Genshin Impact weapon
 */
export function isGenshinWeapon(weapon: any): boolean {
  return (weapon?.game || '').toUpperCase() === 'GI'
}

/**
 * Check if weapon is Honkai: Star Rail light cone
 */
export function isHSRLightCone(weapon: any): boolean {
  return (weapon?.game || '').toUpperCase() === 'HSR'
}

/**
 * Check if weapon is Zenless Zone Zero W-Engine
 */
export function isZZZWEngine(weapon: any): boolean {
  return (weapon?.game || '').toUpperCase() === 'ZZZ'
}

