<template>
  <v-text-field
    :class="['base-input', customClass]"
    :model-value="modelValue"
    :label="label"
    :rules="rules"
    :variant="variant"
    :density="density"
    :disabled="disabled"
    :required="required"
    :clearable="clearable"
    :hide-details="hideDetails"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'BaseInput',
  inheritAttrs: false,
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: [String, Number],
      default: ''
    },
    label: {
      type: String,
      default: ''
    },
    rules: {
      type: Array as PropType<any[]>,
      default: () => []
    },
    variant: {
      type: String as PropType<'outlined' | 'plain' | 'filled' | 'solo' | 'solo-filled' | 'solo-inverted' | 'underlined' | undefined>,
      default: 'filled' as const
    },
    density: {
      type: String as PropType<'default' | 'comfortable' | 'compact' | undefined>,
      default: 'comfortable' as const
    },
    disabled: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: false
    },
    hideDetails: {
      type: [Boolean, String] as unknown as PropType<boolean | 'auto' | undefined>,
      default: 'auto' as const
    },
    customClass: {
      type: String,
      default: ''
    }
  }
})
</script>

<style scoped>
.base-input :deep(.v-label) {
  font-weight: var(--font-medium, 500) !important;
}

.base-input :deep(.v-field--variant-filled) {
  background: rgba(255, 255, 255, 0.08) !important;
}

.base-input :deep(.v-field--variant-filled .v-field__outline) {
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.base-input :deep(.v-field--variant-filled:focus-within .v-field__outline) {
  border-color: var(--color-primary, #646cff) !important;
}
</style>
