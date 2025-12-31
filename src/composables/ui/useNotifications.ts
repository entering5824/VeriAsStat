import { ref } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

// Global notification state
export const notifications = ref<Notification[]>([])

export function addNotification(type: Notification['type'], message: string, duration = 3000) {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  notifications.value.push({ id, type, message, duration })
  
  // Auto remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id)
    }, duration)
  }
}

export function removeNotification(id: string) {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

export function useNotifications() {
  return {
    success: (message: string) => addNotification('success', message),
    error: (message: string) => addNotification('error', message),
    warning: (message: string) => addNotification('warning', message),
    info: (message: string) => addNotification('info', message),
    notifications,
    addNotification,
    removeNotification
  }
}

