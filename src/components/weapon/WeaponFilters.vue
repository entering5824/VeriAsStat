<template>
  <div class="weapon-filters">
    <div class="filters-header">
      <h3>Filters</h3>
      <button 
        v-if="hasActiveFilters" 
        class="clear-button"
        @click="$emit('reset')"
      >
        Clear All
      </button>
    </div>

    <!-- Search -->
    <div class="filter-section search-section">
      <div class="search-input-wrapper">
        <input 
          :value="searchQuery"
          @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
          type="text" 
          placeholder="Search weapons..."
          class="search-input" 
        />
      </div>
    </div>

    <!-- Game Selector (if not handled globally) -->
    <div class="filter-section">
      <label class="section-label">Game</label>
      <div class="game-toggles">
        <button 
          v-for="g in ['GI', 'HSR', 'ZZZ']" 
          :key="g"
          class="game-btn"
          :class="{ active: filters.game === g }"
          @click="updateFilter('game', g)"
        >
          {{ g }}
        </button>
      </div>
    </div>

    <!-- Rarity -->
    <div class="filter-section">
      <label class="section-label">Rarity</label>
      <div class="rarity-options">
        <button
          v-for="r in [5, 4, 3]"
          :key="r"
          class="rarity-btn"
          :class="[{ active: filters.rarity === r }, `rarity-${r}`]"
          @click="updateFilter('rarity', filters.rarity === r ? null : r)"
        >
          {{ r }}★
        </button>
      </div>
    </div>

    <!-- Tags -->
    <div class="filter-section">
      <label class="section-label">Tags</label>
      <div class="tag-cloud">
        <button
          v-for="tag in availableTags"
          :key="tag"
          class="tag-btn"
          :class="{ active: filters.tags?.includes(tag) || false }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Sort -->
    <div class="filter-section">
      <label class="section-label">Sort By</label>
      <select 
        :value="sortOption"
        @change="$emit('update:sortOption', ($event.target as HTMLSelectElement).value as WeaponSortOption)"
        class="sort-select"
      >
        <option value="tier_desc">Tier (High to Low)</option>
        <option value="atk_desc">Base ATK (High to Low)</option>
        <option value="rarity_desc">Rarity (High to Low)</option>
        <option value="name_asc">Name (A-Z)</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { WeaponFilters, WeaponSortOption } from '../../composables'

interface Props {
  filters: WeaponFilters
  searchQuery: string
  sortOption: WeaponSortOption
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:filters': [filters: WeaponFilters]
  'update:searchQuery': [query: string]
  'update:sortOption': [option: WeaponSortOption]
  'reset': []
}>()

const availableTags = ['Signature', 'Meta', 'F2P Friendly', 'Limited']

const hasActiveFilters = computed(() => {
  return props.filters.rarity !== null || 
         (props.filters.tags && props.filters.tags.length > 0) ||
         props.searchQuery !== ''
})

function updateFilter(key: keyof WeaponFilters, value: any) {
  emit('update:filters', {
    ...props.filters,
    [key]: value
  })
}

function toggleTag(tag: string) {
  const currentTags = props.filters.tags || []
  const newTags = [...currentTags]
  const index = newTags.indexOf(tag)
  if (index === -1) {
    newTags.push(tag)
  } else {
    newTags.splice(index, 1)
  }
  updateFilter('tags', newTags)
}
</script>

<style scoped>
.weapon-filters {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
  color: var(--color-on-surface);
}

.clear-button {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  padding: 0;
}

.clear-button:hover {
  text-decoration: underline;
}

.section-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-on-surface-variant);
  margin-bottom: var(--space-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Search */
.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-on-surface-variant);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3) var(--space-2) var(--space-9); /* Left padding for icon */
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-on-surface);
  font-size: var(--font-size-sm);
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-alpha);
}

/* Game Toggles */
.game-toggles {
  display: flex;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  padding: 2px;
}

.game-btn {
  flex: 1;
  background: transparent;
  border: none;
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  color: var(--color-on-surface-variant);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: all 0.2s;
}

.game-btn.active {
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

/* Rarity Buttons */
.rarity-options {
  display: flex;
  gap: var(--space-2);
}

.rarity-btn {
  flex: 1;
  padding: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-on-surface);
  cursor: pointer;
  transition: all 0.2s;
  font-weight: var(--font-weight-bold);
}

.rarity-btn:hover {
  background: var(--color-bg-secondary);
}

.rarity-btn.active {
  border-color: currentColor;
  background: var(--color-bg-secondary);
}

.rarity-5.active { color: var(--color-rarity-5); border-color: var(--color-rarity-5); }
.rarity-4.active { color: var(--color-rarity-4); border-color: var(--color-rarity-4); }
.rarity-3.active { color: var(--color-rarity-3); border-color: var(--color-rarity-3); }

/* Tag Cloud */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag-btn {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-on-surface-variant);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s;
}

.tag-btn:hover {
  border-color: var(--color-primary-light);
  color: var(--color-on-surface);
}

.tag-btn.active {
  background: var(--color-primary-alpha);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Sort Select */
.sort-select {
  width: 100%;
  padding: var(--space-2);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-on-surface);
  font-size: var(--font-size-sm);
  cursor: pointer;
}
</style>
