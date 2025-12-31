<!--
  Component: Build Guide Modal
  Modal hiển thị build guides cho một character
-->
<template>
  <v-dialog 
    v-model="dialogVisible" 
    max-width="900px"
    scrollable
    @click:outside="close"
  >
    <v-card class="build-guide-modal">
      <v-card-title class="modal-header">
        <div class="header-content">
          <h2>{{ character?.name }}</h2>
          <span class="character-game">{{ character?.game }}</span>
        </div>
        <v-btn 
          icon="mdi-close" 
          variant="text"
          @click="close"
          class="close-btn"
        />
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="modal-body">
        <BuildGuideTabs 
          v-if="character?.buildGuides && character.buildGuides.length > 0"
          :buildGuides="character.buildGuides"
        />
        <div v-else class="no-build-guides">
          <p>Chưa có build guides cho nhân vật này.</p>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="modal-footer">
        <v-spacer></v-spacer>
        <v-btn 
          color="primary" 
          variant="text"
          @click="close"
        >
          Đóng
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Character } from '../../types/character'
import BuildGuideTabs from './BuildGuideTabs.vue'

interface Props {
  modelValue: boolean
  character: Character | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const close = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.build-guide-modal {
  background: rgba(30, 30, 46, 0.95);
  backdrop-filter: blur(10px);
  color: #fff;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #fff;
}

.character-game {
  padding: 4px 12px;
  background: rgba(102, 126, 234, 0.2);
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
}

.close-btn {
  color: rgba(255, 255, 255, 0.7);
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.no-build-guides {
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}

.modal-footer {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.03);
}
</style>

<style>
/* Override Vuetify dialog styles for dark theme */
.build-guide-modal .v-card {
  background: rgba(30, 30, 46, 0.95) !important;
}

.build-guide-modal .v-card-title {
  color: #fff !important;
}

.build-guide-modal .v-card-text {
  color: rgba(255, 255, 255, 0.9) !important;
}

.build-guide-modal .v-divider {
  border-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
