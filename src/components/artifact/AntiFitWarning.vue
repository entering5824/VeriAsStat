<template>
  <div class="anti-fit-warning" v-if="antiFits.length > 0">
    <div class="warning-header">
      <span class="warning-icon">⚠️</span>
      <h4>Anti-Fit Warnings</h4>
    </div>
    <div class="warning-list">
      <div
        v-for="(antiFit, index) in antiFits"
        :key="index"
        class="warning-item"
        :class="getReasonClass(antiFit.reason)"
      >
        <div class="warning-reason">{{ formatReason(antiFit.reason) }}</div>
        <div class="warning-penalty">-{{ antiFit.penaltyScore }}</div>
        <div class="warning-explanation" v-if="antiFit.explanation">
          {{ antiFit.explanation }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArtifactAntiFit } from '../../types/artifact'

interface Props {
  antiFits: ArtifactAntiFit[]
}

const props = defineProps<Props>()

function formatReason(reason: string): string {
  return reason
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function getReasonClass(reason: string): string {
  return reason.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()
}
</script>

<style scoped>
.anti-fit-warning {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-4, 16px);
  margin-top: var(--space-4, 16px);
}

.warning-header {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
  margin-bottom: var(--space-3, 12px);
}

.warning-icon {
  font-size: 1.25rem;
}

.warning-header h4 {
  margin: 0;
  color: #f44336;
  font-size: 1rem;
}

.warning-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}

.warning-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
  padding: var(--space-2, 8px);
  background: rgba(244, 67, 54, 0.05);
  border-radius: var(--radius-md, 8px);
}

.warning-reason {
  font-weight: 600;
  font-size: 0.875rem;
  color: #f44336;
}

.warning-penalty {
  font-size: 0.75rem;
  opacity: 0.8;
}

.warning-explanation {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: var(--space-1, 4px);
}
</style>

