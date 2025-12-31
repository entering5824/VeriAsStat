<template>
  <div class="artifact-stats-table">
    <table>
      <thead>
        <tr>
          <th>Stat</th>
          <th>Value</th>
          <th v-if="showEffective">Effective</th>
          <th v-if="showRolls">Rolls</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="artifact.mainStat" class="main-stat">
          <td>
            <strong>{{ formatStatName(artifact.mainStat.key) }}</strong>
            <span class="stat-badge main">Main</span>
          </td>
          <td>{{ formatStatValue(artifact.mainStat.key, artifact.mainStat.value) }}</td>
          <td v-if="showEffective">
            {{ formatStatValue(artifact.mainStat.key, getEffectiveValue(artifact.mainStat.key, artifact.mainStat.value)) }}
          </td>
          <td v-if="showRolls">-</td>
        </tr>
        <tr
          v-for="(subStat, index) in artifact.subStats"
          :key="index"
          class="sub-stat"
          :class="{ 'highlight': isHighlighted(subStat.key) }"
        >
          <td>{{ formatStatName(subStat.key) }}</td>
          <td>{{ formatStatValue(subStat.key, subStat.value) }}</td>
          <td v-if="showEffective">
            {{ formatStatValue(subStat.key, getEffectiveValue(subStat.key, subStat.value)) }}
          </td>
          <td v-if="showRolls">{{ subStat.rollCount || 0 }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { ArtifactStatsRaw, CanonicalStat } from '../../types/artifact'
import { evaluateStat } from '../../utils/stats'
import type { StatContext } from '../../types/artifact'

interface Props {
  artifact: ArtifactStatsRaw
  context?: StatContext
  showEffective?: boolean
  showRolls?: boolean
  highlightedStats?: CanonicalStat[]
}

const props = withDefaults(defineProps<Props>(), {
  showEffective: false,
  showRolls: true,
  highlightedStats: () => []
})

function formatStatName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function formatStatValue(key: string, value: number): string {
  const percentageStats = ['atkPct', 'hpPct', 'defPct', 'critRate', 'critDmg', 'energy']
  if (percentageStats.includes(key)) {
    return `${value.toFixed(1)}%`
  }
  return value.toFixed(0)
}

function getEffectiveValue(key: CanonicalStat, rawValue: number): number {
  if (!props.context) return rawValue
  return evaluateStat(rawValue, key, props.context)
}

function isHighlighted(key: CanonicalStat): boolean {
  return props.highlightedStats?.includes(key) || false
}
</script>

<style scoped>
.artifact-stats-table {
  background: var(--glass-bg, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-4, 16px);
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

th {
  text-align: left;
  padding: var(--space-2, 8px);
  font-weight: 600;
  font-size: 0.875rem;
  opacity: 0.8;
}

td {
  padding: var(--space-2, 8px);
  font-size: 0.875rem;
}

tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

tbody tr:last-child {
  border-bottom: none;
}

.main-stat {
  background: rgba(76, 175, 80, 0.1);
}

.sub-stat.highlight {
  background: rgba(33, 150, 243, 0.1);
}

.stat-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  margin-left: var(--space-1, 4px);
}

.stat-badge.main {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}
</style>

