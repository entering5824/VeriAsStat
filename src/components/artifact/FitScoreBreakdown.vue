<template>
  <div class="fit-score-breakdown">
    <div class="fit-score-header">
      <h3>Fit Score Breakdown</h3>
      <div class="total-score" :class="getScoreClass(fitScore.total)">
        {{ fitScore.total }}
      </div>
    </div>

    <div class="breakdown-items">
      <div
        v-for="item in breakdownItems.items"
        :key="item.label"
        class="breakdown-item"
        :class="{ 'penalty': item.value < 0 }"
      >
        <div class="breakdown-label">
          {{ item.label }}
          <span class="breakdown-description" v-if="item.description">
            ({{ item.description }})
          </span>
        </div>
        <div class="breakdown-value">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${Math.abs(item.value)}%` }"
              :class="getProgressClass(item.value)"
            ></div>
          </div>
          <span class="value-text">{{ item.value > 0 ? '+' : '' }}{{ item.value }}</span>
        </div>
      </div>
    </div>

    <div class="feature-contribution" v-if="fitScore.featureContribution">
      <h4>Feature Contribution</h4>
      <div class="contribution-list">
        <div
          v-for="(value, key) in fitScore.featureContribution"
          :key="key"
          class="contribution-item"
        >
          <span class="contribution-label">{{ formatKey(key) }}</span>
          <span class="contribution-value">{{ (value * 100).toFixed(1) }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ArtifactFitScore } from '../../types/artifact'
import { combineBreakdown } from '../../utils/artifact'

interface Props {
  fitScore: ArtifactFitScore
}

const props = defineProps<Props>()

const breakdownItems = computed(() => {
  return combineBreakdown(props.fitScore.breakdown, props.fitScore.antiFitPenalties)
})

function getScoreClass(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

function getProgressClass(value: number): string {
  if (value < 0) return 'penalty'
  if (value >= 80) return 'excellent'
  if (value >= 60) return 'good'
  if (value >= 40) return 'fair'
  return 'poor'
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}
</script>

<style scoped>
.fit-score-breakdown {
  background: var(--glass-bg, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-4, 16px);
}

.fit-score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4, 16px);
}

.fit-score-header h3 {
  margin: 0;
  font-size: 1.125rem;
}

.total-score {
  font-size: 1.5rem;
  font-weight: bold;
  padding: 8px 16px;
  border-radius: 8px;
}

.total-score.excellent {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.total-score.good {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.total-score.fair {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.total-score.poor {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.breakdown-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}

.breakdown-item.penalty {
  opacity: 0.7;
}

.breakdown-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.breakdown-description {
  font-size: 0.75rem;
  opacity: 0.7;
  font-weight: normal;
}

.breakdown-value {
  display: flex;
  align-items: center;
  gap: var(--space-2, 8px);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s;
}

.progress-fill.excellent {
  background: #4caf50;
}

.progress-fill.good {
  background: #2196f3;
}

.progress-fill.fair {
  background: #ffc107;
}

.progress-fill.poor {
  background: #f44336;
}

.progress-fill.penalty {
  background: #f44336;
}

.value-text {
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 50px;
  text-align: right;
}

.feature-contribution {
  margin-top: var(--space-4, 16px);
  padding-top: var(--space-4, 16px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.feature-contribution h4 {
  margin: 0 0 var(--space-2, 8px) 0;
  font-size: 1rem;
}

.contribution-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}

.contribution-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.contribution-label {
  opacity: 0.8;
}

.contribution-value {
  font-weight: 600;
}
</style>

