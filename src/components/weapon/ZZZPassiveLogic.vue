<template>
  <div class="zzz-passive" @mouseenter="onHover" @mouseleave="onLeave">
    <div class="passive-text" v-html="renderedText"></div>
    <div v-if="rank > 1" class="rank-badge">Rank {{ rank }}</div>
    <div v-if="triggerConditions.length > 0" class="trigger-conditions">
      <div v-for="(condition, idx) in triggerConditions" :key="idx" class="condition-tag">
        {{ condition }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ZZZWEngine, PassiveEffect } from '../../types/weapon'

interface Props {
  passive: PassiveEffect
  weapon: ZZZWEngine
  level?: number
  rank?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 90,
  rank: 1
})

const emit = defineEmits<{
  highlight: [stats: string[], characters: string[]]
}>()

const renderedText = computed(() => {
  if (props.passive.text) {
    return props.passive.text
  }

  const parts: string[] = []
  
  if (props.passive.type === 'trigger') {
    parts.push('Trigger effect:')
    if (props.passive.params.damage) {
      parts.push(`Deals ${props.passive.params.damage}% damage`)
    }
  }

  return parts.join(' ') || 'W-Engine effect active'
})

const triggerConditions = computed(() => {
  if (!props.passive.conditions) return []
  return props.passive.conditions.map(c => `${c.type}: ${c.value}`)
})

const affectedStats = computed(() => {
  const stats: string[] = []
  if (props.passive.params.atkPct) stats.push('ATK')
  if (props.passive.params.impact) stats.push('Impact')
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
.zzz-passive {
  position: relative;
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: background 0.2s;
}

.zzz-passive:hover {
  background: var(--color-surface-hover);
}

.rank-badge {
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

.trigger-conditions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

.condition-tag {
  padding: var(--space-1) var(--space-2);
  background: var(--color-surface-variant);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}
</style>

