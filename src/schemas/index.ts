/**
 * Schema definitions using TypeBox
 * Provides both TypeScript types and Ajv validators
 */

import { Type, type Static } from '@sinclair/typebox'
import Ajv, { type ValidateFunction, type ErrorObject } from 'ajv'
import addFormats from 'ajv-formats'

// Initialize Ajv with formats support
const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)

// UUID pattern
const UUID_PATTERN = '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'

// Common schemas
const GameEnum = Type.Union([
  Type.Literal('GI'),
  Type.Literal('HSR'),
  Type.Literal('ZZZ')
])

const PhilosophyEnum = Type.Union([
  Type.Literal('meta'),
  Type.Literal('comfort'),
  Type.Literal('balanced'),
  Type.Literal('custom')
])

const ConfidenceEnum = Type.Union([
  Type.Literal('high'),
  Type.Literal('medium'),
  Type.Literal('low'),
  Type.Literal('insufficient')
])

// FitScoreConfig Schema
export const FitScoreConfigSchema = Type.Object({
  weights: Type.Object({
    mainStatFit: Type.Number({ minimum: 0, maximum: 1 }),
    subStatQuality: Type.Number({ minimum: 0, maximum: 1 }),
    rollEfficiency: Type.Number({ minimum: 0, maximum: 1 }),
    consistency: Type.Number({ minimum: 0, maximum: 1 }),
    setBonusValue: Type.Number({ minimum: 0, maximum: 1 }),
    metaWeight: Type.Number({ minimum: 0, maximum: 1 })
  }, { additionalProperties: false }),
  philosophy: PhilosophyEnum
}, { additionalProperties: false })

export type FitScoreConfigType = Static<typeof FitScoreConfigSchema>

// NormalizedFitScore Schema
export const NormalizedFitScoreSchema = Type.Object({
  rawScore: Type.Number({ minimum: 0, maximum: 100 }),
  normalizedScore: Type.Number({ minimum: 0, maximum: 100 }),
  percentile: Type.Number({ minimum: 0, maximum: 100 }),
  confidence: ConfidenceEnum,
  metaAdjusted: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
  breakdown: Type.Optional(Type.Object({
    mainStatFit: Type.Number(),
    subStatQuality: Type.Number(),
    rollEfficiency: Type.Number(),
    consistency: Type.Number(),
    setBonusValue: Type.Number(),
    metaWeight: Type.Number()
  }, { additionalProperties: false }))
}, { additionalProperties: false })

export type NormalizedFitScoreType = Static<typeof NormalizedFitScoreSchema>

// BuildGuide Base Schema
const BuildGuideBaseSchema = Type.Object({
  game: GameEnum,
  characterId: Type.String({ minLength: 1 }),
  title: Type.String({ minLength: 1 }),
  version: Type.String({ default: 'unknown' }),
  lastUpdated: Type.String({ format: 'date-time' }),
  author: Type.Optional(Type.String()),
  _schemaVersion: Type.Optional(Type.String())
}, { additionalProperties: false })

// SetPiece Schema
const SetPieceSchema = Type.Object({
  name: Type.String({ minLength: 1 }),
  pieces: Type.Number({ minimum: 2, maximum: 6 })
}, { additionalProperties: false })

// RankedSetCombination Schema
const RankedSetCombinationSchema = Type.Object({
  rank: Type.Number({ minimum: 1 }),
  sets: Type.Array(SetPieceSchema),
  note: Type.Optional(Type.String())
}, { additionalProperties: true }) // Allow notes/metadata

// RankedItem Schema
const RankedItemSchema = Type.Object({
  rank: Type.Number({ minimum: 1 }),
  name: Type.String({ minLength: 1 }),
  note: Type.Optional(Type.String())
}, { additionalProperties: true })

// SubstatPriority Schema
const SubstatPrioritySchema = Type.Object({
  stat: Type.String({ minLength: 1 }),
  note: Type.Optional(Type.String())
}, { additionalProperties: true })

// GraduationStats Schema
const GraduationStatsSchema = Type.Object({
  core: Type.Array(Type.String(), { minItems: 1 }),
  secondary: Type.Optional(Type.Array(Type.String())),
  minimum: Type.Optional(Type.Record(Type.String(), Type.Union([Type.String(), Type.Number()]))),
  note: Type.Optional(Type.String())
}, { additionalProperties: true })

// BuildGuideGI Schema
export const BuildGuideGISchema = Type.Intersect([
  BuildGuideBaseSchema,
  Type.Object({
    game: Type.Literal('GI'),
    weapons: Type.Array(RankedItemSchema, { minItems: 1 }),
    artifactSets: Type.Array(RankedSetCombinationSchema, { minItems: 1 }),
    mainStats: Type.Object({
      sands: Type.Array(Type.String(), { minItems: 1 }),
      goblet: Type.Array(Type.String(), { minItems: 1 }),
      circlet: Type.Array(Type.String(), { minItems: 1 })
    }, { additionalProperties: false }),
    subStatsPriority: Type.Array(SubstatPrioritySchema, { minItems: 1 }),
    graduationStats: GraduationStatsSchema
  }, { additionalProperties: false })
])

export type BuildGuideGIType = Static<typeof BuildGuideGISchema>

// BuildGuideHSR Schema
export const BuildGuideHSRSchema = Type.Intersect([
  BuildGuideBaseSchema,
  Type.Object({
    game: Type.Literal('HSR'),
    relicSets: Type.Array(RankedSetCombinationSchema, { minItems: 1 }),
    planarSets: Type.Array(RankedSetCombinationSchema, { minItems: 1 }),
    lightCones: Type.Array(RankedItemSchema, { minItems: 1 }),
    mainStats: Type.Object({
      body: Type.Array(Type.String(), { minItems: 1 }),
      feet: Type.Array(Type.String(), { minItems: 1 }),
      sphere: Type.Array(Type.String(), { minItems: 1 }),
      rope: Type.Array(Type.String(), { minItems: 1 })
    }, { additionalProperties: false }),
    subStatsPriority: Type.Array(SubstatPrioritySchema, { minItems: 1 }),
    graduationStats: GraduationStatsSchema
  }, { additionalProperties: false })
])

export type BuildGuideHSRType = Static<typeof BuildGuideHSRSchema>

// BuildGuideZZZ Schema
export const BuildGuideZZZSchema = Type.Intersect([
  BuildGuideBaseSchema,
  Type.Object({
    game: Type.Literal('ZZZ'),
    driveSets: Type.Array(RankedSetCombinationSchema, { minItems: 1 }),
    wEngines: Type.Array(RankedItemSchema, { minItems: 1 }),
    mainStats: Type.Object({
      disk4: Type.Array(Type.String(), { minItems: 1 }),
      disk5: Type.Array(Type.String(), { minItems: 1 }),
      disk6: Type.Array(Type.String(), { minItems: 1 })
    }, { additionalProperties: false }),
    subStatsPriority: Type.Array(SubstatPrioritySchema, { minItems: 1 }),
    graduationStats: GraduationStatsSchema
  }, { additionalProperties: false })
])

export type BuildGuideZZZType = Static<typeof BuildGuideZZZSchema>

// BuildGuide Union Schema (discriminated union)
export const BuildGuideSchema = Type.Union([
  BuildGuideGISchema,
  BuildGuideHSRSchema,
  BuildGuideZZZSchema
])

export type BuildGuideType = Static<typeof BuildGuideSchema>

// Character Schema
export const CharacterSchema = Type.Object({
  _id: Type.Optional(Type.String({ pattern: UUID_PATTERN })),
  id: Type.Optional(Type.String({ pattern: UUID_PATTERN })),
  _rev: Type.Optional(Type.String({ pattern: UUID_PATTERN })),
  characterId: Type.Optional(Type.String()),
  name: Type.String({ minLength: 1 }),
  game: GameEnum,
  role: Type.Optional(Type.Array(Type.String())),
  tier: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
  element: Type.Optional(Type.String()),
  weapon_type: Type.Optional(Type.String()),
  weaponType: Type.Optional(Type.String()),
  rarity: Type.Optional(Type.Number({ minimum: 3, maximum: 5 })),
  skill_text: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  role_tags: Type.Optional(Type.Array(Type.String())),
  sub_stats: Type.Optional(Type.Union([
    Type.Object({
      GI: Type.Optional(Type.Record(Type.String(), Type.Number())),
      HSR: Type.Optional(Type.Record(Type.String(), Type.Number())),
      ZZZ: Type.Optional(Type.Record(Type.String(), Type.Number()))
    }, { additionalProperties: false }),
    Type.Null()
  ])),
  graduation_stats: Type.Optional(Type.Union([
    Type.Object({
      GI: Type.Optional(Type.Record(Type.String(), Type.Number())),
      HSR: Type.Optional(Type.Record(Type.String(), Type.Number())),
      ZZZ: Type.Optional(Type.Record(Type.String(), Type.Number()))
    }, { additionalProperties: false }),
    Type.Null()
  ])),
  teammate: Type.Optional(Type.Array(Type.String())),
  iconPath: Type.Optional(Type.String()),
  splashPath: Type.Optional(Type.String()),
  imageUrlIcon: Type.Optional(Type.String()),
  imageUrlSplash: Type.Optional(Type.String()),
  buildGuides: Type.Optional(Type.Array(BuildGuideSchema)),
  graduationStats: Type.Optional(Type.Record(Type.String(), Type.Any())), // Deprecated, allow any
  createdAt: Type.Optional(Type.String({ format: 'date-time' })),
  updatedAt: Type.Optional(Type.String({ format: 'date-time' })),
  _schemaVersion: Type.Optional(Type.String())
}, { additionalProperties: true }) // Allow deprecated fields and notes/metadata

export type CharacterType = Static<typeof CharacterSchema>

// Artifact Schema (simplified - focusing on core fields)
export const ArtifactSchema = Type.Object({
  _id: Type.Optional(Type.String({ pattern: UUID_PATTERN })),
  id: Type.Optional(Type.String({ pattern: UUID_PATTERN })),
  _rev: Type.Optional(Type.String({ pattern: UUID_PATTERN })),
  artifactInstanceId: Type.String({ minLength: 1 }),
  artifactId: Type.String({ minLength: 1 }),
  game: GameEnum,
  slot: Type.String({ minLength: 1 }),
  rarity: Type.Number({ minimum: 3, maximum: 5 }),
  setId: Type.String({ minLength: 1 }),
  level: Type.Number({ minimum: 0, maximum: 20 }),
  mainStat: Type.Object({
    key: Type.String({ minLength: 1 }),
    value: Type.Number()
  }, { additionalProperties: false }),
  subStats: Type.Array(Type.Object({
    key: Type.String({ minLength: 1 }),
    value: Type.Number(),
    rollCount: Type.Optional(Type.Number({ minimum: 0 }))
  }, { additionalProperties: false })),
  releaseVersion: Type.Optional(Type.String()),
  domainType: Type.Optional(Type.Union([
    Type.Literal('domain'),
    Type.Literal('su'),
    Type.Literal('hollow')
  ]))
}, { additionalProperties: true }) // Allow additional metadata

export type ArtifactType = Static<typeof ArtifactSchema>

// Compile Ajv validators
export const validators = {
  fitScoreConfig: ajv.compile(FitScoreConfigSchema),
  normalizedFitScore: ajv.compile(NormalizedFitScoreSchema),
  buildGuide: ajv.compile(BuildGuideSchema),
  buildGuideGI: ajv.compile(BuildGuideGISchema),
  buildGuideHSR: ajv.compile(BuildGuideHSRSchema),
  buildGuideZZZ: ajv.compile(BuildGuideZZZSchema),
  character: ajv.compile(CharacterSchema),
  artifact: ajv.compile(ArtifactSchema)
}

// Helper function to validate with detailed errors
export function validate<T>(
  validator: ValidateFunction,
  data: unknown
): { valid: boolean; data?: T; errors?: ErrorObject[] } {
  const valid = validator(data)
  if (valid) {
    return { valid: true, data: data as T }
  }
  return {
    valid: false,
    errors: validator.errors || []
  }
}

// Export JSON schemas for use in vite plugin
export const jsonSchemas = {
  fitScoreConfig: FitScoreConfigSchema,
  normalizedFitScore: NormalizedFitScoreSchema,
  buildGuide: BuildGuideSchema,
  character: CharacterSchema,
  artifact: ArtifactSchema
}

