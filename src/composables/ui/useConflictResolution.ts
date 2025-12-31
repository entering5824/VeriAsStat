import { ref } from 'vue'

/**
 * Composable for handling conflict resolution in version management
 * Used when ENABLE_CRUD is true
 */
export function useConflictResolution() {
  const diff = ref<any>(null)
  const hasConflict = ref(false)

  const handleConflict = (conflictData: any) => {
    diff.value = conflictData
    hasConflict.value = true
  }

  const resolveConflict = (resolution: any) => {
    // Handle conflict resolution
    diff.value = null
    hasConflict.value = false
    return resolution
  }

  const clearConflict = () => {
    diff.value = null
    hasConflict.value = false
  }

  return {
    diff,
    hasConflict,
    handleConflict,
    resolveConflict,
    clearConflict
  }
}
