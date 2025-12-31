import { computed, type Ref } from 'vue'
import type { Character } from '../../types/character'

export interface StatRow {
  label: string
  value: string | number
}

export function useCharacterStats(character: Ref<Character | null>) {
  const hasStats = computed(() => {
    if (!character.value) return false
    const char = character.value as any
    return !!(char.base_stats || char.graduation_stats || char.sub_stats)
  })

  const statRows = computed<StatRow[]>(() => {
    if (!character.value) return []
    const char = character.value as any
    const rows: StatRow[] = []
    
    // Add base stats if available
    if (char.base_stats) {
      Object.entries(char.base_stats).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          rows.push({
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: String(value)
          })
        }
      })
    }
    
    return rows
  })

  return {
    hasStats,
    statRows
  }
}

