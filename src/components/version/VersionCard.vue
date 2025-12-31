<template>
  <div class="version-card-wrapper">
    <v-card class="version-card" outlined>
      <div class="version-card__content">
        <header class="version-card__header">
          <div class="version-card__icon">
            <img :src="gameIconSrc" :alt="gameLabel" loading="lazy" />
          </div>
          <div class="version-card__summary">
            <p class="version-card__overline">Patch {{ version.version }}</p>
            <h3 class="version-card__title">
              Version {{ version.version }} – {{ regionLabel }}
            </h3>
            <div class="version-card__status-row">
            </div>
          </div>
          <div class="version-card__header-actions">
            <span class="version-card__status-chip" :class="statusTone">{{ statusLabel }}</span>
            <div v-if="ENABLE_CRUD" class="crud-actions">
              <button class="action-btn edit-btn" @click.stop="handleEdit" title="Edit version">
                ✏️
              </button>
              <button class="action-btn delete-btn" @click.stop="handleDelete" title="Delete version">
                🗑️
              </button>
            </div>
          </div>
        </header>

        <dl class="version-card__info-grid">
          <div class="info-item">
            <dt>Start Date</dt>
            <dd>{{ formattedRelease }}</dd>
          </div>
          <div class="info-item">
            <dt>Status</dt>
            <dd>{{ relativeRelease }}</dd>
          </div>
        </dl>

        <section
          v-if="version.characters_rateup && version.characters_rateup.length > 0"
          class="rateup-section"
        >
          <p class="section-heading">Rate-up Characters</p>
          <div class="rateup-list">
            <router-link
              v-for="char in version.characters_rateup"
              :key="`${char.name}-${characterCacheKey(char.name)}`"
              :to="{ path: '/characters', query: { game: version.game, search: char.name } }"
              class="rateup-item-link"
              @mouseenter="(e) => showSplashArt(char.name, e)"
              @mouseleave="hideSplashArt"
            >
              <div class="rateup-avatar" :class="`rarity-${getCharacterRarity(char.name) || char.rarity?.charAt(0) || '5'}`">
                <img
                  :src="getCharacterIconUrlFromName(char.name)"
                  :alt="char.name"
                  loading="lazy"
                  @error="handleImageError"
                  @load="handleImageLoad"
                />
              </div>
              <span class="rateup-name">{{ char.name }}</span>
            </router-link>
          </div>
        </section>

        <section class="version-card__description" :class="{ 'desc-expanded': showFullDesc }">
          <p class="section-heading">Description</p>
          <div class="desc-content" @click="toggleDesc">
            {{ version.description || 'Chưa có mô tả chi tiết.' }}
          </div>
          <button v-if="isDescLong" class="expand-toggle" @click="toggleDesc">
            {{ showFullDesc ? 'Show less' : 'Show more' }}
          </button>
        </section>
      </div>
    </v-card>

    <ImageFull
      :show="showFullImage"
      :character-name="selectedCharacter"
      :character-splash-url="selectedCharacterSplashUrl"
      :position="popupPosition"
      @close="hideSplashArt"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watchEffect } from 'vue'
import type { PropType } from 'vue'
import ImageFull from '../ui/ImageFull.vue'
import { useGameConfig } from '../../composables/game'
import { ENABLE_CRUD } from '../../utils/common'
import { characterService } from '../../services'
import { getCharacterSplashUrl } from '../../utils/character'
import type { Character } from '../../types/character'

export default defineComponent({
  components: {
    ImageFull
  },
  props: {
    version: { type: Object as PropType<any>, required: true },
    color: { type: String, default: '' }
  },
  emits: ['edit', 'delete'],
  setup(props, { emit }) {
    const showFullImage = ref(false)
    const selectedCharacter = ref('')
    const selectedCharacterSplashUrl = ref('')
    const popupPosition = ref({ x: 0, y: 0 })
    const showFullDesc = ref(false)
    const isDescLong = ref(false)
    
    // Cache for full Character objects (similar to Character page)
    const characterCache = ref<Map<string, Character | null>>(new Map())

    const { getGameIcon, getGameName } = useGameConfig()

    const gameIconSrc = computed(() => getGameIcon(props.version.game || 'GI'))
    const gameLabel = computed(() => getGameName(props.version.game || 'GI'))

    const formattedRelease = computed(() => formatDate(props.version.release_date || props.version.releaseDate))
    const relativeRelease = computed(() => formatRelativeRelease(props.version.release_date || props.version.releaseDate))
    const regionLabel = computed(() => props.version.event_region_main || 'Global')

    const statusLabel = computed(() => (props.version.status || 'TBD').toString().toUpperCase())
    const statusTone = computed(() => {
      const status = (props.version.status || '').toLowerCase()
      if (status.includes('leak')) return 'status-leak'
      if (status.includes('confirm')) return 'status-confirmed'
      if (status.includes('live') || status.includes('release')) return 'status-live'
      return 'status-pending'
    })

    /**
     * Load full Character objects for all rate-up characters (similar to Character page)
     * Load all characters in parallel to avoid blocking
     */
    const loadCharacters = async () => {
      if (!props.version.characters_rateup || props.version.characters_rateup.length === 0) {
        return
      }

      const game = props.version.game || 'GI'
      
      // Load all characters in parallel instead of sequentially
      const loadPromises = props.version.characters_rateup.map(async (char: any) => {
        const cleanName = char.name.replace(/\s*\d+★.*$/i, '').replace(/\s*\(.*?\)\s*/g, '').trim()
        const cacheKey = `${game}_${cleanName}`
        
        // Skip if already loaded (including failed lookups - null means not found)
        if (characterCache.value.has(cacheKey)) {
          return
        }
        
        try {
          // Get full Character object (similar to Character page)
          const character = await characterService.findCharacterByName(cleanName, game)
          characterCache.value.set(cacheKey, character || null)
          
          if (!character) {
            console.warn(`Character not found: ${cleanName} (game: ${game})`)
          }
        } catch (error) {
          console.error(`Error loading character ${cleanName}:`, error)
          // Cache null to prevent retries, but don't block other characters
          characterCache.value.set(cacheKey, null)
        }
      })
      
      // Wait for all characters to load (or fail) in parallel
      await Promise.allSettled(loadPromises)
    }

    /**
     * Get cache key for a character name (for reactive tracking)
     */
    const characterCacheKey = (name: string): string => {
      const cleanName = name.replace(/\s*\d+★.*$/i, '').replace(/\s*\(.*?\)\s*/g, '').trim()
      return `${props.version.game || 'GI'}_${cleanName}`
    }

    /**
     * Get Character object from cache by name
     */
    const getCharacter = (name: string): Character | null => {
      const cacheKey = characterCacheKey(name)
      return characterCache.value.get(cacheKey) || null
    }

    /**
     * Map icon format by game
     * GI and HSR only have .png, ZZZ has .webp
     */
    const GAME_ICON_FORMAT: Record<string, 'png' | 'webp'> = {
      GI: 'png',
      HSR: 'png',
      ZZZ: 'webp'
    }

    /**
     * Get character icon base path (without extension) from name
     * Returns base path that can be used with .webp or .png extension
     */
    const getCharacterIconBasePath = (name: string): string => {
      const cleanName = name.replace(/\s*\d+★.*$/i, '').replace(/\s*\(.*?\)\s*/g, '').trim()
      const character = getCharacter(name)
      
      let basePath: string
      
      if (character && (character as any).iconPath) {
        // Use iconPath from character data (remove extension if present)
        const iconPath = (character as any).iconPath
        basePath = iconPath.replace(/\.(png|jpg|jpeg|webp)$/i, '')
      } else {
        // Fallback: construct path from name and game
        const game = (props.version.game || 'GI').toLowerCase()
        const cleanNameForPath = cleanName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        basePath = `/images/${game}/characters/icon/${cleanNameForPath}`
      }
      
      return basePath
    }

    /**
     * Get character icon URL with format based on game
     * Always returns a valid URL, even if character is not found or still loading
     */
    const getCharacterIconUrlFromName = (name: string): string => {
      const basePath = getCharacterIconBasePath(name)
      const game = (props.version.game || 'GI').toUpperCase()
      const format = GAME_ICON_FORMAT[game] || 'png'
      return `${basePath}.${format}`
    }

    /**
     * Get character splash URL (using same method as Character page)
     * Always returns a valid URL, even if character is not found or still loading
     */
    const getCharacterSplashUrlFromName = (name: string): string => {
      // Always provide a fallback URL immediately, even if character is still loading
      const cleanName = name.replace(/\s*\d+★.*$/i, '').replace(/\s*\(.*?\)\s*/g, '').trim()
      const fallbackChar: Character = {
        name: cleanName,
        game: (props.version.game || 'GI') as any
      }
      
      // Try to get character from cache (may be null if not found, or undefined if still loading)
      const character = getCharacter(name)
      if (character) {
        // Use actual character data if available
        return getCharacterSplashUrl(character)
      }
      
      // Fallback: use constructed path from name and game
      // This ensures we always have a URL to display, even if character is not found
      return getCharacterSplashUrl(fallbackChar)
    }
    
    /**
     * Get character rarity from Character object
     */
    const getCharacterRarity = (name: string): number | null => {
      const character = getCharacter(name)
      return character?.rarity || null
    }

    const checkDescLength = () => {
      const desc = props.version?.description || ''
      isDescLong.value = desc.length > 150
    }

    watchEffect(() => {
      checkDescLength()
      // Load full Character objects when rate-up characters change (similar to Character page)
      loadCharacters()
    })

    const toggleDesc = () => {
      if (isDescLong.value) {
        showFullDesc.value = !showFullDesc.value
      }
    }

    const showSplashArt = (characterName: string, event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement
      const rect = target.getBoundingClientRect()
      const xPos = rect.right + 15
      const yPos = Math.max(20, rect.top + rect.height / 2 - 250)

      popupPosition.value = {
        x: xPos,
        y: yPos
      }

      selectedCharacter.value = characterName
      selectedCharacterSplashUrl.value = getCharacterSplashUrlFromName(characterName)
      showFullImage.value = true
    }

    const hideSplashArt = () => {
      showFullImage.value = false
    }

    const formatDate = (input?: string) => {
      if (!input) return 'TBD'
      const d = new Date(input)
      const t = d.getTime()
      if (isNaN(t)) return 'TBD'
      const dd = String(d.getDate()).padStart(2, '0')
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const yyyy = d.getFullYear()
      return `${dd}/${mm}/${yyyy}`
    }

    const formatRelativeRelease = (input?: string) => {
      if (!input) return 'Chưa công bố'
      const release = new Date(input)
      if (isNaN(release.getTime())) return 'Chưa công bố'
      const diff = release.getTime() - Date.now()
      const days = Math.round(diff / (1000 * 60 * 60 * 24))
      if (days > 0) return `Còn ${days} ngày`
      if (days === 0) return 'Ra mắt hôm nay'
      return `${Math.abs(days)} ngày trước`
    }

    const formatRarity = (rarity?: string) => {
      if (!rarity) return '★5'
      const match = rarity.match(/^(\d)/)
      return match ? `★${match[1]}` : rarity
    }

    const formatRateupTag = (rarity?: string) => {
      if (!rarity) return 'Featured banner'
      const lower = rarity.toLowerCase()
      if (lower.includes('rerun')) return 'Rerun featured'
      if (lower.startsWith('4')) return '4★ Rate-up'
      if (lower.startsWith('5')) return '5★ Rate-up'
      return rarity
    }

    const handleImageLoad = (event: Event) => {
      const img = event.target as HTMLImageElement
      // Mark as successfully loaded
      img.dataset.loaded = 'true'
      img.style.opacity = '1'
    }

    const handleImageError = (event: Event) => {
      const img = event.target as HTMLImageElement
      
      // If using <picture> element, the fallback PNG in <img> already failed
      // Just use placeholder or hide
      if (img.dataset.fallbackAttempted === 'true') {
        img.style.display = 'none'
        return
      }
      
      // Mark as attempted and use placeholder
      img.dataset.fallbackAttempted = 'true'
      const placeholderUrl = '/images/shared/placeholder/character.png'
      if (img.src !== placeholderUrl) {
        img.src = placeholderUrl
      } else {
        img.style.display = 'none'
      }
    }

    const handleEdit = () => {
      if (ENABLE_CRUD) {
        emit('edit', props.version)
      }
    }

    const handleDelete = () => {
      if (ENABLE_CRUD && confirm(`Bạn có chắc muốn xóa version ${props.version.version}?`)) {
        emit('delete', props.version)
      }
    }

    return {
      ENABLE_CRUD,
      formatDate,
      formatRarity,
      formatRateupTag,
      getCharacterIconUrlFromName,
      getCharacterRarity,
      characterCacheKey,
      handleImageError,
      handleImageLoad,
      showFullImage,
      selectedCharacter,
      selectedCharacterSplashUrl,
      popupPosition,
      showSplashArt,
      hideSplashArt,
      showFullDesc,
      isDescLong,
      toggleDesc,
      gameIconSrc,
      gameLabel,
      formattedRelease,
      relativeRelease,
      regionLabel,
      statusLabel,
      statusTone,
      handleEdit,
      handleDelete
    }
  }
})
</script>

