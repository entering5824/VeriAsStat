<template>
  <transition name="fade">
    <div v-if="isLoading" class="loading-overlay" role="status" aria-live="polite" aria-label="Loading">
      <div class="loading-container">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          width="4"
          class="loading-spinner"
        />
        <p class="loading-text">Đang tải...</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useLoading } from '../../composables/useLoading'

const { isLoading } = useLoading()
</script>

<style scoped src="../../assets/styles/components/LoadingOverlay.css"></style>


