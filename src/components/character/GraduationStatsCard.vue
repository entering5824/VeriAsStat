<template>
  <v-card variant="tonal" class="pa-4">
    <div class="d-flex align-center justify-space-between mb-3">
      <div class="text-subtitle-1">Graduation Stats (Guide / Target)</div>
      <v-btn size="small" variant="tonal" color="primary" @click="addRow">
        <v-icon start>mdi-plus</v-icon>
        Thêm stat
      </v-btn>
    </div>
    <v-alert type="info" variant="tonal" density="compact" class="mb-3">
      Chọn stat, ưu tiên (priority) và ngưỡng (optional). Không nhập trực tiếp số ở cấp character; dùng guide/target.
    </v-alert>

    <v-row v-for="(row, index) in rows" :key="index" class="mb-2">
      <v-col cols="12" md="4">
        <v-autocomplete
          v-model="row.stat"
          :items="statOptions"
          label="Stat"
          clearable
          hide-details="auto"
          density="comfortable"
          :menu-props="{ maxHeight: 300 }"
          @update:model-value="onChange"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model.number="row.priority"
          label="Priority"
          type="number"
          min="1"
          hide-details="auto"
          density="comfortable"
          @blur="normalizePriority(index)"
          @update:model-value="onChange"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="row.threshold"
          label="Threshold (optional)"
          placeholder="e.g. 180 ER"
          hide-details="auto"
          density="comfortable"
          @update:model-value="onChange"
        />
      </v-col>
      <v-col cols="12" md="2" class="d-flex align-center gap-2">
        <v-btn icon size="small" variant="tonal" @click="moveUp(index)" :disabled="index === 0">
          <v-icon>mdi-arrow-up</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="tonal" @click="moveDown(index)" :disabled="index === rows.length - 1">
          <v-icon>mdi-arrow-down</v-icon>
        </v-btn>
        <v-btn icon size="small" variant="tonal" color="error" @click="removeRow(index)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <div v-if="rows.length === 0" class="text-medium-emphasis">
      Chưa có graduation stat nào. Thêm stat để đặt ưu tiên.
    </div>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

interface GraduationRow {
  stat: string
  priority: number | null
  threshold?: string
}

export default defineComponent({
  name: 'GraduationStatsCard',
  props: {
    modelValue: {
      type: Array as () => GraduationRow[],
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const rows = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const statOptions = [
      'HP', 'ATK', 'DEF', 'Speed', 'Crit Rate', 'Crit DMG', 'Energy Recharge',
      'Elemental Mastery', 'Elemental DMG Bonus', 'Healing Bonus', 'Shield Strength',
      'Effect Hit Rate', 'Effect RES', 'Break Effect', 'Energy Regen', 'Impact', 'Pen Ratio',
      'Skill Power', 'Anomaly Proficiency', 'Anomaly Mastery', 'Anomaly Rate', 'Anomaly DMG'
    ]

    const onChange = () => emit('update:modelValue', [...rows.value])

    const addRow = () => {
      rows.value.push({ stat: '', priority: rows.value.length + 1, threshold: '' })
      onChange()
    }

    const removeRow = (index: number) => {
      rows.value.splice(index, 1)
      onChange()
    }

    const moveUp = (index: number) => {
      if (index === 0) return
      const item = rows.value.splice(index, 1)[0]!
      rows.value.splice(index - 1, 0, item)
      onChange()
    }

    const moveDown = (index: number) => {
      if (index === rows.value.length - 1) return
      const item = rows.value.splice(index, 1)[0]!
      rows.value.splice(index + 1, 0, item)
      onChange()
    }

    const normalizePriority = (index: number) => {
      const val = rows.value[index]!.priority
      if (val && val < 1) {
        rows.value[index]!.priority = 1
      }
      onChange()
    }

    return {
      rows,
      statOptions,
      addRow,
      removeRow,
      moveUp,
      moveDown,
      normalizePriority,
      onChange
    }
  }
})
</script>
