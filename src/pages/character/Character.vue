<!-- 
  Component: Character Page
  
  Chức năng: Trang quản lý danh sách nhân vật
  - Hiển thị grid 8 cột
  - Filter theo game (GI/HSR/ZZZ)
  - Navigate đến create/edit page
-->
<template>
  <div class="character-page page-with-orbs">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Character list</h1>
          <p class="page-subtitle" v-if="!loading && !error">
            Hiển thị {{ filteredAndSortedCharacters.length }} nhân vật
          </p>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <PageNavigation :game="selectedGame" />

      <!-- Game Filter & Controls -->
      <CharacterFilterToolbar
      :games="GAMES"
      :selected-game="selectedGame"
      :sort-by="sortBy"
      :columns="gridColumns"
      :search-query="searchQuery"
      @update:selected-game="changeGame($event as any)"
      @update:sort-by="sortBy = $event as any"
      @update:columns="gridColumns = $event"
      @update:search-query="searchQuery = $event"
    />

      <!-- Error State -->
      <div v-if="error && !loading" class="error-state">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <button @click="() => loadCharacters()" class="retry-btn" aria-label="Retry loading characters">Thử lại</button>
      </div>

      <!-- Character Grid Component with Skeleton Loader -->
      <Character_Grid 
        v-if="!error"
        :characters="(paginatedCharacters as any) || []"
        :loading="loading"
        :columns="gridColumns"
        @refresh="loadCharacters"
        @viewBuildGuide="handleViewBuildGuide"
      />
      
      <!-- Pagination Controls -->
      <div v-if="!loading && !error && totalPages > 1" class="pagination-controls">
      <button 
        @click="prevPage" 
        :disabled="!hasPrevPage"
        class="pagination-btn"
        aria-label="Previous page"
      >
        ← Previous
      </button>
      <span class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }} ({{ filteredAndSortedCharacters.length }} total)
      </span>
      <button 
        @click="nextPage" 
        :disabled="!hasNextPage"
        class="pagination-btn"
        aria-label="Next page"
      >
        Next →
      </button>
      </div>

      <!-- Build Guide Modal -->
      <BuildGuideModal
        :model-value="showBuildGuideModal"
        :character="viewingCharacter"
        @update:model-value="showBuildGuideModal = $event"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, nextTick, watch, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCharacters, useCharacterSort, useSearchDebounce, useScrollRestore, useImagePreloader } from '../../composables'
import { API_GAMES as GAMES } from '../../config/games'
import { ENABLE_CRUD } from '../../utils/common'
import Character_Grid from '../../components/character/Character_Grid.vue'
import CharacterFilterToolbar from '../../components/character/CharacterFilterToolbar.vue'
import BuildGuideModal from '../../components/character/BuildGuideModal.vue'
import PageNavigation from '../../components/common/PageNavigation.vue'

export default defineComponent({
  name: 'CharacterPage',
  components: { 
    Character_Grid, 
    CharacterFilterToolbar,
    BuildGuideModal,
    PageNavigation
  },
  setup() {
    const route = useRoute()
    
    const {
      characters,
      loading,
      error,
      selectedGame,
      loadCharacters,
      changeGame,
      initialize,
    } = useCharacters()
    
    // Watch route query for game changes (debounced in composable)
    watch(() => route.query.game, (newGame) => {
      if (newGame && (newGame === 'GI' || newGame === 'HSR' || newGame === 'ZZZ')) {
        changeGame(newGame)
      }
    }, { immediate: false })

    // Image preloader
    const { preloadImagesFromSelector } = useImagePreloader()

    // Watch loading và characters để preload images
    watch([loading, characters], async ([isLoading, chars]) => {
      if (!isLoading && chars && chars.length > 0) {
        // Đợi DOM update
        await nextTick()
        // Preload tất cả ảnh trong character cards
        try {
          await preloadImagesFromSelector(
            '.character-item-card img, .character-item-wrap img',
            { timeout: 30000, continueOnError: true }
          )
        } catch (err) {
          console.warn('Error preloading character images:', err)
        }
      }
    }, { immediate: false })

    // Grid columns state
    const gridColumns = ref(6)
    
    // Sort state
    const sortBy = ref<'name-asc' | 'name-desc' | 'tier-desc' | 'tier-asc' | 'rarity-desc' | 'rarity-asc' | 'newest'>('name-asc')
    
    // Search state
    const searchQuery = ref('')
    const { debouncedQuery, search: searchCharacters } = useSearchDebounce(searchQuery, 300)
    
    // Advanced filters state
    const selectedElements = ref<string[]>([])
    const selectedRarities = ref<number[]>([])
    const selectedTier = ref<string>('')
    
    // Available elements from current characters
    const availableElements = computed(() => {
      const elements = new Set<string>()
      characters.value.forEach(char => {
        if (char.element) {
          elements.add(char.element)
        }
      })
      return Array.from(elements).sort()
    })
    
    // Apply filters: search, elements, rarities, tier
    const filteredCharacters = computed(() => {
      let filtered = characters.value
      
      // Search filter
      if (debouncedQuery.value.trim()) {
        filtered = searchCharacters(filtered, (char) => char.name || '')
      }
      
      // Element filter
      if (selectedElements.value.length > 0) {
        filtered = filtered.filter(char => 
          char.element && selectedElements.value.includes(char.element)
        )
      }
      
      // Rarity filter
      if (selectedRarities.value.length > 0) {
        filtered = filtered.filter(char => 
          char.rarity && selectedRarities.value.includes(char.rarity)
        )
      }
      
      // Tier filter
      if (selectedTier.value) {
        filtered = filtered.filter(char => {
          if (!char.tier) return false
          const tierNum = Math.round(char.tier)
          if (selectedTier.value === 'S') return tierNum >= 4.5
          if (selectedTier.value === 'A') return tierNum >= 3.5 && tierNum < 4.5
          if (selectedTier.value === 'B') return tierNum >= 2.5 && tierNum < 3.5
          if (selectedTier.value === 'C') return tierNum < 2.5
          return true
        })
      }
      
      return filtered
    })
    
    // Use optimized character sorting composable on filtered results
    const { sortedCharacters } = useCharacterSort(filteredCharacters, sortBy)
    
    // Final result: filtered and sorted
    const filteredAndSortedCharacters = sortedCharacters
    
    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = ref(50)
    
    // Paginated characters
    const paginatedCharacters = computed(() => {
      const all = filteredAndSortedCharacters.value
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return all.slice(start, end)
    })
    
    // Pagination info
    const totalPages = computed(() => {
      return Math.ceil(filteredAndSortedCharacters.value.length / itemsPerPage.value)
    })
    
    const hasNextPage = computed(() => currentPage.value < totalPages.value)
    const hasPrevPage = computed(() => currentPage.value > 1)
    
    // Pagination handlers
    const goToPage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        // Scroll to top when changing page
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    
    const nextPage = () => {
      if (hasNextPage.value) {
        goToPage(currentPage.value + 1)
      }
    }
    
    const prevPage = () => {
      if (hasPrevPage.value) {
        goToPage(currentPage.value - 1)
      }
    }
    
    // Reset to page 1 when filters change
    watch([debouncedQuery, sortBy, selectedGame, selectedElements, selectedRarities, selectedTier], () => {
      currentPage.value = 1
    })
    
    // Scroll restoration
    const { restoreScrollState } = useScrollRestore()
    
    // Single onMounted hook to handle initialization
    onMounted(async () => {
      try {
        // Restore scroll state first
        const savedState = restoreScrollState()
        
        // Get game from query param first (highest priority)
        const gameFromQuery = route.query.game as string
        let gameToLoad: string | null = null
        
        if (gameFromQuery && (gameFromQuery === 'GI' || gameFromQuery === 'HSR' || gameFromQuery === 'ZZZ')) {
          gameToLoad = gameFromQuery.toUpperCase()
        } else if (savedState?.filters?.game) {
          // Try to restore from saved state if no query param
          gameToLoad = savedState.filters.game
        }
        
        // Set game if we have one (this will trigger watch to load data)
        if (gameToLoad) {
          changeGame(gameToLoad)
          // Wait for watch to trigger (debounced), then check if we need to initialize
          await nextTick()
          // Small delay to let debounced watch execute
          await new Promise(resolve => setTimeout(resolve, 150))
        }
        
        // Initialize only if not already loading/loaded (watch may have triggered)
        await initialize()
        
        // Restore other state after data is loaded
        if (savedState) {
          if (savedState.sortBy) {
            sortBy.value = savedState.sortBy as any
          }
          if (savedState.searchQuery) {
            searchQuery.value = savedState.searchQuery
          }
        }
      } catch (err) {
        console.error('[Character.vue] Error during initialization:', err)
      }
    })
    
    // Build Guide Modal state
    const showBuildGuideModal = ref(false)
    const viewingCharacter = ref<any>(null)

    const handleViewBuildGuide = (id: string) => {
      viewingCharacter.value = characters.value.find(c => {
        const cid = (c as any)._id || (c as any).id || (c as any).characterId
        return String(cid) === String(id)
      })
      showBuildGuideModal.value = true
    }

    // Convert readonly array to mutable array for template
    const gamesArray = computed(() => [...GAMES])

    return {
      // Constants
      GAMES: gamesArray,
      ENABLE_CRUD,
      
      // State
      characters,
      loading,
      error,
      selectedGame,
      gridColumns,
      sortBy,
      searchQuery,
      selectedElements,
      selectedRarities,
      selectedTier,
      availableElements,
      filteredAndSortedCharacters,
      paginatedCharacters,
      currentPage,
      totalPages,
      hasNextPage,
      hasPrevPage,
      goToPage,
      nextPage,
      prevPage,
      showBuildGuideModal,
      viewingCharacter,
      
      // Actions
      loadCharacters,
      changeGame,
      handleViewBuildGuide,
    }
  }
})
</script>

<style scoped src="../../assets/styles/pages/Character.css"></style>
