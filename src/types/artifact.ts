/**
 * Type definitions for Artifact Intelligence Platform
 * Supports Genshin Impact (Artifacts), Honkai: Star Rail (Relics & Planar Ornaments), Zenless Zone Zero (Disks)
 * 
 * Architecture: 4-tier design (System, Data, ML, Product)
 * - Core game-agnostic layer
 * - Game-specific adapters
 * - Data pipeline layer
 * - ML & Intelligence layer
 * - Product/UX layer
 */

import type { ConditionRule, GameType } from './common'
export type { GameType }

// ============================================================================
// Canonical Stat Set
// ============================================================================

/**
 * Canonical Stat Set - Map tất cả game-specific stats về canonical set
 * Tránh sparse explosion trong ML models
 */
export const CANONICAL_ARTIFACT_STATS = [
  'atk',
  'atkPct',
  'hp',
  'hpPct',
  'def',
  'defPct',
  'critRate',
  'critDmg',
  'energy',
  'break',
  'effectHit',
  'dmgBonus'
] as const

export type CanonicalStat = typeof CANONICAL_ARTIFACT_STATS[number]

// ============================================================================
// Core Dataset (Game-agnostic)
// ============================================================================

/**
 * ArtifactCore - Game-agnostic core data
 */
export interface ArtifactCore {
  artifactId: string
  game: 'GI' | 'HSR' | 'ZZZ'
  slot: string
  rarity: number
  setId: string
  releaseVersion: string
  domainType: 'domain' | 'su' | 'hollow'
  _rev?: string                  // Revision identifier for optimistic concurrency
}

// ============================================================================
// Raw Numerical Dataset (KHÔNG TEXT - ML-ready)
// ============================================================================

/**
 * ArtifactStatsRaw - Raw numerical stats for ML models
 * Model học trực tiếp từ số, không parse text
 */
export interface ArtifactStatsRaw {
  artifactInstanceId: string
  artifactId: string
  level: number
  mainStat: {
    key: CanonicalStat
    value: number
  }
  subStats: {
    key: CanonicalStat
    value: number
    rollCount: number
  }[]
  _rev?: string                  // Revision identifier for optimistic concurrency
}

// ============================================================================
// Stat Context & Evaluation System
// ============================================================================

/**
 * Curve - Diminishing returns curve
 */
export interface Curve {
  type: 'linear' | 'log' | 'power' | 'custom'
  params?: number[]
  evaluate(x: number): number
}

/**
 * StatContext - Context for stat evaluation
 * Tất cả stat evaluation phải qua layer này
 */
export interface StatContext {
  characterId?: string
  baseStats: Partial<Record<CanonicalStat, number>>
  caps?: Partial<Record<CanonicalStat, number>>
  diminishingCurves?: Partial<Record<CanonicalStat, Curve>>
  metaContext?: MetaContext
}

/**
 * MetaContext - Patch-aware meta với confidence
 */
export interface MetaContext {
  patch: string
  content?: 'Abyss' | 'MoC' | 'HollowZero'
  enemyType?: 'single' | 'aoe'
  confidence?: number // 0-1, how confident in this meta assessment
  source?: 'sim' | 'leaderboard' | 'community' | 'expert'
  validFrom?: string
  validUntil?: string
}

// ============================================================================
// Data-Driven Rule System
// ============================================================================

/**
 * RollRule - Data-driven roll distribution rule
 */
export interface RollRule {
  stat: CanonicalStat
  rarity: number
  rollValues: number[]
  probability?: number[] // Optional probability distribution
}



/**
 * StatModifier - Output modifier from set bonus
 */
export interface StatModifier {
  stat: CanonicalStat
  value: number
  type?: 'flat' | 'percent' | 'multiplier'
}

/**
 * SetBonusRule - Data-driven set bonus rule
 * Text là derived, không phải source of truth
 */
export interface SetBonusRule {
  setId: string
  pieces: number
  trigger: 'always' | 'conditional'
  conditions?: ConditionRule[]
  outputs: StatModifier[]
  // Derived text (computed from data)
  text?: string
}

// ============================================================================
// Artifact Set Schema (from parse_artifacts_multi.py)
// ============================================================================

/**
 * ArtifactSetBonus2pc - 2-piece bonus
 */
export interface ArtifactSetBonus2pc {
  stat: string
  value: number | number[]
  type: 'percent' | 'flat'
  trigger?: string | string[]
  condition?: string | string[]
  duration?: number
  unit?: string
  stacking?: string
  reset_on_repeat?: boolean
  no_stack_passive?: boolean
}

/**
 * ArtifactSetEffect - Effect within 4pc bonus
 */
export interface ArtifactSetEffect {
  stat: string
  value: number | number[]
  type: 'percent' | 'flat'
  duration?: number
  unit?: string
  condition?: string | string[]
  stacking?: string
  reset_on_repeat?: boolean
  no_stack_passive?: boolean
}

/**
 * ArtifactSetBonus4pc - 4-piece bonus entry
 */
export interface ArtifactSetBonus4pc {
  trigger: string | string[]
  effect: ArtifactSetEffect[]
  condition?: string
  stacking?: string
}

/**
 * ArtifactSet - Complete artifact set definition
 * Matches schema from artifact_schema_updated.json
 */
export interface ArtifactSet {
  name: string
  game?: 'GI' | 'HSR' | 'ZZZ'
  '2pc_bonus': ArtifactSetBonus2pc
  '4pc_bonus'?: ArtifactSetBonus4pc[]
  raw_2pc: string
  raw_4pc?: string
  no_stack_passive?: boolean
}

// ============================================================================
// Derived Features (ML-ready)
// ============================================================================

/**
 * RollEfficiencyBreakdown - Roll efficiency metrics
 */
export interface RollEfficiencyBreakdown {
  normalizedSum: number      // Sum of normalized roll values
  entropyScore: number        // Distribution entropy (0-1)
  concentrationScore: number  // Target stat concentration
  rollEfficiency: number      // Overall efficiency (0-1)
}

/**
 * RollVarianceBreakdown - Variance decomposition
 * Tách variance thành components, không merge sớm
 */
export interface RollVarianceBreakdown {
  effortScore: number      // How much farming effort needed
  diversityScore: number   // Stat diversity (good vs bad)
  volatilityScore: number  // RNG volatility
}

/**
 * ArtifactFeatures - Precomputed features for ML
 */
export interface ArtifactFeatures {
  artifactInstanceId: string
  rollBreakdown: RollEfficiencyBreakdown
  varianceBreakdown: RollVarianceBreakdown
  statAlignmentScore: number
  setSynergyScore: number
  avgDpsGain: number
  easeOfFarmScore: number
}

// ============================================================================
// Negative Evidence (Anti-Fit)
// ============================================================================

/**
 * ArtifactAntiFit - Negative evidence system
 * Dùng cho ranking, contrastive learning, và UX explanation
 */
export interface ArtifactAntiFit {
  artifactInstanceId: string
  characterId?: string
  reason: 'wastedStat' | 'antiSynergy' | 'overcap' | 'lowConsistency' | 'riskyRNG'
  penaltyScore: number
  explanation?: string
}

// ============================================================================
// Explainable Fit Score System
// ============================================================================

/**
 * ArtifactFitScore - Explainable fit score với breakdown
 * Traceable to ArtifactFeatures & StatContext
 */
export interface ArtifactFitScore {
  total: number
  breakdown: {
    mainStatFit: number        // How well main stat matches character
    subStatQuality: number     // Quality of substat rolls
    rollEfficiency: number     // Roll efficiency score
    consistency: number        // Consistency (low variance)
    setBonusValue: number      // Value of set bonus
    metaWeight: number         // Meta relevance
  }
  antiFitPenalties?: {
    wastedStat?: number
    antiSynergy?: number
    overcap?: number
    lowConsistency?: number
    riskyRNG?: number
    [key: string]: number | undefined
  }
  featureContribution?: Record<string, number> // For XAI
}

// ============================================================================
// ML Training Labels
// ============================================================================

/**
 * FitLabel - Training label với confidence weighting
 */
export interface FitLabel {
  artifactInstanceId: string
  characterId?: string
  patch: string
  simulated: number        // Simulated fit score
  observed?: number        // Observed performance (if available)
  confidence: number       // Training weight (0-1)
  metaContext: MetaContext
}

// ============================================================================
// Artifact Lifecycle Management
// ============================================================================

/**
 * ArtifactLifecycle - Lifecycle management
 */
export interface ArtifactLifecycle {
  artifactInstanceId: string
  isLocked: boolean
  upgradeLevel: number
  upgradeCostRemaining: number
  expectedValueAfterUpgrade?: number
  discardProbability?: number
  farmingPriority?: number
}

// ============================================================================
// Base Artifact Interface
// ============================================================================

/**
 * BaseArtifact - Core artifact interface
 */
export interface BaseArtifact {
  id: string
  artifactInstanceId?: string
  game: 'GI' | 'HSR' | 'ZZZ'
  slot: string
  rarity: number
  setId: string
  level?: number
  mainStat?: {
    key: CanonicalStat
    value: number
  }
  subStats?: {
    key: CanonicalStat
    value: number
    rollCount?: number
  }[]
  meta?: {
    releaseVersion: string
    domainType: 'domain' | 'su' | 'hollow'
  }
}

// ============================================================================
// Game-Specific Extensions
// ============================================================================

/**
 * GIArtifact - Genshin Impact artifact
 * 5 slots: Flower, Plume, Sands, Goblet, Circlet
 */
export interface GIArtifact extends BaseArtifact {
  game: 'GI'
  slot: 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet'
}

/**
 * HSRRelic - Honkai: Star Rail Relic
 * 4 slots: Head, Hands, Body, Feet
 */
export interface HSRRelic extends BaseArtifact {
  game: 'HSR'
  slot: 'head' | 'hands' | 'body' | 'feet'
  type: 'relic'
}

/**
 * HSRPlanarOrnament - Honkai: Star Rail Planar Ornament
 * 2 slots: Planar Sphere, Link Rope
 */
export interface HSRPlanarOrnament extends BaseArtifact {
  game: 'HSR'
  slot: 'planarSphere' | 'linkRope'
  type: 'planar'
}

/**
 * ZZZDisk - Zenless Zone Zero Disk
 * Unique slot system
 */
export interface ZZZDisk extends BaseArtifact {
  game: 'ZZZ'
  slot: string
  diskType?: string
}

// ============================================================================
// Data Versioning & Lineage
// ============================================================================

/**
 * DatasetVersion - Version information for reproducibility
 */


// ============================================================================
// Union Types
// ============================================================================

export type Artifact = GIArtifact | HSRRelic | HSRPlanarOrnament | ZZZDisk

