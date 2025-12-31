<template>
  <v-card variant="tonal" class="pa-4">
    <div class="text-subtitle-1 mb-3">Base Stats (Internal)</div>
    <v-row>
      <v-col cols="12" sm="4">
        <v-text-field v-model.number="form.base_hp" label="Base HP" type="number" min="0" />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model.number="form.base_atk" label="Base ATK" type="number" min="0" />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model.number="form.base_def" label="Base DEF" type="number" min="0" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="4">
        <v-text-field v-model.number="form.base_speed" label="Base Speed" type="number" min="0" />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model.number="form.base_critRate"
          label="Base Crit Rate (%)"
          type="number"
          min="0"
          max="100"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model.number="form.base_critDmg" label="Base Crit DMG (%)" type="number" min="0" />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model.number="form.base_er"
          label="Base Energy Recharge (%)"
          type="number"
          min="0"
        />
      </v-col>
    </v-row>
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'BaseStatsCard',
  props: {
    modelValue: {
      type: Object as () => Record<string, any>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const form = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    return { form }
  }
})
</script>
