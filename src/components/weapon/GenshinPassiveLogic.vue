<template>
  <div class="genshin-passive" @mouseenter="onHover" @mouseleave="onLeave">
    <div class="passive-text" v-html="renderedText"></div>
    <div v-if="refinement > 1" class="refinement-badge">R{{ refinement }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GenshinWeapon, PassiveEffect } from '../../types/weapon'

interface Props {
  passive: PassiveEffect
  weapon: GenshinWeapon
  level?: number
  refinement?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 90,
  refinement: 1
})

const emit = defineEmits<{
  highlight: [stats: string[], characters: string[]]
}>()

const renderedText = computed(() => {
  // Render text from data-driven passive effect
  // This is derived output, not source of truth
  if (props.passive.text) {
    return props.passive.text
  }

  // Generate text from data
  const parts: string[] = []
  
  if (props.passive.type === 'stat_bonus') {
    const atkPct = props.passive.params.atkPct as number
    if (atkPct) {
      parts.push(`Increases ATK by ${(atkPct * 100).toFixed(1)}%`)
    }
  }

  if (props.passive.conditions && props.passive.conditions.length > 0) {
    parts.push('When conditions are met:')
  }

  return parts.join('. ') || 'Passive effect active'
})

const affectedStats = computed(() => {
  const stats: string[] = []
  if (props.passive.params.atkPct) stats.push('ATK')
  if (props.passive.params.critRate) stats.push('Crit Rate')
  if (props.passive.params.critDmg) stats.push('Crit DMG')
  return stats
})

function onHover() {
  emit('highlight', affectedStats.value, [])
}

function onLeave() {
  emit('highlight', [], [])
}
</script>

<style scoped>
.genshin-passive {
  position: relative;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: background 0.2s;
}

.genshin-passive:hover {
  background: var(--color-surface-hover);
}

.refinement-badge {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}
</style>

