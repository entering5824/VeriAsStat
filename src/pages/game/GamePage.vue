<template>
  <div class="game-page">
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
import { useGamePage } from '../../composables/game'
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
  padding: var(--space-6) var(--space-4);
  overflow: hidden;
}

.game-page::before {
  content: '';
  position: fixed;
  top: -20%;
  left: -10%;
  width: 600px;
  height: 600px;
  background: var(--orb-purple);
  border-radius: 50%;
  animation: orbFloat1 20s ease-in-out infinite;
  z-index: 0;
  pointer-events: none;
}

.game-page::after {
  content: '';
  position: fixed;
  bottom: -15%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: var(--orb-cyan);
  border-radius: 50%;
  animation: orbFloat2 25s ease-in-out infinite;
  z-index: 0;
  pointer-events: none;
}

.page-container {
  max-width: var(--container-max-width, 100rem);
  margin: 0 auto;
  padding: var(--space-6) var(--space-4);
  position: relative;
  z-index: 1;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
  padding: var(--space-6);
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border-radius: var(--glass-radius, 1rem);
  backdrop-filter: blur(var(--glass-blur, 12px));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  box-shadow: var(--glass-shadow, 0 0.25rem 1.5rem rgba(0, 0, 0, 0.6));
  position: relative;
  z-index: 1;
  transition: var(--transition-all, all 200ms ease);
}

.page-header:hover {
  background: var(--glass-bg-hover, rgba(255, 255, 255, 0.08));
  box-shadow: var(--glass-shadow-hover, 0 0.5rem 2rem rgba(0, 0, 0, 0.7));
}

@media (min-width: 48rem) {
  .page-header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
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

.page-title {
  font-size: var(--text-3xl, 1.875rem);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary);
  margin: 0;
  line-height: var(--leading-tight);
}

.page-subtitle {
  font-size: var(--text-base, 1rem);
  color: var(--color-text-muted);
  margin: 0;
  line-height: var(--leading-normal);
}


.content-section {
  position: relative;
  z-index: 1;
  min-height: 400px;
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

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12, 48px);
  text-align: center;
  color: var(--color-text-muted);
  position: relative;
  z-index: 1;
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border-radius: var(--glass-radius, 1rem);
  backdrop-filter: blur(var(--glass-blur, 12px));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  margin: var(--space-6) 0;
}

.loading-spinner,
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border-primary);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-4);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--color-error);
}
</style>

