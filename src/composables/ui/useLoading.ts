import { ref } from 'vue'

// Global loading state
const isLoading = ref(true)

export function useLoading() {
  const showLoading = () => {
    isLoading.value = true
  }

  const hideLoading = () => {
    isLoading.value = false
  }

  return {
    isLoading,
    showLoading,
    hideLoading
  }
}

