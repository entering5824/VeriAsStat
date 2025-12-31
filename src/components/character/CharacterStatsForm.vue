<template>
  <div class="stats-form">
    <BaseStatsCard v-model="localForm.baseStats" />
    <GraduationStatsCard v-model="localForm.graduationStats" class="mt-4" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import BaseStatsCard from './BaseStatsCard.vue'
import GraduationStatsCard from './GraduationStatsCard.vue'

export interface StatsFormValue {
  baseStats: Record<string, any>
  graduationStats: Array<{ stat: string; priority: number | null; threshold?: string }>
}

export default defineComponent({
  name: 'CharacterStatsForm',
  components: { BaseStatsCard, GraduationStatsCard },
  props: {
    modelValue: {
      type: Object as () => StatsFormValue,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const localForm = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    return { localForm }
  }
})
</script>
