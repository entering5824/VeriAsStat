import { ref, computed, watch } from 'vue'
import type { Character } from '../../types/character'
import { characterService } from '../../services/character'

export function useCharacters() {
  const characters = ref<Character[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const selectedGame = ref<string>('GI')

  /**
   * Load characters for the selected game
   */
  const loadCharacters = async () => {
    if (!selectedGame.value) {
      error.value = 'No game selected'
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await characterService.getCharacters(selectedGame.value)
      characters.value = data
      
      if (data.length === 0) {
        error.value = 'No characters found'
      }
    } catch (err: any) {
      error.value = err?.message || 'Failed to load characters'
      characters.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Change selected game and reload characters
   */
  const changeGame = async (game: string) => {
    if (game === selectedGame.value) return
    
    selectedGame.value = game
    await loadCharacters()
  }

  // Auto-load when game changes
  watch(selectedGame, () => {
    loadCharacters()
  }, { immediate: true })

  return {
    characters,
    loading,
    error,
    selectedGame,
    loadCharacters,
    changeGame
  }
}

