<template>
  <div :class="['skeleton-loader', `skeleton-${variant}`, customClass]">
    <BaseSkeleton
      v-for="i in count"
      :key="i"
      :variant="itemVariant"
      :width="width"
      :height="height"
      :custom-class="itemClass"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BaseSkeleton from '../base/BaseSkeleton.vue'

export default defineComponent({
  name: 'SkeletonLoader',
  components: {
    BaseSkeleton
  },
  props: {
    variant: {
      type: String,
      default: 'grid', // grid, list, card
      validator: (value: string) => ['grid', 'list', 'card'].includes(value)
    },
    count: {
      type: Number,
      default: 6
    },
    itemVariant: {
      type: String,
      default: 'rectangular'
    },
    width: {
      type: [String, Number],
      default: undefined
    },
    height: {
      type: [String, Number],
      default: undefined
    },
    itemClass: {
      type: String,
      default: ''
    },
    customClass: {
      type: String,
      default: ''
    }
  }
})
</script>

<style scoped>
.skeleton-loader {
  display: contents;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--grid-gap, 16px);
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4, 16px);
}

@media (max-width: 768px) {
  .skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--grid-gap-sm, 12px);
  }
}

@media (max-width: 480px) {
  .skeleton-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: var(--grid-gap-sm, 8px);
  }
}
</style>
