/**
 * Fit Score Configuration and Normalized Score Types
 */

/**
 * Philosophy preset for fit score calculation
 */
export type PhilosophyPreset = 'meta' | 'comfort' | 'balanced' | 'custom'

/**
 * Fit Score Configuration
 * Defines weights for different aspects of artifact evaluation
 */
export interface FitScoreConfig {
  weights: {
    mainStatFit: number      // Weight for main stat match (0-1)
    subStatQuality: number    // Weight for substat quality (0-1)
    rollEfficiency: number   // Weight for roll efficiency (0-1)
    consistency: number       // Weight for consistency/low variance (0-1)
    setBonusValue: number     // Weight for set bonus value (0-1)
    metaWeight: number        // Weight for meta relevance (0-1)
  }
  philosophy: PhilosophyPreset
}

/**
 * Default weights for different philosophies
 */
export const DEFAULT_WEIGHTS: Record<PhilosophyPreset, FitScoreConfig['weights']> = {
  meta: {
    mainStatFit: 0.25,
    subStatQuality: 0.30,
    rollEfficiency: 0.20,
    consistency: 0.10,
    setBonusValue: 0.10,
    metaWeight: 0.05
  },
  comfort: {
    mainStatFit: 0.30,
    subStatQuality: 0.25,
    rollEfficiency: 0.15,
    consistency: 0.20,
    setBonusValue: 0.05,
    metaWeight: 0.05
  },
  balanced: {
    mainStatFit: 0.25,
    subStatQuality: 0.25,
    rollEfficiency: 0.20,
    consistency: 0.15,
    setBonusValue: 0.10,
    metaWeight: 0.05
  },
  custom: {
    mainStatFit: 0.25,
    subStatQuality: 0.30,
    rollEfficiency: 0.20,
    consistency: 0.10,
    setBonusValue: 0.10,
    metaWeight: 0.05
  }
}

/**
 * Confidence level for fit score calculation
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'insufficient'

/**
 * Normalized Fit Score
 * Provides raw score, normalized score, percentile, and confidence
 */
export interface NormalizedFitScore {
  rawScore: number              // Raw calculated score (0-100)
  normalizedScore: number        // Normalized score relative to character+slot baseline (0-100)
  percentile: number             // Percentile rank among all artifacts for this character+slot (0-100)
  confidence: ConfidenceLevel    // Confidence level in the calculation
  metaAdjusted?: number          // Optional: meta-adjusted score (explain-only)
  breakdown?: {
    mainStatFit: number
    subStatQuality: number
    rollEfficiency: number
    consistency: number
    setBonusValue: number
    metaWeight: number
  }
}

/**
 * User Preferences for Fit Score
 * Stored per character
 */
export interface UserFitScorePreferences {
  characterId: string
  config: FitScoreConfig
  updatedAt: string
}

