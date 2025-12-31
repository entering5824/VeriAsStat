<template>
  <div
    class="artifact-card"
    data-testid="artifact-item"
  >
    <div class="artifact-card-header">
      <div class="artifact-set-name">{{ artifact.name }}</div>
    </div>
    
    <div class="artifact-card-body">
      <div class="artifact-bonus" v-if="artifact['2pc_bonus']">
        <div class="bonus-label">2-Piece Set:</div>
        <div class="bonus-text">{{ artifact.raw_2pc || formatBonus(artifact['2pc_bonus']) }}</div>
      </div>
      <div class="artifact-bonus" v-if="artifact['4pc_bonus'] && artifact['4pc_bonus'].length > 0">
        <div class="bonus-label">4-Piece Set:</div>
        <div class="bonus-text">{{ artifact.raw_4pc || format4pcBonus(artifact['4pc_bonus']) }}</div>
      </div>
    </div>

    <div class="artifact-card-footer" v-if="fitScore">
      <div class="fit-score-badge" :class="getFitScoreClass(fitScore.total)">
        {{ fitScore.total }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ArtifactSet, ArtifactFitScore } from '../../types/artifact'

interface Props {
  artifact: ArtifactSet
  fitScore?: ArtifactFitScore | null
  game?: 'GI' | 'HSR' | 'ZZZ'
}

const props = withDefaults(defineProps<Props>(), {
  game: 'GI'
})


function formatBonus(bonus: { stat: string; value: number | number[]; type: string }): string {
  const value = Array.isArray(bonus.value) ? bonus.value[0] : bonus.value
  const suffix = bonus.type === 'percent' ? '%' : ''
  return `${bonus.stat} +${value}${suffix}`
}

function format4pcBonus(bonuses: Array<{ trigger: string | string[]; effect: Array<{ stat: string; value: number | number[]; type: string }> }>): string {
  if (bonuses.length === 0) return ''
  const firstBonus = bonuses[0]
  if (!firstBonus) return ''
  const trigger = Array.isArray(firstBonus.trigger) ? firstBonus.trigger.join(', ') : firstBonus.trigger
  const effects = firstBonus.effect?.map(e => {
    const value = Array.isArray(e.value) ? e.value[0] : e.value
    const suffix = e.type === 'percent' ? '%' : ''
    return `${e.stat} +${value}${suffix}`
  }).join(', ') || ''
  return `${trigger}: ${effects}`
}

function getFitScoreClass(score: number): string {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}
</script>

<style scoped>
.artifact-card {
  display: flex;
  flex-direction: column;
  background: var(--glass-bg, rgba(255, 255, 255, 0.1));
  border-radius: var(--radius-lg, 12px);
  padding: var(--space-4, 16px);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;
}

.artifact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.artifact-card-header {
  margin-bottom: var(--space-3, 12px);
}

.artifact-set-name {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: var(--space-2, 8px);
}

.artifact-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.artifact-bonus {
  display: flex;
  flex-direction: column;
  gap: var(--space-1, 4px);
}

.bonus-label {
  font-size: 0.75rem;
  opacity: 0.7;
  font-weight: 500;
}

.bonus-text {
  font-size: 0.875rem;
  opacity: 0.9;
  line-height: 1.4;
}

.artifact-card-footer {
  margin-top: var(--space-2, 8px);
  display: flex;
  justify-content: flex-end;
}

.fit-score-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.fit-score-badge.excellent {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.fit-score-badge.good {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.fit-score-badge.fair {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.fit-score-badge.poor {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}
</style>

