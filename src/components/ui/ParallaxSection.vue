<template>
  <div class="parallax-container" ref="containerRef">
    <div class="parallax-layer" :style="parallaxStyle">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  speed?: number
  direction?: 'up' | 'down'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  speed: 0.5,
  direction: 'up',
  disabled: false
})

const containerRef = ref<HTMLElement | null>(null)
const scrollY = ref(0)

const parallaxStyle = computed(() => {
  if (props.disabled) return {}
  
  const offset = scrollY.value * props.speed
  const translateY = props.direction === 'up' ? -offset : offset
  
  return {
    transform: `translateY(${translateY}px)`,
    willChange: 'transform'
  }
})

let rafId: number | null = null

const updateScroll = () => {
  if (!containerRef.value) return

  const rect = containerRef.value.getBoundingClientRect()
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  const elementTop = rect.top + scrollTop
  const windowHeight = window.innerHeight

  // Only calculate when element is in viewport
  if (rect.top < windowHeight && rect.bottom > 0) {
    scrollY.value = scrollTop - elementTop + windowHeight
  }

  rafId = requestAnimationFrame(updateScroll)
}

onMounted(() => {
  if (!props.disabled) {
    rafId = requestAnimationFrame(updateScroll)
  }
})

onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId)
  }
})
</script>

<style scoped src="../../assets/styles/components/ParallaxSection.css"></style>


