<template>
  <div class="weapon-stats-table">
    <table class="glass-table">
      <thead>
        <tr>
          <th>Stat</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(value, stat) in stats"
          :key="stat"
          :class="{ 'is-highlighted': highlightedStats.includes(stat) }"
          @mouseenter="$emit('stat-hover', stat)"
          @mouseleave="$emit('stat-hover', '')"
        >
          <td class="stat-cell-label">
            <span class="stat-dot"></span>
            {{ formatStatName(stat) }}
          </td>
          <td class="stat-cell-value">{{ formatStatValue(stat, value) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface Props {
  stats: Record<string, any>
  highlightedStats?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  highlightedStats: () => []
})

const emit = defineEmits<{
  'stat-hover': [stat: string]
}>()

function formatStatName(stat: string): string {
  // Convert camelCase to Title Case
  return stat
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function formatStatValue(stat: string, value: string | number): string {
  if (typeof value === 'number') {
    // Detect percentage stats loosely based on name
    const lowerStat = stat.toLowerCase()
    if (lowerStat.includes('percent') || lowerStat.includes('pct') || lowerStat.includes('rate') || lowerStat.includes('bonus') || lowerStat.includes('eff')) {
      return `${value.toFixed(1)}%`
    }
    return value.toLocaleString()
  }
  return String(value)
}
</script>

<style scoped>
.weapon-stats-table {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.glass-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

thead th {
  text-align: left;
  padding: var(--space-4);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-on-surface-variant);
  border-bottom: 1px solid var(--glass-border);
  background: rgba(255, 255, 255, 0.03);
}

tbody tr {
  transition: background-color 0.2s, transform 0.2s;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

/* Hover & Highlight States */
tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

tbody tr.is-highlighted {
  background: var(--color-primary-alpha);
  border-left: 2px solid var(--color-primary);
}

tbody tr.is-highlighted .stat-cell-value {
  color: var(--color-primary-light);
  text-shadow: 0 0 10px var(--color-primary-glow);
}

/* Cell Typography */
.stat-cell-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
}

.stat-cell-value {
  font-family: 'Roboto Mono', monospace;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-align: right;
}

.stat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-surface-variant);
  transition: background-color 0.3s;
}

tr:hover .stat-dot,
tr.is-highlighted .stat-dot {
  background: var(--color-primary);
  box-shadow: 0 0 8px var(--color-primary);
}
</style>

