<template>
  <div class="artifact-page page-with-orbs" data-testid="artifact-page">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Artifacts</h1>
          <p class="page-subtitle" v-if="!loading && filteredArtifacts.length > 0">
            Showing {{ filteredArtifacts.length }} artifacts
          </p>
        </div>
        <div class="page-controls">
          <select v-model="selectedGame" class="game-selector">
            <option value="GI">Genshin Impact</option>
            <option value="HSR">Honkai: Star Rail</option>
            <option value="ZZZ">Zenless Zone Zero</option>
          </select>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search artifacts..."
            class="search-input"
          />
        </div>
      </div>

      <!-- Navigation Buttons -->
      <PageNavigation :game="selectedGame" />

      <!-- Content Section -->
      <div class="content-section">
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading artifacts...</p>
        </div>
        <div v-else-if="filteredArtifacts.length === 0" class="empty-state">
          <p>No artifacts found</p>
        </div>
        <ArtifactGrid
          v-else
          :artifacts="filteredArtifacts"
          :fit-scores="fitScores"
          :game="selectedGame"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import type { ArtifactSet } from '../../types/artifact'
import { artifactSetService } from '../../services'
import { useImagePreloader } from '../../composables'
import ArtifactGrid from '../../components/artifact/ArtifactGrid.vue'
import PageNavigation from '../../components/common/PageNavigation.vue'

const route = useRoute()
const selectedGame = ref<'GI' | 'HSR' | 'ZZZ'>('GI')
const searchQuery = ref('')
const artifactSets = ref<ArtifactSet[]>([])
const loading = ref(false)
const fitScores = ref<Record<string, any>>({})

const filteredArtifacts = computed(() => {
  // Ensure artifactSets.value is always an array before filtering
  let filtered = Array.isArray(artifactSets.value) ? artifactSets.value : []

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(set => 
      set.name.toLowerCase().includes(query) ||
      (set.raw_2pc && set.raw_2pc.toLowerCase().includes(query)) ||
      (set.raw_4pc && set.raw_4pc.toLowerCase().includes(query))
    )
  }

  return filtered
})

const { preloadImagesFromSelector } = useImagePreloader()

async function loadArtifacts() {
  loading.value = true
  try {
    const result = await artifactSetService.getArtifactSets(selectedGame.value)
    
    // Ensure result is always an array
    if (Array.isArray(result)) {
      artifactSets.value = result
    } else {
      console.warn('[Artifact] Received non-array artifact sets:', result)
      artifactSets.value = []
    }
    
    // Đợi DOM update và preload images
    await nextTick()
    try {
      await preloadImagesFromSelector(
        '.artifact-card img, .artifact-item img',
        { timeout: 30000, continueOnError: true }
      )
    } catch (err) {
      console.warn('Error preloading artifact images:', err)
    }
  } catch (error) {
    console.error('Error loading artifact sets:', error)
    artifactSets.value = []
  } finally {
    loading.value = false
  }
}

// Watch route query for game changes
watch(() => route.query.game, (newGame) => {
  const gameCode = (newGame as string)?.toUpperCase() || 'GI'
  if (gameCode === 'GI' || gameCode === 'HSR' || gameCode === 'ZZZ') {
    if (selectedGame.value !== gameCode) {
      selectedGame.value = gameCode as 'GI' | 'HSR' | 'ZZZ'
    }
  }
}, { immediate: true })

// Watch selectedGame to reload artifacts (avoid infinite loop)
watch(selectedGame, (newGame, oldGame) => {
  // Only reload if game actually changed (not on initial mount)
  if (newGame !== oldGame && oldGame !== undefined) {
    loadArtifacts()
  }
})

onMounted(() => {
  // Get game from query param on mount
  const gameFromQuery = route.query.game as string
  if (gameFromQuery && (gameFromQuery === 'GI' || gameFromQuery === 'HSR' || gameFromQuery === 'ZZZ')) {
    selectedGame.value = gameFromQuery as 'GI' | 'HSR' | 'ZZZ'
  }
  // Load artifacts if not already loaded
  if (artifactSets.value.length === 0) {
    loadArtifacts()
  }
})
</script>

<style scoped>
.artifact-page {
  position: relative;
  width: 100%;
  max-width: 100%;
  background: var(--page-radial-bg);
  min-height: 100vh;
  overflow: hidden;
}

/* Background orbs handled by page-with-orbs class */
.artifact-page::before,
.artifact-page::after {
  display: none;
}

/* Page-specific controls */
.page-controls {
  display: flex;
  gap: var(--space-2, 8px);
  flex-wrap: wrap;
}

.game-selector,
.search-input {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: var(--glass-bg, rgba(255, 255, 255, 0.1));
  color: inherit;
  font-size: var(--font-size-sm, 0.875rem);
  transition: all 0.2s;
}

.game-selector:hover,
.search-input:hover {
  border-color: rgba(255, 255, 255, 0.3);
}

.game-selector:focus,
.search-input:focus {
  outline: none;
  border-color: var(--color-primary, #2196f3);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2);
}

.search-input {
  min-width: 200px;
}

.filters-section {
  display: flex;
  gap: var(--space-4, 16px);
  margin-bottom: var(--space-4, 16px);
  flex-wrap: wrap;
  padding: var(--space-3, 12px);
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border-radius: var(--glass-radius, 1rem);
  backdrop-filter: blur(var(--glass-blur, 12px));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  box-shadow: var(--glass-shadow, 0 0.25rem 1.5rem rgba(0, 0, 0, 0.6));
  position: relative;
  z-index: 1;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

.filter-group label {
  font-weight: 500;
}

.filter-buttons {
  display: flex;
  gap: var(--space-1, 4px);
}

.filter-buttons button {
  padding: var(--space-1, 4px) var(--space-2, 8px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-buttons button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.filter-buttons button.active {
  background: rgba(33, 150, 243, 0.3);
  border-color: #2196f3;
}

.slot-selector {
  padding: var(--space-2, 8px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: var(--glass-bg, rgba(255, 255, 255, 0.1));
  color: inherit;
}

/* loading-state and empty-state are now in utilities.css */
</style>

