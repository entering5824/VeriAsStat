<!-- 
  Component: Character Detail Skeleton
  Skeleton loader for CharacterDetail page
-->
<template>
  <div class="skeleton-detail">
    <!-- Hero Section Skeleton -->
    <div class="skeleton-hero">
      <div class="skeleton-hero-background">
        <BaseSkeleton variant="rectangular" :height="300" />
      </div>
      <div class="skeleton-hero-content">
        <div class="skeleton-hero-info">
          <BaseSkeleton variant="text" :width="200" :height="32" class="skeleton-title" />
          <div class="skeleton-badges">
            <BaseSkeleton variant="rectangular" :width="60" :height="24" />
            <BaseSkeleton variant="rectangular" :width="80" :height="24" />
            <BaseSkeleton variant="rectangular" :width="70" :height="24" />
          </div>
        </div>
        <div class="skeleton-hero-image">
          <BaseSkeleton variant="circular" :width="120" :height="120" />
        </div>
      </div>
    </div>

    <!-- Main Content Skeleton -->
    <div class="skeleton-main-content">
      <!-- Basic Info Card Skeleton -->
      <div class="skeleton-info-card">
        <BaseSkeleton variant="text" :width="180" :height="24" class="skeleton-card-title" />
        <div class="skeleton-info-grid">
          <BaseSkeleton v-for="i in 8" :key="i" variant="text" :width="'100%'" :height="20" />
        </div>
      </div>

      <!-- Stats Section Skeleton -->
      <div class="skeleton-stats-section">
        <BaseSkeleton variant="text" :width="100" :height="24" class="skeleton-card-title" />
        <div class="skeleton-stats-grid">
          <!-- Base Stats Card -->
          <div class="skeleton-stats-card">
            <BaseSkeleton variant="text" :width="120" :height="20" class="skeleton-subtitle" />
            <div class="skeleton-stats-table">
              <BaseSkeleton v-for="i in 5" :key="i" variant="text" :width="'100%'" :height="18" />
            </div>
          </div>
          <!-- Graduation Stats Card -->
          <div class="skeleton-stats-card">
            <BaseSkeleton variant="text" :width="150" :height="20" class="skeleton-subtitle" />
            <div class="skeleton-stats-table">
              <BaseSkeleton v-for="i in 5" :key="i" variant="text" :width="'100%'" :height="18" />
            </div>
          </div>
        </div>
        <!-- Sub Stats Card -->
        <div class="skeleton-stats-card">
          <BaseSkeleton variant="text" :width="100" :height="20" class="skeleton-subtitle" />
          <div class="skeleton-stats-table">
            <BaseSkeleton v-for="i in 4" :key="i" variant="text" :width="'100%'" :height="18" />
          </div>
        </div>
      </div>

      <!-- Build Guides Section Skeleton -->
      <div class="skeleton-build-guides">
        <BaseSkeleton variant="text" :width="140" :height="24" class="skeleton-card-title" />
        <div class="skeleton-tabs">
          <BaseSkeleton variant="rectangular" :width="120" :height="36" />
          <BaseSkeleton variant="rectangular" :width="120" :height="36" />
          <BaseSkeleton variant="rectangular" :width="120" :height="36" />
        </div>
        <div class="skeleton-build-content">
          <BaseSkeleton variant="rectangular" :width="'100%'" :height="200" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseSkeleton from '../base/BaseSkeleton.vue'

export default defineComponent({
  name: 'SkeletonDetail',
  components: {
    BaseSkeleton
  }
})
</script>

<style scoped>
.skeleton-detail {
  width: 100%;
  max-width: var(--container-max-width, 1200px);
  margin: 0 auto;
  padding: var(--space-5, 24px);
}

/* Hero Section */
.skeleton-hero {
  position: relative;
  border-radius: var(--glass-radius, 1rem);
  overflow: hidden;
  margin-bottom: var(--space-8, 32px);
  min-height: 300px;
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(var(--glass-blur, 12px));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
}

.skeleton-hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.3;
}

.skeleton-hero-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6, 24px);
  min-height: 300px;
  z-index: 1;
}

.skeleton-hero-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
}

.skeleton-title {
  margin-bottom: var(--space-2, 8px);
}

.skeleton-badges {
  display: flex;
  gap: var(--space-2, 8px);
  flex-wrap: wrap;
}

.skeleton-hero-image {
  margin-left: var(--space-4, 16px);
}

/* Main Content */
.skeleton-main-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6, 24px);
}

.skeleton-info-card,
.skeleton-stats-section,
.skeleton-build-guides {
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(var(--glass-blur, 12px));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: var(--glass-radius, 1rem);
  padding: var(--space-5, 20px);
}

.skeleton-card-title {
  margin-bottom: var(--space-4, 16px);
}

.skeleton-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3, 12px);
}

/* Stats Section */
.skeleton-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4, 16px);
  margin-bottom: var(--space-4, 16px);
}

.skeleton-stats-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-4, 16px);
}

.skeleton-subtitle {
  margin-bottom: var(--space-3, 12px);
}

.skeleton-stats-table {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}

/* Build Guides */
.skeleton-tabs {
  display: flex;
  gap: var(--space-2, 8px);
  margin-bottom: var(--space-4, 16px);
}

.skeleton-build-content {
  margin-top: var(--space-4, 16px);
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .skeleton-hero-image {
    margin-left: 0;
    margin-top: var(--space-4, 16px);
  }

  .skeleton-stats-grid {
    grid-template-columns: 1fr;
  }

  .skeleton-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

