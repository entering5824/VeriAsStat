<template>
  <div class="game-page page-with-orbs">
    <div v-if="!gameConfig" class="error-state">
      <h2>Game not found</h2>
      <p>Invalid game route</p>
      <RouterLink to="/">Go to Home</RouterLink>
    </div>

    <div v-else class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="game-info">
          <img :src="gameConfig.icon" :alt="gameConfig.name" class="game-icon" />
          <div>
            <h1 class="page-title">{{ gameConfig.name }}</h1>
            <p class="page-subtitle">{{ gameConfig.subtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <PageNavigation :game="gameCode" />

      <!-- Versions Content -->
      <div class="content-section">
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <span>Loading versions...</span>
        </div>
        <div v-else-if="versions.length === 0" class="empty-state">
          <p>No versions available</p>
        </div>
        <div v-else class="versions-grid">
          <VersionCard
            v-for="version in sortedVersions"
            :key="version._id || version.id || version.version"
            :version="version"
            :color="gameConfig.color"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useGamePage } from '../../composables'
import VersionCard from '../../components/version/VersionCard.vue'
import PageNavigation from '../../components/common/PageNavigation.vue'

const {
  loading,
  gameCode,
  gameConfig,
  versions,
  sortedVersions
} = useGamePage()
</script>

<style scoped>
.game-page {
  position: relative;
  width: 100%;
  max-width: 100%;
  background: var(--page-radial-bg);
  min-height: 100vh;
  overflow: hidden;
}

/* Use standardized page-with-orbs class for background */
.game-page::before,
.game-page::after {
  display: none;
}

.game-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.game-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  object-fit: cover;
}

.versions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .versions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .versions-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>

