<template>
  <picture>
    <source :srcset="webpSrc" type="image/webp" />
    <img :src="fallbackSrc" :alt="alt" :class="imgClass" @error="handleError" @load="handleLoad" />
  </picture>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getImageUrlWithWebp } from '../../utils/common'

interface Props {
  src: string
  alt?: string
  imgClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  imgClass: ''
})

const emit = defineEmits<{
  error: [event: Event]
  load: [event: Event]
}>()

// Get WebP path (preferred)
const webpSrc = computed(() => getImageUrlWithWebp(props.src))

// Get PNG fallback path
const fallbackSrc = computed(() => {
  // If src already has extension, replace with .png
  if (/\.(png|jpg|jpeg|webp)$/i.test(props.src)) {
    return props.src.replace(/\.(png|jpg|jpeg|webp)$/i, '.png')
  }
  // Otherwise add .png
  return `${props.src}.png`
})

const handleError = (event: Event) => {
  emit('error', event)
}

const handleLoad = (event: Event) => {
  emit('load', event)
}
</script>

