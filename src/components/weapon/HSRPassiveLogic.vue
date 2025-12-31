<template>
  <div class="hsr-passive" @mouseenter="onHover" @mouseleave="onLeave">
    <div class="passive-text" v-html="renderedText"></div>
    <div v-if="superimposition > 1" class="superimposition-badge">S{{ superimposition }}</div>
    <div v-if="pathRestriction" class="path-restriction">Path: {{ weapon.path }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { HSRLightCone, PassiveEffect } from '../../types/weapon'

interface Props {
  passive: PassiveEffect
  weapon: HSRLightCone
  level?: number
  superimposition?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 90,
  superimposition: 1
})

const emit = defineEmits<{
  highlight: [stats: string[], characters: string[]]
}>()

const renderedText = computed(() => {
  if (props.passive.text) {
    return props.passive.text
  }

  const parts: string[] = []
  
  if (props.passive.type === 'stat_bonus') {
    const atkPct = props.passive.params.atkPct as number
    if (atkPct) {
      parts.push(`Increases ATK by ${(atkPct * 100).toFixed(1)}%`)
    }
  }

  return parts.join('. ') || 'Light Cone effect active'
})

const pathRestriction = computed(() => !!props.weapon.path)

const affectedStats = computed(() => {
  const stats: string[] = []
  if (props.passive.params.atkPct) stats.push('ATK')
  if (props.passive.params.hpPct) stats.push('HP')
  if (props.passive.params.defPct) stats.push('DEF')
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
.hsr-passive {
  position: relative;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: background 0.2s;
}

.hsr-passive:hover {
  background: var(--color-surface-hover);
}

.superimposition-badge {
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

.path-restriction {
  margin-top: var(--space-2);
  padding: var(--space-1) var(--space-2);
  background: var(--color-surface-variant);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}
</style>

