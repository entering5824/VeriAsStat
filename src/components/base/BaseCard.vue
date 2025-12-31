<template>
  <v-card
    :class="['base-card', customClass]"
    :elevation="0"
    v-bind="$attrs"
  >
    <slot />
  </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/**
 * BaseCard Component
 * 
 * A reusable card component with glass morphism styling.
 * Provides consistent card appearance across the application.
 * 
 * @component
 * @example
 * <BaseCard custom-class="my-card">
 *   <div>Card content</div>
 * </BaseCard>
 */
export default defineComponent({
  name: 'BaseCard',
  inheritAttrs: false,
  props: {
    /** Additional CSS classes to apply to the card */
    customClass: {
      type: String,
      default: ''
    }
  }
})
</script>

<style scoped>
.base-card {
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: var(--glass-radius, 16px);
  backdrop-filter: blur(var(--glass-blur, 12px));
  box-shadow: var(--glass-shadow, 0 4px 24px rgba(0, 0, 0, 0.6));
  transition: var(--transition-all, all 200ms ease);
  overflow: hidden;
}

.base-card:hover {
  background: var(--glass-bg-hover, rgba(255, 255, 255, 0.08));
  border-color: var(--glass-border-hover, rgba(255, 255, 255, 0.15));
  box-shadow: var(--glass-shadow-hover, 0 8px 32px rgba(0, 0, 0, 0.7));
}
</style>
