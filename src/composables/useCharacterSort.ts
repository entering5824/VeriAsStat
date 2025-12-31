import { computed, type Ref } from 'vue'
import type { Character } from '../types/character'

export type SortOption = 
  | 'name-asc' 
  | 'name-desc' 
  | 'tier-desc' 
  | 'tier-asc' 
  | 'rarity-desc' 
  | 'rarity-asc' 
  | 'newest'

/**
 * Composable for sorting characters
 * 
 * @param characters - Reactive array of characters
 * @param sortBy - Reactive sort option
 * @returns Sorted characters array
 */
export function useCharacterSort(
  characters: Ref<Character[]>,
  sortBy: Ref<SortOption>
) {
  const sortedCharacters = computed(() => {
    const chars = [...characters.value]
    
    switch (sortBy.value) {
      case 'name-asc':
        return chars.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase()
          const nameB = (b.name || '').toLowerCase()
          return nameA.localeCompare(nameB)
        })
      
      case 'name-desc':
        return chars.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase()
          const nameB = (b.name || '').toLowerCase()
          return nameB.localeCompare(nameA)
        })
      
      case 'tier-desc':
        return chars.sort((a, b) => {
          const tierA = a.tier ?? 0
          const tierB = b.tier ?? 0
          return tierB - tierA
        })
      
      case 'tier-asc':
        return chars.sort((a, b) => {
          const tierA = a.tier ?? 0
          const tierB = b.tier ?? 0
          return tierA - tierB
        })
      
      case 'rarity-desc':
        return chars.sort((a, b) => {
          const rarityA = a.rarity ?? 0
          const rarityB = b.rarity ?? 0
          return rarityB - rarityA
        })
      
      case 'rarity-asc':
        return chars.sort((a, b) => {
          const rarityA = a.rarity ?? 0
          const rarityB = b.rarity ?? 0
          return rarityA - rarityB
        })
      
      case 'newest':
        // Sort by updatedAt or createdAt if available, otherwise keep original order
        return chars.sort((a, b) => {
          const dateA = (a as any).updatedAt || (a as any).createdAt || ''
          const dateB = (b as any).updatedAt || (b as any).createdAt || ''
          if (!dateA && !dateB) return 0
          if (!dateA) return 1
          if (!dateB) return -1
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })
      
      default:
        return chars
    }
  })

  return {
    sortedCharacters
  }
}

