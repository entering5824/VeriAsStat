<template>
  <v-dialog
    :model-value="modelValue"
    :max-width="maxWidth"
    :persistent="persistent"
    :scrollable="scrollable"
    v-bind="$attrs"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card class="base-modal">
      <v-card-title v-if="title || $slots.title" class="base-modal-header">
        <slot name="title">
          <span v-if="title">{{ title }}</span>
        </slot>
        <v-spacer />
        <v-btn
          icon
          variant="text"
          size="small"
          @click="$emit('update:modelValue', false)"
          aria-label="Close dialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-divider v-if="title || $slots.title" />
      
      <v-card-text class="base-modal-content">
        <slot />
      </v-card-text>
      
      <v-card-actions v-if="$slots.actions" class="base-modal-actions">
        <slot name="actions" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseModal',
  inheritAttrs: false,
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    maxWidth: {
      type: [String, Number],
      default: 600
    },
    persistent: {
      type: Boolean,
      default: false
    },
    scrollable: {
      type: Boolean,
      default: true
    }
  }
})
</script>

<style scoped>
.base-modal {
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.1));
  border-radius: var(--glass-radius, 16px);
  backdrop-filter: blur(var(--glass-blur, 12px));
  box-shadow: var(--glass-shadow, 0 4px 24px rgba(0, 0, 0, 0.6));
}

.base-modal-header {
  padding: var(--card-padding, 24px);
  font-weight: var(--font-semibold, 600);
}

.base-modal-content {
  padding: var(--card-padding, 24px);
}

.base-modal-actions {
  padding: var(--space-4, 16px) var(--card-padding, 24px);
  gap: var(--space-2, 8px);
}
</style>
