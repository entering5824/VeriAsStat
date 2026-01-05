/**
 * Type definitions for Character system
 */

import type { GameKey, GameType } from './common'
export type { GameKey, GameType }
import type { BuildGuide } from './buildGuide'

/**
 * @deprecated Graduation stats structure - đã được thay thế bằng BuildGuide.graduationStats
 * Giữ lại để backward compatibility, sẽ được xóa trong tương lai
 * Sử dụng buildGuides[].graduationStats thay thế
 */
export interface LegacyGraduationStats {
  // Common stats (tất cả game)
  hp?: number
  atk?: number
  def?: number
  critRate?: number
  critDmg?: number

  // Genshin Impact specific
  em?: number              // Elemental Mastery
  er?: number              // Energy Recharge
  healBonus?: number       // Healing Bonus
  shieldStrength?: number  // Shield Strength
  elementalDmgBonus?: number // Elemental DMG Bonus

  // Honkai: Star Rail specific
  spd?: number             // Speed
  effectHitRate?: number   // Effect Hit Rate
  effectRes?: number       // Effect RES
  breakEffect?: number     // Break Effect
  energyRegen?: number     // Energy Regen Rate

  // Zenless Zone Zero specific
  impact?: number          // Impact
  penRatio?: number        // Pen Ratio
  skillPower?: number      // Skill Power
  anomalyProficiency?: number // Anomaly Proficiency
  anomalyMastery?: number  // Anomaly Mastery
  anomalyRate?: number     // Anomaly Rate
  anomalyDmg?: number      // Anomaly DMG
}

/**
 * Character model
 */
export interface GraduationStatsByGame {
  GI?: Record<string, number>
  HSR?: Record<string, number>
  ZZZ?: Record<string, number>
}

export interface SubStatsByGame {
  GI?: Record<string, number>
  HSR?: Record<string, number>
  ZZZ?: Record<string, number>
}

export interface Character {
  _id?: string
  id?: string
  _rev?: string                  // Revision identifier for optimistic concurrency
  characterId?: string
  name: string
  game: GameType
  role?: string[] // new schema: array of roles
  tier?: number
  element?: string
  weapon_type?: string
  weaponType?: string // backward compat
  rarity?: number
  skill_text?: string | null
  role_tags?: string[]
  sub_stats?: SubStatsByGame | null
  graduation_stats?: GraduationStatsByGame | null
  teammate?: string[]
  // Primary image paths (relative paths from public root)
  iconPath?: string  // e.g., "/images/gi/characters/icon/name.png"
  splashPath?: string  // e.g., "/images/gi/characters/splashart/name.png"
  // Deprecated: Firebase Storage URLs (kept for backward compatibility)
  imageUrlIcon?: string    // @deprecated Use iconPath instead
  imageUrlSplash?: string  // @deprecated Use splashPath instead
  /**
   * Build Guides - Array để hỗ trợ multiple builds (DPS/Support/F2P/Whale)
   * Mỗi build guide chứa recommendations cho weapons/sets, main stats, substats priority, và graduation stats
   */
  buildGuides?: BuildGuide[]
  /**
   * @deprecated Graduation stats cũ - đã được thay thế bằng buildGuides[].graduationStats
   * Giữ lại để backward compatibility, sẽ được xóa trong tương lai
   */
  graduationStats?: LegacyGraduationStats
  /**
   * Sections - Build guide sections (weapons, artifacts, materials, stats, etc.)
   */
  sections?: Section[]
  createdAt?: string
  updatedAt?: string
  _schemaVersion?: string        // Schema version for migration tracking
}

/**
 * Stat row for displaying in UI
 */
export interface StatRow {
  label: string
  value: string | number
}

/**
 * Section Item - Individual item within a section
 */
export interface SectionItem {
  rank?: number
  name?: string
  note?: string
  slot?: string
  stat?: string
  sets?: Array<{ name: string; pieces: number }>
}

/**
 * Section - Build guide section (weapons, artifacts, materials, stats, etc.)
 */
export interface Section {
  key: string
  title?: string
  type?: 'ranked-list' | 'list' | 'material-grid' | 'stat-grid' | 'set-combination' | 'stat-priority'
  items?: SectionItem[]
}

export type SectionType = Section['type']

/**
 * Character form data (for create/edit)
 */
export interface CharacterFormData extends Omit<Character, '_id' | 'createdAt' | 'updatedAt'> {
  // Form-specific fields nếu cần
}
