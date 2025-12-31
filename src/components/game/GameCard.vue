<template>
  <v-card
    class="game-card neon-border clickable"
    outlined
    elevation="0"
    @click="$emit('click')"
    :aria-label="`Navigate to ${game.name}`"
    role="button"
    tabindex="0"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div class="game-card__background" :style="{ '--game-accent': game.color }" />
    <div class="game-card__content">
      <div class="game-card__header">
        <div class="game-card__icon">
          <img :src="iconSrc" :alt="game.name" loading="lazy" />
        </div>
        <div class="game-card__titles">
          <p class="game-card__eyebrow">{{ game.subtitle }}</p>
          <h3 class="game-card__title">{{ game.name }}</h3>
        </div>
        <v-icon class="game-card__chevron" icon="mdi-arrow-top-right" />
      </div>

      <div class="game-card__stats">
        <div class="game-card__stat">
          <span class="stat-label">Versions</span>
          <span class="stat-value">{{ versionCount }}</span>
        </div>
        <div class="game-card__stat">
          <span class="stat-label">Builds</span>
          <span class="stat-value">{{ displayBuildCount }}</span>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Game } from '../../config/games'

const props = defineProps<{
  game: Game
  versionCount?: number
  buildCount?: number
}>()

defineEmits<{ click: [] }>()

const iconFallback = '/images/gi_icon.jpeg'
const iconSrc = computed(() => props.game.icon || iconFallback)
const displayBuildCount = computed(() => {
  if (typeof props.buildCount === 'number' && props.buildCount >= 0) {
    return props.buildCount
  }
  return '—'
})
</script>

