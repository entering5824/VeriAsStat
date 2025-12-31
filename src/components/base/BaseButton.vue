<template>
  <v-btn
    :class="['base-button', customClass]"
    :color="color"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot />
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseButton',
  inheritAttrs: false,
  emits: ['click'],
  props: {
    color: {
      type: String,
      default: 'primary'
    },
    variant: {
      type: String as () => 'text' | 'flat' | 'elevated' | 'outlined' | 'plain' | 'tonal' | undefined,
      default: 'flat' as const
    },
    size: {
      type: String,
      default: 'default'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    customClass: {
      type: String,
      default: ''
    }
  }
})
</script>

<style scoped>
.base-button {
  transition: var(--transition-all, all 200ms ease);
  font-weight: var(--font-medium, 500);
}

.base-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 108, 255, 0.4);
}

.base-button:active:not(:disabled) {
  transform: translateY(0);
}
</style>
