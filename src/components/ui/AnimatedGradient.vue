<template>
  <div class="animated-gradient-bg" :class="[variant, { paused: prefersReducedMotion }]">
    <div class="gradient-orb gradient-orb-1" />
    <div class="gradient-orb gradient-orb-2" />
    <div class="gradient-orb gradient-orb-3" />
    <div class="gradient-mesh" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  variant?: 'default' | 'purple' | 'blue' | 'rainbow'
}

withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const prefersReducedMotion = ref(false)

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})
</script>

<style scoped src="../../assets/styles/components/AnimatedGradient.css"></style>


