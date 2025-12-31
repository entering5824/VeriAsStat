<template>
  <div class="lifecycle-manager">
    <div class="lifecycle-header">
      <h3>Lifecycle Management</h3>
      <button
        class="lock-button"
        :class="{ 'locked': lifecycle.isLocked }"
        @click="toggleLock"
      >
        {{ lifecycle.isLocked ? '🔒' : '🔓' }}
      </button>
    </div>

    <div class="lifecycle-stats">
      <div class="stat-item">
        <span class="stat-label">Upgrade Level</span>
        <span class="stat-value">{{ lifecycle.upgradeLevel }} / 20</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Cost Remaining</span>
        <span class="stat-value">{{ lifecycle.upgradeCostRemaining.toLocaleString() }}</span>
      </div>
      <div class="stat-item" v-if="lifecycle.expectedValueAfterUpgrade">
        <span class="stat-label">Expected Value</span>
        <span class="stat-value">{{ lifecycle.expectedValueAfterUpgrade.toFixed(0) }}</span>
      </div>
      <div class="stat-item" v-if="lifecycle.farmingPriority !== undefined">
        <span class="stat-label">Farming Priority</span>
        <span class="stat-value" :class="getPriorityClass(lifecycle.farmingPriority)">
          {{ lifecycle.farmingPriority.toFixed(0) }}
        </span>
      </div>
    </div>

    <div class="lifecycle-actions">
      <div class="roi-display" v-if="upgradeROI > 0">
        <span>Upgrade ROI: {{ (upgradeROI * 100).toFixed(2) }}%</span>
      </div>
      <div class="discard-suggestion" v-if="shouldDiscard">
        <span class="warning">⚠️ Consider discarding ({{ (discardProbability * 100).toFixed(0) }}% probability)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArtifactLifecycle } from '../../types/artifact'

interface Props {
  lifecycle: ArtifactLifecycle
  upgradeROI: number
  shouldDiscard: boolean
  discardProbability: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggleLock: []
}>()

function toggleLock() {
  emit('toggleLock')
}

function getPriorityClass(priority: number): string {
  if (priority >= 70) return 'high'
  if (priority >= 40) return 'medium'
  return 'low'
}
</script>

<style scoped>
.lifecycle-manager {
  background: var(--glass-bg, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-4, 16px);
}

.lifecycle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4, 16px);
}

.lifecycle-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.lock-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-2, 8px);
  cursor: pointer;
  font-size: 1.25rem;
  transition: all 0.2s;
}

.lock-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.lock-button.locked {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4caf50;
}

.lifecycle-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3, 12px);
  margin-bottom: var(--space-4, 16px);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.7;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
}

.stat-value.high {
  color: #4caf50;
}

.stat-value.medium {
  color: #ffc107;
}

.stat-value.low {
  color: #f44336;
}

.lifecycle-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}

.roi-display {
  padding: var(--space-2, 8px);
  background: rgba(33, 150, 243, 0.1);
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
}

.discard-suggestion {
  padding: var(--space-2, 8px);
  background: rgba(244, 67, 54, 0.1);
  border-radius: var(--radius-md, 8px);
  font-size: 0.875rem;
}

.discard-suggestion .warning {
  color: #f44336;
}
</style>

