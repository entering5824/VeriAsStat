import { ref, watch } from 'vue'
import type { Character } from '../../types/character'
import { characterService } from '../../services/character'

export function useCharacters() {
  const characters = ref<Character[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedGame = ref<string>('GI')
  
  // Flag to prevent duplicate calls and track if initial load is needed
  const isLoadingRef = ref(false)
  const isInitialized = ref(false)
  let loadTimeout: ReturnType<typeof setTimeout> | null = null

  /**
   * Load characters for the selected game
   * Protected against duplicate calls and rapid successive calls
   */
  const loadCharacters = async () => {
    // Prevent duplicate calls
    if (isLoadingRef.value) {
      console.warn('[useCharacters] Load already in progress, skipping duplicate call')
      return
    }

    if (!selectedGame.value) {
      error.value = 'No game selected'
      return
    }

    isLoadingRef.value = true
    loading.value = true
    error.value = null

    try {
      const data = await characterService.getCharacters(selectedGame.value)
      characters.value = data
      
      if (data.length === 0) {
        error.value = 'No characters found'
      } else {
        // Clear error if we successfully loaded data
        error.value = null
      }
      
      isInitialized.value = true
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to load characters'
      error.value = errorMessage
      characters.value = []
      console.error('[useCharacters] Error loading characters:', errorMessage, err)
      
      // Don't mark as initialized if there was an error
      // This allows retry on next watch trigger
    } finally {
      loading.value = false
      isLoadingRef.value = false
    }
  }

  /**
   * Change selected game (watch will automatically trigger loadCharacters)
   */
  const changeGame = (game: string) => {
    if (!game || game === selectedGame.value) {
      return
    }
    
    // Normalize game value
    const normalizedGame = game.toUpperCase()
    if (!['GI', 'HSR', 'ZZZ'].includes(normalizedGame)) {
      console.warn(`[useCharacters] Invalid game: ${game}, ignoring`)
      return
    }
    
    selectedGame.value = normalizedGame
    // Don't call loadCharacters here - watch will handle it
  }

  /**
   * Debounced load function to prevent rapid successive calls
   */
  const debouncedLoad = () => {
    // Clear any pending load
    if (loadTimeout) {
      clearTimeout(loadTimeout)
    }
    
    // Debounce by 100ms to batch rapid changes
    loadTimeout = setTimeout(() => {
      loadCharacters().catch(err => {
        console.error('[useCharacters] Unhandled error in debouncedLoad:', err)
      })
    }, 100)
  }

  // Auto-load when game changes (with debouncing)
  // Only watch after initial setup to avoid immediate trigger on initialization
  watch(selectedGame, (newGame, oldGame) => {
    // Skip if game hasn't actually changed
    if (newGame === oldGame) {
      return
    }
    
    // Skip if game is empty or invalid
    if (!newGame || !['GI', 'HSR', 'ZZZ'].includes(newGame)) {
      return
    }
    
    debouncedLoad()
  }, { immediate: false }) // Changed to false - we'll handle initial load manually

  // Manual initial load function
  // This should be called once on component mount to load initial data
  // It will only load if not already initialized and not currently loading
  const initialize = async () => {
    // Skip if already initialized or currently loading
    if (isInitialized.value || isLoadingRef.value) {
      return
    }
    
    // Ensure we have a valid game
    if (!selectedGame.value || !['GI', 'HSR', 'ZZZ'].includes(selectedGame.value)) {
      selectedGame.value = 'GI'
    }
    
    // Load characters for the current game
    // This will set isInitialized to true on success
    await loadCharacters()
  }

  return {
    characters,
    loading,
    error,
    selectedGame,
    loadCharacters,
    changeGame,
    initialize
  }
}

