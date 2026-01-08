<!-- 
  Component: Character Item Card
  
  Chức năng: Thẻ nhân vật hiển thị trong grid
  - Icon 25x25px
  - Hover popup với stats
  - Click để edit
-->
<template>
  <div
    ref="wrapperRef"
    class="character-item-wrap"
    :class="{ 'crud-enabled': ENABLE_CRUD }"
    @click="handleClick"
    role="button"
        :aria-label="`Character ${character.name}. ${ENABLE_CRUD ? 'Click to edit' : 'Click to view'}`"
    tabindex="0"
    @keydown.enter="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <!-- Card cố định chiều cao -->
    <div class="character-item-card">
      <!-- Top badges -->
      <div class="card-badges">
        <div class="badges-left">
          <!-- Tier badge -->
          <div v-if="character.tier !== null && character.tier !== undefined" class="tier-badge">
            T{{ Math.round(character.tier) }}
          </div>
          <!-- Rarity stars -->
          <div v-if="character.rarity" class="rarity-badge" :class="`rarity-${character.rarity}`">
            <span class="rarity-stars">{{ '★'.repeat(character.rarity) }}</span>
          </div>
        </div>
        
        <div class="badges-right">
          <!-- Element badge -->
          <div v-if="element" class="element-badge" :class="getElementClass(element)">
            {{ element }}
          </div>
          <!-- Build Guide indicator -->
          <div
            v-if="hasBuildGuides"
            class="build-guide-indicator"
            title="Click to view build guides"
            aria-label="View build guides"
          >
            📋
          </div>
        </div>
      </div>
      
      <!-- Icon larger -->
      <div class="icon-wrapper">
        <img
          v-if="shouldLoadImage"
          :src="iconUrl"
          :alt="`${character.name} icon`"
          class="char-icon"
          @error="handleIconError"
          @load="handleImageLoad"
          ref="iconRef"
        />
        <div v-else class="icon-placeholder"></div>
      </div>
      
      <!-- Character info -->
      <div class="char-info-section">
        <!-- Tên nhân vật -->
        <div class="char-name">{{ character.name }}</div>
      </div>
    </div>

    <!-- Hover popup hiển thị stats -->
    <div class="hover-popup">
      <div class="popup-header">
        <img 
          v-if="splashUrl" 
          :src="splashUrl" 
          class="splash-thumb" 
          :alt="`${character.name} splash`" 
          @error="handleSplashError" 
        />
        <span class="popup-title">{{ character.name }}</span>
      </div>
      <div class="popup-body">
        <!-- Character Info -->
        <div class="char-info" v-if="characterInfo.length > 0">
          <div v-for="info in characterInfo" :key="info.label" class="info-row">
            <span class="info-label">{{ info.label }}:</span>
            <span class="info-value">{{ info.value }}</span>
          </div>
        </div>

        <!-- Stats Table -->
        <table class="stats-table" v-if="hasStats">
          <tbody>
            <tr v-for="row in statRows" :key="row.label">
              <td class="stat-label">{{ row.label }}</td>
              <td class="stat-value">{{ row.value }}</td>
            </tr>
          </tbody>
        </table>

        <!-- Fallback nếu không có stats -->
        <div v-else class="no-stats">
          Chưa có thông tin graduation stats
        </div>

        <!-- Build Guides Indicator -->
        <div v-if="hasBuildGuides" class="build-guides-indicator">
          <span class="build-guides-badge">
            📋 {{ buildGuidesCount }} Build Guide{{ buildGuidesCount > 1 ? 's' : '' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import type { PropType } from 'vue'
import type { Character } from '../../types/character'
import { useCharacterStats } from '../../composables'
import { 
  getCharacterIconUrl, 
  getCharacterSplashUrl, 
  getCharacterImageCandidates,
  placeholderFor,
  type Game
} from '../../utils/character'
import { ENABLE_CRUD } from '../../utils/common'

export default defineComponent({
  name: 'CharacterItem',
  props: {
    character: {
      type: Object as PropType<Character>,
      required: true
    }
  },
  emits: ['create', 'edit', 'viewBuildGuide'],
  setup(props, { emit }) {
    const router = useRouter()
    const iconRef = ref<HTMLImageElement | null>(null)
    const shouldLoadImage = ref(false)
    const wrapperRef = ref<HTMLElement | null>(null)
    
    // Sử dụng composable để xử lý stats
    const { hasStats, statRows } = useCharacterStats(computed(() => props.character))

    // Build Guides
    const hasBuildGuides = computed(() => {
      return props.character.buildGuides && props.character.buildGuides.length > 0
    })

    const buildGuidesCount = computed(() => {
      return props.character.buildGuides?.length || 0
    })

    // Image URLs using unified utils
    const iconUrl = computed(() => getCharacterIconUrl(props.character))
    const splashUrl = computed(() => getCharacterSplashUrl(props.character))
    
    // Get image candidates for fallback
    const game = computed(() => (props.character.game || 'GI').toUpperCase() as Game)
    const iconCandidates = computed(() => {
      const char = props.character as any
      const name = extractCharacterName(char)
      if (!name) return []
      return getCharacterImageCandidates(game.value, 'icon', name)
    })
    const splashCandidates = computed(() => {
      const char = props.character as any
      const name = extractCharacterName(char)
      if (!name) return []
      return getCharacterImageCandidates(game.value, 'splash', name)
    })
    
    // Track current candidate index for fallback
    const iconCandidateIndex = ref(0)
    const splashCandidateIndex = ref(0)
    
    // Helper to extract character name from character object (same as VersionCard)
    function extractCharacterName(char: any): string {
      if (char?.name) {
        // Clean name: remove rarity stars, parentheses, trim (same as VersionCard)
        const cleanName = char.name
          .replace(/\s*\d+★.*$/i, '')  // Remove " 5★" suffix
          .replace(/\s*\(.*?\)\s*/g, '')  // Remove parentheses content
          .trim()
        
        // Normalize for path: lowercase, replace spaces with underscore, remove special chars
        return cleanName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      }
      
      const path = char?.iconPath || char?.splashPath || ''
      if (path) {
        const match = path.match(/\/([^/]+)\.(png|jpg|jpeg|webp)$/i)
        if (match) return match[1]
      }
      return ''
    }
    
    // Get element from character (from element field or tags)
    const element = computed(() => {
      const char = props.character as any
      // First try direct element field
      if (char.element) {
        return char.element
      }
      // Then try to find in tags
      if (char.tags && Array.isArray(char.tags)) {
        const elementTag = char.tags.find((tag: any) => 
          tag.key === 'element' || tag.key === 'Element'
        )
        if (elementTag && elementTag.label) {
          return elementTag.label
        }
      }
      return null
    })
    
    // Helper to get element CSS class
    function getElementClass(elem: string | null): string {
      if (!elem) return ''
      const normalized = elem.toLowerCase().replace(/\s+/g, '-')
      return `element-${normalized}`
    }
    
    // Character info for popup
    const characterInfo = computed(() => {
      const info: Array<{ label: string; value: string | number }> = []
      const char = props.character as any
      
      if (element.value) {
        info.push({ label: 'Element', value: element.value })
      }
      if (char.rarity) {
        info.push({ label: 'Rarity', value: `${char.rarity}★` })
      }
      const weapon = char.weapon_type || char.weaponType
      if (weapon) {
        info.push({ label: 'Weapon', value: weapon })
      }
      if (char.role) {
        const roles = Array.isArray(char.role) ? char.role.join(', ') : char.role
        info.push({ label: 'Role', value: roles })
      }
      if (char.game) {
        info.push({ label: 'Game', value: char.game })
      }
      
      return info
    })
    
    /**
     * Handle icon load error - try candidates in order, then placeholder
     */
    const handleIconError = (event: Event) => {
      const target = event.target as HTMLImageElement
      const candidates = iconCandidates.value
      
      // Try next candidate
      iconCandidateIndex.value++
      if (iconCandidateIndex.value < candidates.length) {
        const nextCandidate = candidates[iconCandidateIndex.value]
        if (nextCandidate) {
          target.src = nextCandidate
          return
        }
      }
      
      // If all candidates failed, try splash as fallback
      const splash = splashUrl.value
      if (splash && target.src !== splash && !splash.includes('placeholder')) {
        target.dataset.fallbackAttempted = 'true'
        target.src = splash
        return
      }
      
      // Final fallback: placeholder
      target.dataset.fallbackAttempted = 'true'
      target.src = placeholderFor(game.value, 'icon')
    }

    /**
     * Handle splash load error - try candidates in order, then hide
     */
    const handleSplashError = (event: Event) => {
      const target = event.target as HTMLImageElement
      const candidates = splashCandidates.value
      
      // Try next candidate
      splashCandidateIndex.value++
      if (splashCandidateIndex.value < candidates.length) {
        const nextCandidate = candidates[splashCandidateIndex.value]
        if (nextCandidate) {
          target.src = nextCandidate
          return
        }
      }
      
      // If all candidates failed, hide image
      target.dataset.fallbackAttempted = 'true'
      target.style.display = 'none'
    }

    /**
     * Handle image load - prevent flickering by ensuring image is ready
     */
    const handleImageLoad = (event: Event) => {
      const target = event.target as HTMLImageElement
      // Mark as loaded to prevent flickering
      target.setAttribute('data-loaded', 'true')
      target.style.opacity = '1'
    }

    /**
     * Handle click - navigate to character detail page
     */
    const handleClick = () => {
      // Navigate to character detail page
      const char = props.character as any
      const characterId = char._id || char.id || char.characterId || ''
      const game = char.game || 'GI'
      
      if (characterId) {
        router.push({ 
          path: `/characters/${characterId}`, 
          query: { game } 
        })
      } else if (hasBuildGuides.value) {
        // Fallback: view build guide if no ID
        emit('viewBuildGuide')
      }
    }

    // Intersection Observer for lazy loading
    let observer: IntersectionObserver | null = null
    
    onMounted(() => {
      // Use Intersection Observer for better lazy loading
      if ('IntersectionObserver' in window) {
        // Use nextTick to ensure DOM is ready
        nextTick(() => {
          if (wrapperRef.value) {
            observer = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    shouldLoadImage.value = true
                    if (observer && wrapperRef.value) {
                      observer.unobserve(wrapperRef.value)
                    }
                  }
                })
              },
              {
                rootMargin: '50px', // Start loading 50px before visible
                threshold: 0.01
              }
            )
            
            // Observe the wrapper element
            observer.observe(wrapperRef.value)
          } else {
            // Fallback if ref not available
            shouldLoadImage.value = true
          }
        })
      } else {
        // Fallback: load immediately if IntersectionObserver not supported
        shouldLoadImage.value = true
      }
    })

    onUnmounted(() => {
      if (observer) {
        if (wrapperRef.value) {
          observer.unobserve(wrapperRef.value)
        }
        observer.disconnect()
      }
    })

    return { 
      ENABLE_CRUD,
      hasStats, 
      statRows,
      iconUrl, 
      splashUrl,
      characterInfo,
      iconRef,
      hasBuildGuides,
      buildGuidesCount,
      handleIconError, 
      handleSplashError,
      handleImageLoad,
      handleClick,
      shouldLoadImage,
      wrapperRef,
      extractCharacterName,
      element,
      getElementClass,
    }
  }
})
</script>

<style scoped src="../../assets/styles/components/CharacterItem.css"></style>
