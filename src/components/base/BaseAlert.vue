<template>
  <v-alert
    :class="['base-alert', customClass]"
    :type="type"
    :variant="variant"
    :density="density"
    :closable="closable"
    v-bind="$attrs"
    @click:close="$emit('close')"
  >
    <slot />
  </v-alert>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseAlert',
  inheritAttrs: false,
  emits: ['close'],
  props: {
    type: {
      type: String as () => 'warning' | 'error' | 'success' | 'info' | undefined,
      default: 'info' as const,
      validator: (value: string) => ['success', 'info', 'warning', 'error'].includes(value)
    },
    variant: {
      type: String as () => 'text' | 'flat' | 'elevated' | 'outlined' | 'plain' | 'tonal' | undefined,
      default: 'tonal' as const
    },
    density: {
      type: String as () => 'default' | 'comfortable' | 'compact' | undefined,
      default: 'default' as const
    },
    closable: {
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
.base-alert {
  border-radius: var(--radius-lg, 12px);
  backdrop-filter: blur(var(--glass-blur-sm, 8px));
}
</style>
