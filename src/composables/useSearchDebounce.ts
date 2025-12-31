import { ref, watch, type Ref } from 'vue'

/**
 * Composable for debounced search with fuzzy matching
 * 
 * @param searchQuery - Reactive search query string
 * @param delay - Debounce delay in milliseconds (default: 300)
 * @returns Debounced search query and helper functions
 */
export function useSearchDebounce(searchQuery: Ref<string>, delay = 300) {
  const debouncedQuery = ref(searchQuery.value)

  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(searchQuery, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      debouncedQuery.value = newValue
    }, delay)
  }, { immediate: true })

  /**
   * Fuzzy search function - checks if search term matches text
   * 
   * @param text - Text to search in
   * @param searchTerm - Search term
   * @returns True if match found
   */
  const fuzzyMatch = (text: string, searchTerm: string): boolean => {
    if (!searchTerm) return true
    
    const normalizedText = text.toLowerCase().trim()
    const normalizedSearch = searchTerm.toLowerCase().trim()
    
    // Exact match
    if (normalizedText === normalizedSearch) return true
    
    // Contains match
    if (normalizedText.includes(normalizedSearch)) return true
    
    // Word boundary match (starts with word)
    const words = normalizedText.split(/\s+/)
    return words.some(word => word.startsWith(normalizedSearch))
  }

  /**
   * Search in array of items by specified keys
   * 
   * @param items - Array of items to search
   * @param searchKeys - Keys to search in (can be function or string)
   * @param query - Search query (uses debouncedQuery if not provided)
   * @returns Filtered array
   */
  const search = <T>(
    items: T[],
    searchKeys: ((item: T) => string) | string[],
    query?: string
  ): T[] => {
    const searchTerm = query ?? debouncedQuery.value
    
    if (!searchTerm.trim()) {
      return items
    }

    return items.filter(item => {
      if (typeof searchKeys === 'function') {
        const text = searchKeys(item)
        return fuzzyMatch(text, searchTerm)
      }
      
      // Array of keys
      return searchKeys.some(key => {
        const value = (item as any)[key]
        if (value === null || value === undefined) return false
        
        // Handle arrays (e.g., role array)
        if (Array.isArray(value)) {
          return value.some(v => fuzzyMatch(String(v), searchTerm))
        }
        
        return fuzzyMatch(String(value), searchTerm)
      })
    })
  }

  return {
    debouncedQuery,
    fuzzyMatch,
    search
  }
}

