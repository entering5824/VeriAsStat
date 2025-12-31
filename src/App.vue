<template>
  <div class="app-container">
    <!-- Loading Overlay -->
    <LoadingOverlay />
    
    <!-- Header for all pages -->
    <Header />
    
    <main class="main-content">
      <router-view />
    </main>

    <!-- Notification Container -->
    <NotificationContainer />
    <AppFooter/>
  </div>
</template>

<script setup lang="ts">
import Header from './components/ui/Header.vue'

import LoadingOverlay from './components/ui/LoadingOverlay.vue'
import AppFooter from './components/ui/AppFooter.vue'
import NotificationContainer from './components/common/NotificationContainer.vue'
import { useAudio } from './composables/useAudio'
import { onMounted, onUnmounted, watch } from 'vue'
import { useLoading } from './composables/useLoading'
import { useRoute } from 'vue-router'

const isDev = import.meta.env.DEV
const route = useRoute()

// Initialize background audio
useAudio('/song.mp3', { volume: 0.1, loop: false })

// Global preload: hide loading overlay immediately (data will load per page)
const { hideLoading } = useLoading()
// Remove unwanted injected elements
let observer: MutationObserver | null = null

const removeUnwantedElement = () => {
  const unwantedElement = document.getElementById('aqgYr2glrcpdYac')
  if (unwantedElement) {
    unwantedElement.remove()
  }
}

onMounted(() => {
  // Data loading is now handled by individual pages via Flask API
  hideLoading()
  
  // Try to remove immediately
  removeUnwantedElement()
  
  // Also watch for it being added later (MutationObserver)
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const element = node as HTMLElement
          if (element.id === 'aqgYr2glrcpdYac' || element.querySelector?.('#aqgYr2glrcpdYac')) {
            removeUnwantedElement()
          }
        }
      })
    })
  })
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})

onUnmounted(() => {
  // Cleanup observer on unmount
  if (observer) {
    observer.disconnect()
    observer = null
  }
})

// Add/remove home-page class to body based on current route
watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/' || newPath === '/home') {
      document.body.classList.add('home-page')
    } else {
      document.body.classList.remove('home-page')
    }
  },
  { immediate: true }
)
</script>
