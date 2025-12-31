<template>
  <div class="notification-container">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-wrapper"
      >
        <v-snackbar
          :model-value="true"
          :color="getColor(notification.type)"
          :timeout="notification.duration || 3000"
          location="top right"
          :data-testid="notification.type === 'success' ? 'save-success' : undefined"
          @update:model-value="removeNotification(notification.id)"
        >
          <div class="d-flex align-center">
            <v-icon class="mr-2">{{ getIcon(notification.type) }}</v-icon>
            <span>{{ notification.message }}</span>
          </div>
          <template v-slot:actions>
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              @click="removeNotification(notification.id)"
            />
          </template>
        </v-snackbar>
      </div>
    </transition-group>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { notifications, removeNotification } from '../../composables/ui'

export default defineComponent({
  name: 'NotificationContainer',
  setup() {

    const getColor = (type: string) => {
      switch (type) {
        case 'success': return 'success'
        case 'error': return 'error'
        case 'warning': return 'warning'
        case 'info': return 'info'
        default: return 'info'
      }
    }

    const getIcon = (type: string) => {
      switch (type) {
        case 'success': return 'mdi-check-circle'
        case 'error': return 'mdi-alert-circle'
        case 'warning': return 'mdi-alert'
        case 'info': return 'mdi-information'
        default: return 'mdi-information'
      }
    }

    return {
      notifications,
      removeNotification,
      getColor,
      getIcon
    }
  }
})
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notification-wrapper {
  margin-bottom: 10px;
}

.notification-container :deep(.v-snackbar) {
  pointer-events: auto;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>

