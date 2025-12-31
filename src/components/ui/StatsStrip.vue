<template>
  <section class="stats-strip" aria-label="Tổng quan dữ liệu">
    <div class="stats-strip__glow" />
    <article
      v-for="stat in stats"
      :key="stat.label"
      class="stat-card"
      role="status"
      :aria-live="stat.emphasize ? 'assertive' : 'polite'"
      :data-tone="stat.emphasize ? 'warning' : 'neutral'"
    >
      <div class="stat-card__head">
        <span v-if="stat.icon" class="stat-icon">{{ stat.icon }}</span>
        <p class="stat-label">{{ stat.label }}</p>
      </div>
      <div class="stat-value">
        <span>{{ formatValue(stat.value) }}</span>
        <small v-if="stat.meta" class="stat-meta">{{ stat.meta }}</small>
      </div>
      <p v-if="stat.helper" class="stat-helper">{{ stat.helper }}</p>
    </article>
  </section>
</template>

<script setup lang="ts">
type StatItem = {
  label: string
  value: string | number
  meta?: string
  helper?: string
  icon?: string
  emphasize?: boolean
}

defineProps<{
  stats: StatItem[]
}>()

const formatValue = (value: string | number) => {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('vi-VN').format(value)
  }
  return value
}
</script>

