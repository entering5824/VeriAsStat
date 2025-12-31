<!-- 
  Component: Character Filter Toolbar
  
  Optimized filter toolbar with:
  - Debounced updates
  - Memoized computations
  - Minimal re-renders
-->
<template>
  <div class="filter-toolbar">
    <div class="filter-group">
      <button
        v-for="game in games"
        :key="game"
        class="filter-btn"
        :class="{ active: selectedGame === game }"
        @click="handleGameChange(game)"
        :aria-label="`Filter by ${game}`"
        :aria-pressed="selectedGame === game"
      >
        {{ game }}
      </button>
    </div>
    
    <!-- Search Input -->
    <div class="search-group">
      <input
        id="search-input"
        type="text"
        :value="searchQuery"
        @input="handleSearchChange"
        class="search-input"
        placeholder="Search characters..."
        aria-label="Search characters"
      />
    </div>
    
    <div class="controls-group">
      <!-- Sort Selector -->
      <div class="sort-selector">
        <label for="sort-select" class="sort-label">Sort:</label>
        <select
          id="sort-select"
          :value="sortBy"
          @change="handleSortChange"
          class="sort-select"
          aria-label="Sort characters"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="tier-desc">Tier (High-Low)</option>
          <option value="tier-asc">Tier (Low-High)</option>
          <option value="rarity-desc">Rarity (5★ first)</option>
          <option value="rarity-asc">Rarity (4★ first)</option>
          <option value="newest">Newest</option>
        </select>
      </div>
      
      <!-- Column Selector -->
      <div class="column-selector">
        <label for="column-select" class="column-label">Columns:</label>
        <select
          id="column-select"
          :value="columns"
          @change="handleColumnChange"
          class="column-select"
          aria-label="Select number of columns"
        >
          <option :value="4">4</option>
          <option :value="6">6</option>
          <option :value="8">8</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { withDefaults } from 'vue'
// Props
interface Props {
  games: string[]
  selectedGame: string
  sortBy: string
  columns: number
  searchQuery?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: ''
})

// Emits
const emit = defineEmits<{
  'update:selectedGame': [value: string]
  'update:sortBy': [value: string]
  'update:columns': [value: number]
  'update:searchQuery': [value: string]
}>()

// Handlers - no debounce needed for simple state updates
const handleGameChange = (game: string) => {
  if (game !== props.selectedGame) {
    emit('update:selectedGame', game)
  }
}

const handleSortChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value
  if (value !== props.sortBy) {
    emit('update:sortBy', value)
  }
}

const handleColumnChange = (event: Event) => {
  const value = Number((event.target as HTMLSelectElement).value)
  if (value !== props.columns) {
    emit('update:columns', value)
  }
}

const handleSearchChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:searchQuery', value)
}
</script>

<style scoped>
/* Filter toolbar - Glass morphism */
.filter-toolbar {
  max-width: var(--container-max-width);
  margin: 0 auto var(--section-gap-sm, 24px);
  display: flex;
  gap: var(--space-2, 8px);
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4, 16px);
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: var(--glass-radius, 16px);
  backdrop-filter: blur(var(--glass-blur, 12px));
  box-shadow: var(--glass-shadow, 0 4px 24px rgba(0, 0, 0, 0.6));
  position: relative;
  z-index: 1;
  will-change: transform;
  contain: layout style paint;
}

.filter-group {
  display: flex;
  gap: var(--space-2, 8px);
  flex-wrap: wrap;
}

.search-group {
  flex: 1;
  max-width: 300px;
  margin: 0 var(--space-3, 12px);
}

.search-input {
  width: 100%;
  padding: var(--space-2, 8px) var(--space-3, 12px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md, 8px);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-medium);
  min-height: 44px;
  transition: var(--transition-all, all 200ms ease);
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.search-input:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--color-border-secondary);
}

.search-input:focus {
  outline: 2px solid var(--color-primary, #646cff);
  outline-offset: 2px;
  background: rgba(255, 255, 255, 0.12);
}

.controls-group {
  display: flex;
  gap: var(--space-3, 12px);
  align-items: center;
  flex-wrap: wrap;
}

.sort-selector,
.column-selector {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

.sort-label,
.column-label {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-muted);
  font-weight: var(--font-medium);
}

.sort-select,
.column-select {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md, 8px);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: var(--transition-all, all 200ms ease);
  min-height: 44px;
}

.sort-select:hover,
.column-select:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--color-border-secondary);
}

.sort-select:focus,
.column-select:focus {
  outline: 2px solid var(--color-primary, #646cff);
  outline-offset: 2px;
}

.sort-select option,
.column-select option {
  background: #1a1a1a;
  color: var(--color-text-primary);
}

.filter-btn {
  padding: var(--space-3, 12px) var(--space-4, 16px);
  min-height: 44px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium, 500);
  font-size: var(--font-size-sm, 15px);
  cursor: pointer;
  transition: all 200ms ease;
  position: relative;
  overflow: hidden;
  will-change: transform;
}

.filter-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, var(--color-bg-card-hover), transparent);
  transition: left 0.5s ease;
}

.filter-btn:hover::before {
  left: 100%;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 var(--space-1) var(--space-3) rgba(0, 0, 0, 0.2);
  color: var(--color-text-primary);
}

.filter-btn:focus {
  outline: 2px solid var(--color-primary, #646cff);
  outline-offset: 2px;
}

.filter-btn.active {
  background: linear-gradient(135deg, rgba(100, 108, 255, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  border-color: rgba(100, 108, 255, 0.8);
  color: var(--color-text-primary);
  box-shadow: 0 var(--space-1) var(--space-4) rgba(100, 108, 255, 0.5), 0 0 0 2px rgba(100, 108, 255, 0.2);
  transform: translateY(-2px) scale(1.05);
  font-weight: var(--font-semibold);
}

/* Responsive Design for Mobile */
@media (max-width: 768px) {
  .filter-toolbar {
    flex-wrap: wrap;
    gap: var(--space-2, 8px);
    padding: var(--space-3, 12px);
  }

  .search-group {
    order: -1;
    width: 100%;
    max-width: 100%;
    margin: 0 0 var(--space-2, 8px) 0;
  }

  .filter-btn {
    padding: var(--space-2, 8px) var(--space-3, 12px);
    font-size: var(--font-size-sm, 15px);
    flex: 1 1 auto;
    min-width: calc(33.333% - 6px);
    min-height: 44px;
  }
}

@media (max-width: 480px) {
  .filter-btn {
    min-width: calc(50% - 4px);
    font-size: var(--font-size-xs, 13px);
    padding: var(--space-2, 8px) var(--space-3, 12px);
    min-height: 44px;
  }
}

/* Advanced Filters */
.advanced-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3, 12px);
  align-items: center;
  margin-top: var(--space-3, 12px);
  padding-top: var(--space-3, 12px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-chip-group {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

.filter-chip-label {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-muted);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

.filter-chips {
  display: flex;
  gap: var(--space-2, 8px);
  flex-wrap: wrap;
}

.filter-chip {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  min-height: 36px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 200ms ease;
}

.filter-chip:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}

.filter-chip.active {
  background: linear-gradient(135deg, rgba(100, 108, 255, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  border-color: rgba(100, 108, 255, 0.8);
  color: var(--color-text-primary);
}

.tier-select {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md, 8px);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm, 14px);
  min-height: 36px;
  cursor: pointer;
}

.toggle-filters-btn {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  min-height: 36px;
  border-radius: var(--radius-md, 8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all 200ms ease;
}

.toggle-filters-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.25);
}
</style>
