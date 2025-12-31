<template>
  <div class="artifact-grid" data-testid="artifact-list">
    <ArtifactCard
      v-for="artifactSet in safeArtifacts"
      :key="artifactSet.name"
      :artifact="artifactSet"
      :fit-score="getFitScore(getArtifactSetId(artifactSet))"
      :game="game"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ArtifactSet, ArtifactFitScore } from '../../types/artifact'
import ArtifactCard from './ArtifactCard.vue'

interface Props {
  artifacts: ArtifactSet[] | any
  fitScores?: Record<string, ArtifactFitScore>
  game?: 'GI' | 'HSR' | 'ZZZ'
}

const props = withDefaults(defineProps<Props>(), {
  game: 'GI'
})

// Ensure artifacts is always an array
const safeArtifacts = computed(() => {
  if (Array.isArray(props.artifacts)) {
    return props.artifacts
  }
  console.warn('[ArtifactGrid] Received non-array artifacts prop:', props.artifacts)
  return []
})

function getFitScore(artifactId: string): ArtifactFitScore | null {
  return props.fitScores?.[artifactId] || null
}

function getArtifactSetId(set: ArtifactSet): string {
  return set.name.toLowerCase().replace(/\s+/g, '_')
}
</script>

<style scoped>
.artifact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4, 16px);
}

@media (max-width: 768px) {
  .artifact-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-3, 12px);
  }
}
</style>

