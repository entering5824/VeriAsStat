import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

interface ScrollState {
  scrollY: number
  filters?: Record<string, any>
  sortBy?: string
  searchQuery?: string
}

/**
 * Composable for saving and restoring scroll position
 * Saves scroll position and filter/sort state to history.state
 * Restores when navigating back
 */
export function useScrollRestore() {
  const router = useRouter()

  /**
   * Save current scroll position and optional state to history
   * 
   * @param additionalState - Additional state to save (filters, sort, etc.)
   */
  const saveScrollState = (additionalState?: Omit<ScrollState, 'scrollY'>) => {
    const state: ScrollState = {
      scrollY: window.scrollY,
      ...additionalState
    }
    
    // Save to history state
    if (history.state) {
      history.replaceState(
        { ...history.state, scrollState: state },
        '',
        window.location.href
      )
    } else {
      history.replaceState({ scrollState: state }, '', window.location.href)
    }
  }

  /**
   * Restore scroll position from history state
   * 
   * @param defaultScrollY - Default scroll position if no saved state (default: 0)
   */
  const restoreScrollState = (defaultScrollY = 0) => {
    const state = history.state?.scrollState as ScrollState | undefined
    
    if (state?.scrollY !== undefined) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo(0, state.scrollY)
      })
      return state
    }
    
    // If no saved state, scroll to default
    if (defaultScrollY > 0) {
      requestAnimationFrame(() => {
        window.scrollTo(0, defaultScrollY)
      })
    }
    
    return null
  }

  /**
   * Get saved state from history (without restoring scroll)
   * 
   * @returns Saved scroll state or null
   */
  const getSavedState = (): ScrollState | null => {
    return (history.state?.scrollState as ScrollState) || null
  }

  /**
   * Clear saved scroll state
   */
  const clearScrollState = () => {
    if (history.state?.scrollState) {
      const { scrollState, ...rest } = history.state
      history.replaceState(rest, '', window.location.href)
    }
  }

  return {
    saveScrollState,
    restoreScrollState,
    getSavedState,
    clearScrollState
  }
}

