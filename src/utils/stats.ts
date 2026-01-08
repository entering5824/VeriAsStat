import type { CanonicalStat, StatContext } from '../types/artifact'

/**
 * Evaluate a stat value considering context (caps, diminishing returns, etc.)
 */
export function evaluateStat(rawValue: number, key: CanonicalStat, context: StatContext): number {
  let value = rawValue

  // Apply caps
  if (context.caps && context.caps[key]) {
    value = Math.min(value, context.caps[key]!)
  }

  // Apply diminishing curves
  if (context.diminishingCurves && context.diminishingCurves[key]) {
    value = context.diminishingCurves[key]!.evaluate(value)
  }

  return value
}