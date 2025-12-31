<template>
  <header class="floating-header">
    <div class="header-container">
      <div 
        class="liquid-glass-bar"
        :class="{ 'collapsed': isCollapsed }"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-wrapper">
            <img src="/genshin-impact.svg" alt="App Logo" class="logo" />
          </div>
          <h1 class="app-title" :class="{ 'hidden': isCollapsed }">VeriAsStat</h1>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="nav-items desktop-nav" :class="{ 'hidden': isCollapsed }" @mousedown="handleMouseEnter" @focusin="handleMouseEnter">
          <RouterLink class="nav-item" to="/" aria-label="Home">
            <span class="nav-text">Home</span>
          </RouterLink>
          <RouterLink class="nav-item" to="/gi" aria-label="Genshin Impact">
            <span class="nav-text">GI</span>
          </RouterLink>
          <RouterLink class="nav-item" to="/hsr" aria-label="Honkai: Star Rail">
            <span class="nav-text">HSR</span>
          </RouterLink>
          <RouterLink class="nav-item" to="/zzz" aria-label="Zenless Zone Zero">
            <span class="nav-text">ZZZ</span>
          </RouterLink>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          class="mobile-menu-button"
          @click="toggleMobileMenu"
          :aria-expanded="mobileMenuOpen"
          aria-label="Toggle navigation menu"
          aria-controls="mobile-nav"
        >
          <v-icon>{{ mobileMenuOpen ? 'mdi-close' : 'mdi-menu' }}</v-icon>
        </button>
      </div>

      <!-- Mobile Navigation Menu -->
      <transition name="mobile-menu">
        <nav
          v-show="mobileMenuOpen"
          id="mobile-nav"
          class="mobile-nav"
          role="navigation"
          aria-label="Mobile navigation"
          @mousedown="handleMouseEnter"
          @focusin="handleMouseEnter"
        >
          <RouterLink
            class="mobile-nav-item"
            to="/"
            @click="closeMobileMenu"
            aria-label="Home"
          >
            Home
          </RouterLink>
          <RouterLink
            class="mobile-nav-item"
            to="/gi"
            @click="closeMobileMenu"
            aria-label="Genshin Impact"
          >
            GI
          </RouterLink>
          <RouterLink
            class="mobile-nav-item"
            to="/hsr"
            @click="closeMobileMenu"
            aria-label="Honkai: Star Rail"
          >
            HSR
          </RouterLink>
          <RouterLink
            class="mobile-nav-item"
            to="/zzz"
            @click="closeMobileMenu"
            aria-label="Zenless Zone Zero"
          >
            ZZZ
          </RouterLink>
        </nav>
      </transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const mobileMenuOpen = ref(false)
const isCollapsed = ref(false)
let collapseTimer: ReturnType<typeof setTimeout> | null = null

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

// Ensure mobile menu closes after navigation completes (avoid removing menu before RouterLink click processed)
watch(() => router.currentRoute.value.fullPath, () => {
  mobileMenuOpen.value = false
})

// Auto-collapse after 2 seconds
const startCollapseTimer = () => {
  if (collapseTimer) {
    clearTimeout(collapseTimer)
  }
  collapseTimer = setTimeout(() => {
    isCollapsed.value = true
  }, 2000)
}

// Handle mouse enter - expand header
const handleMouseEnter = () => {
  if (collapseTimer) {
    clearTimeout(collapseTimer)
    collapseTimer = null
  }
  isCollapsed.value = false
}

// Handle mouse leave - restart collapse timer
const handleMouseLeave = () => {
  startCollapseTimer()
}

// Close menu on outside click
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (mobileMenuOpen.value && !target.closest('.header-container')) {
    closeMobileMenu()
  }
}

// Close menu on escape key
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && mobileMenuOpen.value) {
    closeMobileMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
  startCollapseTimer()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  if (collapseTimer) {
    clearTimeout(collapseTimer)
  }
})
</script>

<style scoped src="../../assets/styles/components/HeaderFloating.css"></style>


