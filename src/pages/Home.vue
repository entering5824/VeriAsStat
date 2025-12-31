<template>
  <div class="home-page">
  <!-- Subtle animated background removed: FloatingParticles disabled -->

  <!-- Hero Carousel -->
  <HeroCarousel />

  <!-- Upcoming Versions Section -->
  <section v-if="upcomingVersions.length > 0" class="upcoming-versions-section">
    <div class="section-header">
      <h2 class="section-title">Upcoming Versions</h2>
      <p class="section-subtitle">Next releases across all games</p>
    </div>
    <div class="upcoming-versions-grid">
      <VersionCard
        v-for="version in upcomingVersions.slice(0, 6)"
        :key="version._id || version.id || version.version"
        :version="version"
        :color="getGameColor(version.game)"
      />
    </div>
  </section>

  </div>
  
</template>

<style scoped>
.upcoming-versions-section {
  padding: var(--section-gap, 2rem) var(--container-padding, 1.5rem);
  max-width: 100rem;
  margin: 2rem auto;
  position: relative;
  z-index: 1;
}

.section-header {
  margin-bottom: var(--space-6);
  text-align: left;
}

.section-title {
  color: var(--color-text-primary);
  font-size: var(--h3, 1.5rem);
  font-weight: var(--font-weight-bold, 700);
  margin: 0 0 var(--space-2) 0;
}

.section-subtitle {
  color: var(--text-muted-rgba, rgba(255, 255, 255, 0.6));
  font-size: var(--font-size-md, 1rem);
  margin: 0;
}

.upcoming-versions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
  margin-top: var(--space-6);
}

@media (min-width: 48rem) {
  .upcoming-versions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }
}

@media (min-width: 64rem) {
  .upcoming-versions-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }
}
</style>

<script setup lang="ts">
import HeroCarousel from '../components/ui/HeroCarousel.vue'
import VersionCard from '../components/version/VersionCard.vue'
import { useHome } from '../composables/useHome'

const {
  getGameColor,
  upcomingVersions
} = useHome()
</script>

 
