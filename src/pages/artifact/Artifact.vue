<template>
  <div class="artifact-page" data-testid="artifact-page">
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
import type { ArtifactSet } from '../types/artifact'
import { artifactSetService } from '../services'
import { useImagePreloader } from '../composables/useImagePreloader'
import ArtifactGrid from '../components/artifact/ArtifactGrid.vue'
import PageNavigation from '../components/common/PageNavigation.vue'

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
  padding: var(--space-4, 16px);
  overflow: hidden;
}

/* Dynamic Background Orbs */
.artifact-page::before {
  content: '';
  position: fixed;
  top: -20%;
  left: -10%;
  width: 600px;
  height: 600px;
  background: var(--orb-purple);
  border-radius: 50%;
  animation: orbFloat1 20s ease-in-out infinite;
  z-index: 0;
  pointer-events: none;
}

.artifact-page::after {
  content: '';
  position: fixed;
  bottom: -15%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: var(--orb-cyan);
  border-radius: 50%;
  animation: orbFloat2 25s ease-in-out infinite;
  z-index: 0;
  pointer-events: none;
}

/* Navigation Buttons */
.navigation-buttons {
  display: flex;
  gap: var(--space-2, 8px);
  margin-bottom: var(--space-6, 24px);
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border-radius: var(--glass-radius, 1rem);
  padding: var(--space-2, 8px);
  backdrop-filter: blur(var(--glass-blur, 12px));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
}

.nav-btn {
  flex: 1;
  min-width: 120px;
  padding: var(--space-3, 12px) var(--space-5, 20px);
  border-radius: var(--radius-md, 8px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--color-text-secondary);
  text-decoration: none;
  text-align: center;
  font-weight: 500;
  font-size: var(--font-size-sm, 14px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: var(--radius-md, 8px);
}

.nav-btn:hover::before {
  opacity: 1;
}

.nav-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  color: var(--color-text-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-btn.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(102, 126, 234, 0.15));
  color: #fff;
  font-weight: 600;
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .navigation-buttons {
    flex-wrap: wrap;
    gap: var(--space-2, 8px);
  }
  
  .nav-btn {
    min-width: calc(50% - 4px);
    flex: 1 1 auto;
  }
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4, 16px);
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border-radius: var(--glass-radius, 1rem);
  padding: var(--space-6, 24px);
  backdrop-filter: blur(var(--glass-blur, 12px));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  box-shadow: var(--glass-shadow, 0 0.25rem 1.5rem rgba(0, 0, 0, 0.6));
  position: relative;
  z-index: 1;
  transition: var(--transition-all, all 200ms ease);
}

.page-header:hover {
  background: var(--glass-bg-hover, rgba(255, 255, 255, 0.08));
  box-shadow: var(--glass-shadow-hover, 0 0.5rem 2rem rgba(0, 0, 0, 0.7));
}

.page-title {
  font-size: 2rem;
  margin: 0;
}

.page-controls {
  display: flex;
  gap: var(--space-2, 8px);
}

.game-selector,
.search-input {
  padding: var(--space-2, 8px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: var(--glass-bg, rgba(255, 255, 255, 0.1));
  color: inherit;
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

.loading-state,
.empty-state {
  text-align: center;
  padding: var(--space-8, 32px);
  opacity: 0.7;
}
</style>

