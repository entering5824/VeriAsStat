<template>
  <div class="weapon-page page-with-orbs">
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Weapons</h1>
          <p class="page-subtitle" v-if="!loading && filteredWeapons.length > 0">
            Showing {{ filteredWeapons.length }} weapons
          </p>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <PageNavigation :game="currentGame" />

      <div class="page-content">
        <!-- Sidebar Filters -->
        <aside class="filters-sidebar">
          <WeaponFilters
            v-model:filters="filters"
            v-model:searchQuery="searchQuery"
            v-model:sortOption="sortOption"
            @reset="resetFilters"
          />
        </aside>

        <!-- Main Content -->
        <main class="weapons-grid-area">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <span>Syncing weapon database...</span>
          </div>

          <div v-else-if="filteredWeapons.length === 0" class="empty-state">
            <i class="mdi mdi-sword-cross empty-icon"></i>
            <h3>No weapons found</h3>
            <p>Try adjusting your search or filters.</p>
            <button class="btn-primary" @click="resetFilters">Clear Filters</button>
          </div>

          <WeaponGrid
            v-if="!loading && filteredWeapons.length > 0"
            :weapons="filteredWeapons"
            @weapon-click="handleWeaponClick"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { weaponService } from '../../services'
import type { BaseWeapon } from '../../types/weapon'
import { useWeaponFilter, useImagePreloader } from '../../composables'
import WeaponGrid from '../../components/weapon/WeaponGrid.vue'
import WeaponFilters from '../../components/weapon/WeaponFilters.vue'
import PageNavigation from '../../components/common/PageNavigation.vue'

const router = useRouter()
const route = useRoute()
const allWeapons = ref<BaseWeapon[]>([])
const loading = ref(true)

// Initialize composable
const { 
  searchQuery, 
  filters, 
  sortOption, 
  filteredWeapons, 
  resetFilters 
} = useWeaponFilter(allWeapons)

// Get current game from filter or query param
const currentGame = computed(() => {
  const gameFromQuery = route.query.game as string
  if (gameFromQuery && (gameFromQuery === 'GI' || gameFromQuery === 'HSR' || gameFromQuery === 'ZZZ')) {
    return gameFromQuery
  }
  return filters.value.game || 'GI'
})

// Image preloader
const { preloadImagesFromSelector } = useImagePreloader()

async function loadWeapons() {
  loading.value = true
  try {
    // Current service fetches by game, but we want all for client-side filtering 
    // or we can watch filters.game to refetch if the API is segregated.
    // For now, let's respect the current filter's game or fetch all if possible.
    // Assuming service matches filter:
    const result = await weaponService.getWeapons(filters.value.game)
    allWeapons.value = Array.isArray(result) ? result : []
    
    // Đợi DOM update và preload images
    await nextTick()
    try {
      await preloadImagesFromSelector(
        '.weapon-card img, .weapon-icon',
        { timeout: 30000, continueOnError: true }
      )
    } catch (err) {
      console.warn('Error preloading weapon images:', err)
    }
  } catch (error) {
    console.error('Error loading weapons:', error)
  } finally {
    loading.value = false
  }
}

function handleWeaponClick(weapon: BaseWeapon) {
  router.push(`/weapons/${weapon.id}?game=${weapon.game}`)
}

// Watch game filter to reload data if API separates endpoints
watch(() => filters.value.game, () => {
  loadWeapons()
})

onMounted(() => {
  // Get game from query param
  const gameFromQuery = route.query.game as string
  if (gameFromQuery && (gameFromQuery === 'GI' || gameFromQuery === 'HSR' || gameFromQuery === 'ZZZ')) {
    filters.value.game = gameFromQuery
  }
  loadWeapons()
})

// Watch route query to update filter when navigating
watch(() => route.query.game, (newGame) => {
  if (newGame && (newGame === 'GI' || newGame === 'HSR' || newGame === 'ZZZ')) {
    filters.value.game = newGame
  }
})
</script>

<style scoped>
.weapon-page {
  position: relative;
  width: 100%;
  max-width: 100%;
  background: var(--page-radial-bg);
  min-height: 100vh;
  overflow: hidden;
}

/* Background orbs handled by page-with-orbs class */
.weapon-page::before,
.weapon-page::after {
  display: none;
}

/* page-container, page-header, page-title, page-subtitle are now in utilities.css */

.page-content {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-8);
  align-items: start;
  position: relative;
  z-index: 1;
}

@media (max-width: 1024px) {
  .page-content {
    grid-template-columns: 1fr;
  }
}

.filters-sidebar {
  position: sticky;
  top: var(--space-6);
  align-self: start;
}

.weapons-grid-area {
  position: relative;
  z-index: 1;
}

/* loading-state, empty-state, spinner are now in utilities.css */

.results-meta {
  margin-bottom: var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.btn-primary {
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-6);
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  opacity: 0.9;
}
</style>

