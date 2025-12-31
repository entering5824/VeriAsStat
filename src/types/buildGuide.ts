/**
 * Type definitions for Build Guide system
 * Supports Genshin Impact (GI), Honkai: Star Rail (HSR), and Zenless Zone Zero (ZZZ)
 */

// ============================================================================
// Stat Key Types (Tránh typo & lệch label)
// ============================================================================

/**
 * Genshin Impact stat keys
 */
export type GIStatKey =
  | 'hp'
  | 'atk'
  | 'def'
  | 'critRate'
  | 'critDmg'
  | 'em'
  | 'er'
  | 'healBonus'
  | 'shieldStrength'
  | 'elementalDmgBonus'

/**
 * Honkai: Star Rail stat keys
 */
export type HSRStatKey =
  | 'hp'
  | 'atk'
  | 'def'
  | 'critRate'
  | 'critDmg'
  | 'spd'
  | 'effectHitRate'
  | 'effectRes'
  | 'breakEffect'
  | 'energyRegen'
  | 'elementalDmgBonus'

/**
 * Zenless Zone Zero stat keys
 */
export type ZZZStatKey =
  | 'hp'
  | 'atk'
  | 'def'
  | 'critRate'
  | 'critDmg'
  | 'impact'
  | 'penRatio'
  | 'energyRegen'
  | 'skillPower'
  | 'anomalyProficiency'
  | 'anomalyMastery'
  | 'anomalyRate'
  | 'anomalyDmg'

// ============================================================================
// Shared Types
// ============================================================================

/**
 * Set piece trong một combination
 */
export interface SetPiece {
  name: string      // Tên set (ví dụ: "Emblem of Severed Fate")
  pieces: number    // Số piece (2 hoặc 4 cho GI/HSR, 2 hoặc 4 hoặc 6 cho ZZZ)
}

/**
 * Ranked set combination
 * LUÔN là array sets[], không bao giờ là 1 set đơn
 */
export interface RankedSetCombination {
  rank: number              // Thứ tự ưu tiên (1 = best)
  sets: SetPiece[]          // Array sets (có thể 2+2, 4, 4+2, etc.)
  note?: string             // Ghi chú (ví dụ: "Best for DPS")
}

/**
 * Ranked item (weapon/light cone/w-engine)
 */
export interface RankedItem {
  rank: number              // Thứ tự ưu tiên (1 = best)
  name: string              // Tên item
  note?: string             // Ghi chú (ví dụ: "5-star BiS")
}

/**
 * Substat priority với note (thay vì string[])
 */
export interface SubstatPriority {
  stat: string              // Stat name
  note?: string             // Ghi chú (ví dụ: "only until breakpoint", "if burst uptime issues")
}

// ============================================================================
// Graduation Stats (Format mới)
// ============================================================================

/**
 * Graduation stats - Target stats cuối game
 * Thay thế hoàn toàn GraduationStats cũ
 */
export interface GraduationStats<T extends string = string> {
  core: T[]                                         // Stat quan trọng nhất (priority order) - dùng StatKey type
  secondary?: T[]                                   // Stat phụ (optional)
  minimum?: Record<T, string | number>              // Minimum thresholds (ví dụ: { spd: ">= 134" })
  note?: string                                     // Ghi chú tổng quan
}

// ============================================================================
// Build Guide Base (Discriminator Field)
// ============================================================================

/**
 * Base interface với discriminator field
 * Giúp TypeScript narrow type tự động và giảm boilerplate code
 */
export interface BuildGuideBase {
  game: 'GI' | 'HSR' | 'ZZZ'    // Discriminator field - giảm 50% boilerplate UI + validation
  characterId: string            // Link đến Character
  title: string                  // Tên build (ví dụ: "Main DPS Build", "Support Build", "F2P Build")
  version: string                // Patch version (e.g., "4.4")
  lastUpdated: string            // ISO timestamp
  author?: string                // Optional author credit
  _schemaVersion?: string        // Schema version for migration tracking
}

// ============================================================================
// Game-Specific Build Guide Types
// ============================================================================

/**
 * Genshin Impact Build Guide
 */
export interface BuildGuideGI extends BuildGuideBase {
  game: 'GI'                     // Discriminator - TypeScript sẽ narrow type tự động
  
  weapons: RankedItem[]                    // Best weapons ranking
  artifactSets: RankedSetCombination[]     // Best artifact set combinations
  
  mainStats: {
    sands: string[]         // Main stat options cho sands (ví dụ: ["ATK%", "HP%", "ER"])
    goblet: string[]        // Main stat options cho goblet
    circlet: string[]       // Main stat options cho circlet
  }
  
  subStatsPriority: SubstatPriority[]      // Substats priority với notes (thay vì string[])
  graduationStats: GraduationStats<GIStatKey>  // Target stats format mới với type-safe keys
}

/**
 * Honkai: Star Rail Build Guide
 */
export interface BuildGuideHSR extends BuildGuideBase {
  game: 'HSR'                   // Discriminator
  
  relicSets: RankedSetCombination[]        // Best relic set combinations
  planarSets: RankedSetCombination[]       // Best planar set combinations
  lightCones: RankedItem[]                 // Best light cones ranking
  
  mainStats: {
    body: string[]          // Main stat options cho body
    feet: string[]          // Main stat options cho feet
    sphere: string[]        // Main stat options cho sphere
    rope: string[]          // Main stat options cho rope
  }
  
  subStatsPriority: SubstatPriority[]
  graduationStats: GraduationStats<HSRStatKey>
}

/**
 * Zenless Zone Zero Build Guide
 */
export interface BuildGuideZZZ extends BuildGuideBase {
  game: 'ZZZ'                   // Discriminator
  
  driveSets: RankedSetCombination[]        // Best drive set combinations
  wEngines: RankedItem[]                   // Best w-engines ranking
  
  mainStats: {
    disk4: string[]         // Main stat options cho disk 4
    disk5: string[]         // Main stat options cho disk 5
    disk6: string[]         // Main stat options cho disk 6
  }
  
  subStatsPriority: SubstatPriority[]
  graduationStats: GraduationStats<ZZZStatKey>
}

// ============================================================================
// Union Type
// ============================================================================

/**
 * Union type cho tất cả Build Guide types
 * Dùng với discriminated union pattern (discriminator: game field)
 */
export type BuildGuide = BuildGuideGI | BuildGuideHSR | BuildGuideZZZ
