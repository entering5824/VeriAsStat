import type { ArtifactFitScore } from '../types/artifact'

/**
 * Combine fit score breakdown and anti-fit penalties into a unified breakdown
 */
export function combineBreakdown(
  breakdown: ArtifactFitScore['breakdown'],
  antiFitPenalties?: ArtifactFitScore['antiFitPenalties']
) {
  const items: Array<{
    label: string
    value: number
    description?: string
  }> = []

  // Add positive breakdown items
  Object.entries(breakdown).forEach(([key, value]) => {
    items.push({
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: value as number
    })
  })

  // Add negative penalties
  if (antiFitPenalties) {
    Object.entries(antiFitPenalties).forEach(([key, value]) => {
      if (value !== undefined && value > 0) {
        items.push({
          label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          value: -value,
          description: 'Penalty'
        })
      }
    })
  }

  return { items }
}