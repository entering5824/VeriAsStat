<!--
  Component: ConflictResolutionDialog
  Dialog for resolving 409 conflict errors
-->
<template>
  <div v-if="modelValue" class="dialog-overlay" @click.self="handleCancel">
    <div class="dialog-content">
      <div class="dialog-header">
        <h2>Conflict Detected</h2>
        <button class="close-button" @click="handleCancel" aria-label="Close">×</button>
      </div>

      <div class="dialog-body">
        <p class="conflict-message">
          The data was modified by another process. Please choose how to resolve the conflict.
        </p>

        <!-- Diff Display -->
        <div v-if="Object.keys(diff).length > 0" class="diff-section">
          <h3>Changes:</h3>
          <div class="diff-list">
            <div
              v-for="(change, key) in diff"
              :key="key"
              class="diff-item"
            >
              <div class="diff-key">{{ formatKey(key) }}</div>
              <div class="diff-values">
                <div class="diff-value server">
                  <span class="diff-label">Server:</span>
                  <span class="diff-content">{{ formatValue(change.server) }}</span>
                </div>
                <div class="diff-value client">
                  <span class="diff-label">Your changes:</span>
                  <span class="diff-content">{{ formatValue(change.client) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Resolution Options -->
        <div class="resolution-options">
          <button
            class="resolution-button reload"
            @click="handleResolve('reload')"
          >
            <span class="button-icon">↻</span>
            <div class="button-content">
              <div class="button-title">Reload & Retry</div>
              <div class="button-description">Discard your changes and use server version</div>
            </div>
          </button>

          <button
            class="resolution-button merge"
            @click="handleResolve('merge')"
          >
            <span class="button-icon">🔀</span>
            <div class="button-content">
              <div class="button-title">Merge Changes</div>
              <div class="button-description">Combine server version with your changes</div>
            </div>
          </button>

          <button
            class="resolution-button overwrite"
            @click="handleResolve('overwrite')"
          >
            <span class="button-icon">⚠️</span>
            <div class="button-content">
              <div class="button-title">Overwrite Server</div>
              <div class="button-description">Use your version (may lose server changes)</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

interface Props {
  modelValue: boolean
  diff: Record<string, { server: any; client: any }>
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'resolve': [action: 'reload' | 'merge' | 'overwrite']
  'cancel': []
}>()

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim()
}

function formatValue(value: any): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

function handleResolve(action: 'reload' | 'merge' | 'overwrite') {
  emit('resolve', action)
  emit('update:modelValue', false)
}

function handleCancel() {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog-content {
  background: var(--color-bg-secondary, #14141f);
  border-radius: var(--radius-lg, 12px);
  width: 90%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.12));
  box-shadow: var(--glass-shadow, 0 8px 32px rgba(0, 0, 0, 0.3));
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4, 16px);
  border-bottom: 1px solid var(--glass-border, rgba(255, 255, 255, 0.12));
}

.dialog-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--color-text-primary, #ffffff);
}

.close-button {
  background: transparent;
  border: none;
  font-size: 2rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.9));
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-button:hover {
  color: var(--color-text-primary, #ffffff);
}

.dialog-body {
  padding: var(--space-4, 16px);
}

.conflict-message {
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.9));
  margin-bottom: var(--space-4, 16px);
  padding: var(--space-3, 12px);
  background: rgba(255, 193, 7, 0.1);
  border: 1px solid rgba(255, 193, 7, 0.3);
  border-radius: var(--radius-md, 8px);
}

.diff-section {
  margin-bottom: var(--space-6, 24px);
}

.diff-section h3 {
  margin: 0 0 var(--space-3, 12px) 0;
  font-size: 1.1rem;
  color: var(--color-text-primary, #ffffff);
}

.diff-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.diff-item {
  padding: var(--space-3, 12px);
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius-md, 8px);
}

.diff-key {
  font-weight: 600;
  margin-bottom: var(--space-2, 8px);
  color: var(--color-text-primary, #ffffff);
}

.diff-values {
  display: flex;
  flex-direction: column;
  gap: var(--space-2, 8px);
}

.diff-value {
  padding: var(--space-2, 8px);
  border-radius: var(--radius-sm, 4px);
  font-size: 0.875rem;
}

.diff-value.server {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.diff-value.client {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.diff-label {
  font-weight: 600;
  display: block;
  margin-bottom: var(--space-1, 4px);
}

.diff-content {
  display: block;
  word-break: break-word;
  font-family: monospace;
  white-space: pre-wrap;
}

.resolution-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-3, 12px);
}

.resolution-button {
  display: flex;
  align-items: center;
  gap: var(--space-3, 12px);
  padding: var(--space-4, 16px);
  border: 2px solid var(--glass-border, rgba(255, 255, 255, 0.12));
  border-radius: var(--radius-md, 8px);
  background: var(--glass-bg, rgba(255, 255, 255, 0.05));
  color: var(--color-text-primary, #ffffff);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.resolution-button:hover {
  background: var(--glass-bg-hover, rgba(255, 255, 255, 0.1));
  border-color: var(--color-primary, #6366f1);
}

.resolution-button.reload {
  border-color: rgba(33, 150, 243, 0.5);
}

.resolution-button.reload:hover {
  border-color: #2196f3;
  background: rgba(33, 150, 243, 0.1);
}

.resolution-button.merge {
  border-color: rgba(76, 175, 80, 0.5);
}

.resolution-button.merge:hover {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.1);
}

.resolution-button.overwrite {
  border-color: rgba(244, 67, 54, 0.5);
}

.resolution-button.overwrite:hover {
  border-color: #f44336;
  background: rgba(244, 67, 54, 0.1);
}

.button-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.button-content {
  flex: 1;
}

.button-title {
  font-weight: 600;
  margin-bottom: var(--space-1, 4px);
}

.button-description {
  font-size: 0.875rem;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
}
</style>

