import { ref, computed, type Ref } from 'vue'
import type { BaseWeapon } from '../types/weapon'

export interface WeaponFilters {
  game: string
  rarity?: number | null
  type?: string
  tags?: string[]
}

export type SortOption = 'name-asc' | 'name-desc' | 'rarity-desc' | 'rarity-asc'

export function useWeaponFilter(weapons: Ref<BaseWeapon[]>) {
  const searchQuery = ref('')
  const filters = ref<WeaponFilters>({
    game: 'GI',
    rarity: null,
    tags: []
  })
  const sortOption = ref<SortOption>('name-asc')

  const filteredWeapons = computed(() => {
    let result = [...weapons.value]

    // Filter by game
    if (filters.value.game) {
      result = result.filter(w => (w.game || '').toUpperCase() === filters.value.game.toUpperCase())
    }

    // Filter by rarity
    if (filters.value.rarity) {
      result = result.filter(w => w.rarity === filters.value.rarity)
    }

    // Filter by type
    if (filters.value.type) {
      result = result.filter(w => {
        const weaponType = (w as any).weaponType || (w as any).type || ''
        return weaponType.toLowerCase() === filters.value.type?.toLowerCase()
      })
    }

    // Filter by tags
    if (filters.value.tags && filters.value.tags.length > 0) {
      // Note: This assumes weapons have a tags field. Adjust based on actual data structure.
      result = result.filter(w => {
        const weaponTags = (w as any).tags || []
        return filters.value.tags?.some(tag => weaponTags.includes(tag))
      })
    }

    // Search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(w => {
        const name = (w.name || '').toLowerCase()
        return name.includes(query)
      })
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption.value) {
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        case 'rarity-desc':
          return (b.rarity || 0) - (a.rarity || 0)
        case 'rarity-asc':
          return (a.rarity || 0) - (b.rarity || 0)
        default:
          return 0
      }
    })

    return result
  })

  const resetFilters = () => {
    searchQuery.value = ''
    filters.value = {
      game: 'GI',
      rarity: null,
      tags: []
    }
    sortOption.value = 'name-asc'
  }

  return {
    searchQuery,
    filters,
    sortOption,
    filteredWeapons,
    resetFilters
  }
}

