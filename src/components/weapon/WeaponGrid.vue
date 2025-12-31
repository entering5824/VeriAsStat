<template>
  <div class="weapon-grid" :class="{ 'is-loading': loading }">
    <WeaponCard
      v-for="weapon in safeWeapons"
      :key="weapon.id"
      :weapon="weapon"
      :is-pinned="pinnedWeapons.has(weapon.id)"
      @click="$emit('weapon-click', weapon)"
      @toggle-pin="handleTogglePin"
    />
    <div v-if="safeWeapons.length === 0 && !loading" class="empty-state">
      No weapons found
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BaseWeapon } from '../../types/weapon'
import WeaponCard from './WeaponCard.vue'

interface Props {
  weapons: BaseWeapon[] | any
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'weapon-click': [weapon: BaseWeapon]
}>()

// Ensure weapons is always an array
const safeWeapons = computed(() => {
  if (Array.isArray(props.weapons)) {
    return props.weapons
  }
  console.warn('[WeaponGrid] Received non-array weapons prop:', props.weapons)
  return []
})

const pinnedWeapons = ref<Set<string>>(new Set())

function handleTogglePin(weaponId: string) {
  if (pinnedWeapons.value.has(weaponId)) {
    pinnedWeapons.value.delete(weaponId)
  } else {
    pinnedWeapons.value.add(weaponId)
  }
  // Would persist to localStorage
}
</script>

<style scoped>
.weapon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  padding: var(--space-4);
}

.weapon-grid.is-loading {
  opacity: 0.6;
  pointer-events: none;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--space-8);
  color: var(--color-on-surface-variant);
}

@media (max-width: 768px) {
  .weapon-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
    padding: var(--space-3);
  }
}
</style>

