/**
 * Type definitions for Weapon system
 * Supports Genshin Impact (Weapons), Honkai: Star Rail (Light Cones), Zenless Zone Zero (W-Engines)
 */

import type { ConditionRule, GameType } from './common'
export type { GameType }

// ============================================================================
// Core Dataset (Game-agnostic)
// ============================================================================

/**
 * WeaponCore - Game-agnostic core data for clustering, rarity bias, meta analysis
 */
export interface WeaponCore {
  weaponId: string
  game: 'GI' | 'HSR' | 'ZZZ'
  rarity: number
  releaseVersion: string
  sourceType: 'gacha' | 'craft' | 'event' | 'battlepass' | 'shop'
  isSignature: boolean
}

// ============================================================================
// Raw Numerical Dataset (KHÔNG TEXT - ML-ready)
// ============================================================================

/**
 * WeaponStatsRaw - Raw numerical stats for ML models
 * Model học trực tiếp từ số, không parse text
 */
export interface WeaponStatsRaw {
  weaponId: string
  level: number
  atk?: number
  hp?: number
  def?: number
  critRate?: number
  critDmg?: number
  // Game-specific stats mapped to canonical set
  [key: string]: string | number | undefined
}

/**
 * Canonical Stat Set - Map tất cả game-specific stats về canonical set
 * Tránh sparse explosion trong ML models
 */
export const CANONICAL_STATS = [
  'atk',
  'hp',
  'def',
  'critRate',
  'critDmg',
  'dmgBonus',
  'energy'
] as const

export type CanonicalWeaponStat = typeof CANONICAL_STATS[number]

// ============================================================================
// Machine-readable Passive Effects
// ============================================================================

/**
 * ConditionRule - Machine-readable condition for passive effects
 */
export interface WeaponStatModifier {
  stat: string // Canonical stat name
  value: number
  type?: 'flat' | 'percent' | 'multiplier'
}

/**
 * WeaponEffectRule - Machine-readable passive effect rule
 * Không phải text parsing - dùng cho ML và calculation
 */
export interface WeaponEffectRule {
  effectId: string
  weaponId: string
  trigger: 'always' | 'onHit' | 'conditional' | 'onSkill' | 'onBurst' | 'onSwitch'
  conditions?: ConditionRule[]
  outputs: WeaponStatModifier[]
  // Ví dụ: outputs: [{ stat: 'atkPct', value: 0.24 }]
}

// ============================================================================
// Derived Features Layer (ML-ready)
// ============================================================================

/**
 * WeaponFeatures - Precomputed features for ML
 * Không để model tự suy ra từ đầu
 */
export interface WeaponFeatures {
  weaponId: string
  baseStatEfficiency: number // Base stat efficiency score
  scalingSlope: number // Scaling curve slope
  passiveComplexityScore: number // Passive complexity (conditionCount * 0.3 + stackCount * 0.5 + triggerFrequency * 0.2)
  avgDpsGain: number // Average DPS gain across characters
  avgSupportValue: number // Average support value
  easeOfUseScore: number // Ease of use score (0-1)
}

/**
 * WeaponStatVector - Role-normalized stat vector for cosine similarity, clustering
 */
export interface WeaponStatVector {
  weaponId: string
  role: 'DPS' | 'Support' | 'SubDPS' | 'Breaker'
  vector: [number, number, number, number] // [atk, crit, dmgBonus, utility]
}

/**
 * FitScoreLabel - Multi-label training target for recommender/ranker
 */
export interface FitScoreLabel {
  weaponId: string
  characterId: string
  patch: string
  dpsScore: number
  supportScore: number
  easeScore: number
  consistencyScore: number
  metaContext?: {
    patch: string
    enemyType: 'single' | 'aoe'
    content: 'MoC' | 'SU' | 'Abyss' | 'Domain'
  }
}

// ============================================================================
// Data Versioning & Lineage
// ============================================================================

/**
 * DatasetVersion - Version information for reproducibility
 */


// ============================================================================
// Base Weapon Schema (Core)
// ============================================================================

/**
 * BaseWeapon - Core weapon interface
 */
export interface BaseWeapon {
  id: string
  game: 'GI' | 'HSR' | 'ZZZ'
  name: string
  rarity: 3 | 4 | 5
  meta?: {
    isSignature: boolean
    releaseVersion: string
    powerTier: 'S' | 'A' | 'B' | 'C'
    validFrom: string // Patch version
    validUntil?: string // Patch version (cho buff/nerf history)
  }
}

// ============================================================================
// Data Separation Pattern
// ============================================================================

/**
 * WeaponDisplayData - Display data (localization-ready)
 */
export interface WeaponDisplayData {
  name: string
  icon: string
  description: string
  source: string
  tags: string[]
}

/**
 * WeaponCalcData - Calculation data (calculation-ready)
 */
export interface WeaponCalcData {
  scaling: ScalingTable
  passiveEffects: PassiveEffect[]
}

// ============================================================================
// Curve-based Scaling
// ============================================================================

/**
 * ScalingTable - Curve-based scaling system
 * Tái sử dụng curve giữa weapons
 */
export interface ScalingTable {
  base: number
  curve: 'ATK_301' | 'HP_201' | 'DEF_401' | string // Curve identifier
  ascensionBonus?: {
    stat: 'atkPct' | 'critRate' | 'critDmg' | 'hpPct' | 'defPct' | string
    values: number[]
  }
}

// ============================================================================
// Data-driven Passive Effects
// ============================================================================

/**
 * PassiveEffect - Data-driven passive effect
 * Text chỉ là derived output, không phải source of truth
 */
export interface PassiveEffect {
  id: string
  type: 'stat_bonus' | 'conditional_bonus' | 'trigger' | 'stack' | 'reaction' | 'team_buff'
  params: Record<string, number | string>
  scalingBy?: 'refinement' | 'superimposition' | 'rank' | 'level'
  conditions?: Condition[]
  // Derived text (computed from data)
  text?: string
}

/**
 * Condition - Condition for passive effect
 */
export interface Condition {
  type: string
  value: string | number
  operator?: string
}

// ============================================================================
// Game-specific Extensions
// ============================================================================

/**
 * GenshinWeapon - Genshin Impact weapon extension
 */
export interface GenshinWeapon extends BaseWeapon {
  game: 'GI'
  weaponType: 'Sword' | 'Claymore' | 'Polearm' | 'Bow' | 'Catalyst'
  baseATK: number
  subStat?: {
    type: string
    value: number
  }
  refinementEffects: PassiveEffect[]
}

/**
 * HSRLightCone - Honkai: Star Rail Light Cone extension
 */
export interface HSRLightCone extends BaseWeapon {
  game: 'HSR'
  path: string // e.g., 'The Hunt', 'The Erudition'
  baseHP: number
  baseATK: number
  baseDEF: number
  superimpositionEffects: PassiveEffect[]
}

/**
 * ZZZWEngine - Zenless Zone Zero W-Engine extension
 */
export interface ZZZWEngine extends BaseWeapon {
  game: 'ZZZ'
  role: string
  baseATK: number
  advancedStat?: {
    type: string
    value: number
  }
  corePassive: PassiveEffect
}

// ============================================================================
// Explainable Fit Score System
// ============================================================================

/**
 * FitScore - Explainable fit score với breakdown
 */
export interface FitScore {
  total: number
  breakdown: {
    statScaling: number
    passiveSynergy: number
    roleMatch: number
    easeOfUse: number
    metaWeight: number
  }
  // Feature contributions for XAI
  featureContribution?: {
    atkScaling?: number
    passiveSynergy?: number
    roleMatch?: number
    [key: string]: number | undefined
  }
}

/**
 * RoleProfile - Role-based evaluation abstraction
 */
export interface RoleProfile {
  role: 'DPS' | 'SubDPS' | 'Support' | 'Breaker'
  statPriority: Record<string, number>
  preferredConditions?: Condition[]
}

// ============================================================================
// Scenario-based Comparison
// ============================================================================

/**
 * Modifier - Modifier for comparison scenario
 */
export interface Modifier {
  type: 'stat' | 'buff' | 'debuff' | 'reaction'
  stat?: string
  value: number
  source?: string
}

/**
 * ComparisonScenario - Scenario for weapon comparison
 */
export interface ComparisonScenario {
  name: string
  assumptions: string[]
  modifiers: Modifier[]
  baseline?: 'F2P' | '4★_standard' | 'signature_default'
}

// ============================================================================
// Union Types
// ============================================================================

export type Weapon = GenshinWeapon | HSRLightCone | ZZZWEngine

