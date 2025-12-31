<template>
  <div
    :class="['base-skeleton', `skeleton-${variant}`, customClass]"
    :style="skeletonStyle"
  />
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'BaseSkeleton',
  props: {
    variant: {
      type: String,
      default: 'text', // text, circular, rectangular
      validator: (value: string) => ['text', 'circular', 'rectangular'].includes(value)
    },
    width: {
      type: [String, Number],
      default: '100%'
    },
    height: {
      type: [String, Number],
      default: undefined
    },
    customClass: {
      type: String,
      default: ''
    }
  },
  setup(props) {
    const skeletonStyle = computed(() => {
      const style: Record<string, string> = {}
      
      if (props.width) {
        style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
      }
      
      if (props.height) {
        style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
      } else if (props.variant === 'text') {
        style.height = '1em'
      } else if (props.variant === 'circular') {
        style.height = style.width || '40px'
        style.borderRadius = '50%'
      }
      
      return style
    })
    
    return {
      skeletonStyle
    }
  }
})
</script>

<style scoped>
.base-skeleton {
  background: rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-md, 8px);
  /* Minimal pulse animation */
  animation: skeleton-pulse 2s ease-in-out infinite;
}

.skeleton-text {
  border-radius: var(--radius-sm, 4px);
}

.skeleton-circular {
  border-radius: 50%;
}

.skeleton-rectangular {
  border-radius: var(--radius-md, 8px);
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
