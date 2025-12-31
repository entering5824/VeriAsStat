<template>
  <v-card variant="tonal" class="pa-4 preview-card">
    <div class="text-subtitle-1 mb-3">Preview</div>
    <div class="preview-header">
      <div class="preview-image-wrap">
        <img
          v-if="model.imageUrlIcon"
          :src="model.imageUrlIcon"
          :alt="model.name"
          class="preview-icon"
          loading="lazy"
        />
        <div v-else class="placeholder">No Icon</div>
      </div>
      <div class="preview-meta">
        <div class="preview-title">
          <span class="name">{{ model.name || 'Unnamed Character' }}</span>
          <v-chip size="small" color="primary" variant="tonal">{{ model.game || 'GI' }}</v-chip>
        </div>
        <div class="preview-subtitle">
          <span v-if="model.element">{{ model.element }}</span>
          <span v-if="model.role">• {{ model.role }}</span>
        </div>
      </div>
    </div>

    <v-divider class="my-3" />

    <div class="stats-grid">
      <div class="stat-chip" v-for="stat in baseStatsSummary" :key="stat.label">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value">{{ stat.value }}</div>
      </div>
    </div>

    <div v-if="graduationSummary.length" class="mt-3">
      <div class="text-subtitle-2 mb-2">Graduation Priority</div>
      <div class="stat-chip" v-for="stat in graduationSummary" :key="stat.label">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value">{{ stat.value }}</div>
      </div>
    </div>
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'CharacterPreviewCard',
  props: {
    model: {
      type: Object as () => Record<string, any>,
      required: true
    }
  },
  setup(props) {
    const baseStatsSummary = computed(() => {
      const m = props.model || {}
      const stats = [
        { label: 'HP', value: m.base_hp },
        { label: 'ATK', value: m.base_atk },
        { label: 'DEF', value: m.base_def },
        { label: 'Speed', value: m.base_speed },
        { label: 'Crit Rate', value: m.base_critRate },
        { label: 'Crit DMG', value: m.base_critDmg },
        { label: 'ER', value: m.base_er },
      ].filter(s => s.value !== null && s.value !== undefined && s.value !== '')

      return stats.map(s => ({ ...s, value: s.value ?? '—' }))
    })

    const graduationSummary = computed(() => {
      const list = props.model.graduationStats || []
      return list
        .filter((item: any) => item.stat)
        .map((item: any) => ({
          label: item.stat,
          value: item.priority ? `Priority ${item.priority}${item.threshold ? ` • ${item.threshold}` : ''}` : (item.threshold || '—')
        }))
    })

    return { baseStatsSummary, graduationSummary }
  }
})
</script>

<style scoped>
.preview-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
}
.preview-header {
  display: flex;
  gap: 16px;
  align-items: center;
}
.preview-image-wrap {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.preview-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}
.preview-title {
  display: flex;
  gap: 8px;
  align-items: center;
  font-weight: 700;
}
.name {
  font-size: 18px;
}
.preview-subtitle {
  color: rgba(255, 255, 255, 0.7);
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 8px;
}
.stat-chip {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.stat-label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}
.stat-value {
  color: #fff;
  font-weight: 700;
}
</style>
