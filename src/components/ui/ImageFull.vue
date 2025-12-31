<template>
  <Teleport to="body">
    <transition name="fade">
      <div 
        v-if="show" 
        class="image-popup"
        :style="popupStyle"
      >
        <div class="popup-content">
          <div class="splash-container">
            <img 
              :src="imageSrc" 
              :alt="characterName"
              class="splash-art"
              @error="handleError"
              @load="onImageLoad"
            />
          </div>
          <div class="character-label">{{ characterName }}</div>
        </div>
        <div class="popup-arrow"></div>
      </div>
    </transition>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue'
import { getImageUrlWithWebp } from '../../utils/common'

export default defineComponent({
  props: {
    show: {
      type: Boolean,
      default: false
    },
    characterName: {
      type: String,
      required: true
    },
    characterSplashUrl: {
      type: String,
      default: ''
    },
    position: {
      type: Object as () => { x: number; y: number },
      default: () => ({ x: 0, y: 0 })
    }
  },
  emits: ['close'],
  setup(props) {
    const imageSrc = computed(() => {
      // Use provided splash URL if available
      if (props.characterSplashUrl) {
        return props.characterSplashUrl
      }
      
      // Fallback: construct path from name
      const cleanName = props.characterName.replace(/\s*\d+★.*$/i, '').replace(/\s*\(.*?\)\s*/g, '').trim()
      const sanitizedName = cleanName.toLowerCase().replace(/\s+/g, '_')
      // Note: full character images path - may need to be updated based on actual structure
      const basePath = `/images/gi/characters/full/${sanitizedName}`
      // Use WebP with PNG fallback
      return getImageUrlWithWebp(basePath)
    })

    const adjustedPosition = ref({ x: 0, y: 0 })

    const calculateOptimalPosition = () => {
      // Popup dimensions (including padding and borders)
      const popupWidth = window.innerWidth <= 768 ? 340 : 820
      const popupHeight = window.innerWidth <= 768 ? 220 : 480 // Approximate height
      const margin = 20 // Minimum margin from viewport edges
      const arrowOffset = 15 // Offset to account for arrow on left side

      let x = props.position.x
      let y = props.position.y

      // Get viewport dimensions
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Adjust horizontal position
      // Default: show to the right of the trigger point
      x = x + arrowOffset

      // Check if popup would overflow right edge
      if (x + popupWidth + margin > viewportWidth) {
        // Try to position to the left of trigger point
        x = props.position.x - popupWidth - arrowOffset
        
        // If still overflow left edge, center it
        if (x < margin) {
          x = Math.max(margin, (viewportWidth - popupWidth) / 2)
        }
      }

      // Ensure minimum left margin
      x = Math.max(margin, x)

      // Adjust vertical position
      // Try to center vertically around trigger point
      y = props.position.y - (popupHeight / 2)

      // Check if popup would overflow top edge
      if (y < margin) {
        y = margin
      }

      // Check if popup would overflow bottom edge
      if (y + popupHeight + margin > viewportHeight) {
        y = viewportHeight - popupHeight - margin
      }

      // Ensure minimum top margin
      y = Math.max(margin, y)

      adjustedPosition.value = { x, y }
    }

    const popupStyle = computed(() => {
      return {
        left: `${adjustedPosition.value.x}px`,
        top: `${adjustedPosition.value.y}px`
      }
    })

    // Recalculate position when show state or position changes
    watch([() => props.show, () => props.position], () => {
      if (props.show) {
        calculateOptimalPosition()
      }
    }, { immediate: true })

    // Recalculate on window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        if (props.show) {
          calculateOptimalPosition()
        }
      })
    }

    const handleError = (event: Event) => {
      const img = event.target as HTMLImageElement
      const currentSrc = img.src
      
      // Prevent infinite loop
      if (img.dataset.fallbackAttempted === 'true') {
        img.style.display = 'none'
        console.error('Failed to load image after fallback:', currentSrc)
        return
      }
      
      // Try PNG if WebP failed
      if (currentSrc.endsWith('.webp')) {
        const pngSrc = currentSrc.replace('.webp', '.png')
        img.dataset.fallbackAttempted = 'png'
        img.src = pngSrc
        return
      }
      
      // If PNG also failed, hide image
      img.dataset.fallbackAttempted = 'true'
      img.style.display = 'none'
      console.error('Failed to load image:', currentSrc)
    }

    const onImageLoad = () => {
      console.log('Image loaded successfully:', imageSrc.value)
    }

    return { imageSrc, popupStyle, handleError, onImageLoad }
  }
})
</script>

<style scoped src="../../assets/styles/components/ImageFull.css"></style>


