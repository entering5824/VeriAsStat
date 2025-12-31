<!--
  Component: Build Guide Tabs
  Hiển thị multiple build guides với tabs
-->
<template>
  <div class="build-guide-tabs">
    <div v-if="buildGuides && buildGuides.length > 0" class="tabs-container">
      <!-- Tabs Navigation -->
      <div class="tabs-nav">
        <button
          v-for="(guide, index) in buildGuides"
          :key="index"
          class="tab-button"
          :class="{ active: activeTabIndex === index }"
          @click="activeTabIndex = index"
        >
          {{ guide.title }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <BuildGuideDisplay 
          :buildGuide="activeBuildGuide" 
        />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="no-build-guides">
      <p>Chưa có build guides cho nhân vật này.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { BuildGuide } from '../../types/buildGuide'
import BuildGuideDisplay from './BuildGuideDisplay.vue'

interface Props {
  buildGuides?: BuildGuide[]
}

const props = defineProps<Props>()

const activeTabIndex = ref(0)

const activeBuildGuide = computed(() => {
  if (!props.buildGuides || props.buildGuides.length === 0) return null
  return props.buildGuides[activeTabIndex.value] || null
})
</script>

<style scoped>
.build-guide-tabs {
  width: 100%;
}

.tabs-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Tabs Navigation */
.tabs-nav {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
}

.tab-button {
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
}

.tab-button.active {
  color: #fff;
  border-bottom-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

/* Tab Content */
.tab-content {
  min-height: 200px;
}

/* Empty state */
.no-build-guides {
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}
</style>
