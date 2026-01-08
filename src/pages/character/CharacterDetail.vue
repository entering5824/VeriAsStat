<!-- 
  Component: Character Detail Page
  
  Chức năng: Trang chi tiết nhân vật
  - Hero section với splash art
  - Basic info card
  - Stats tables (base, graduation, sub)
  - Build guides section
  - Image gallery
-->
<template>
  <div class="character-detail-page">
    <!-- Back Button -->
    <div class="page-header">
      <button @click="goBack" class="back-btn" aria-label="Go back">
        ← Back
      </button>
    </div>

    <!-- Loading State -->
    <SkeletonDetail v-if="loading" />

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
      <button @click="goBack" class="retry-btn">Go Back</button>
    </div>

    <!-- Character Detail Content -->
    <div v-else-if="character" class="character-detail-content">
      <!-- Hero Section with Splash Art -->
      <div class="hero-section" :style="heroGradient">
        <div class="hero-background">
          <picture v-if="splashUrl">
            <source :srcset="splashSrcSet" type="image/webp" />
          <img 
            :src="splashUrl" 
            :alt="`${character.name} splash art`"
            class="hero-splash"
            @error="handleSplashError"
              loading="lazy"
          />
          </picture>
        </div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-info">
            <h1 class="hero-title">{{ character.name }}</h1>
            <div class="hero-badges">
              <span v-if="character.game" class="game-badge">{{ character.game }}</span>
              <span v-if="character.rarity" class="rarity-badge" :class="`rarity-${character.rarity}`">
                {{ '★'.repeat(character.rarity) }}
              </span>
              <span v-if="character.element" class="element-badge">{{ character.element }}</span>
              <span v-if="character.tier !== null && character.tier !== undefined" class="tier-badge">
                Tier {{ Math.round(character.tier) }}
              </span>
            </div>
          </div>
          <div class="hero-image">
            <img 
              v-if="iconUrl" 
              :src="iconUrl" 
              :alt="`${character.name} icon`"
              class="hero-icon"
              @error="handleIconError"
            />
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Basic Info Card -->
        <div class="info-card">
          <h2 class="card-title">Basic Information</h2>
          <div class="info-grid">
            <div v-if="character.name" class="info-item">
              <span class="info-label">Name:</span>
              <span class="info-value">{{ character.name }}</span>
            </div>
            <div v-if="buildTitle" class="info-item full-width">
              <span class="info-label">Build Title:</span>
              <span class="info-value">{{ buildTitle }}</span>
            </div>
            <div v-if="character.game" class="info-item">
              <span class="info-label">Game:</span>
              <span class="info-value">{{ character.game }}</span>
            </div>
            <div v-if="characterTags.length > 0" class="info-item full-width">
              <span class="info-label">Tags:</span>
              <div class="tags-container">
                <span 
                  v-for="tag in characterTags" 
                  :key="tag.key"
                  class="tag-badge"
                  :class="`tag-${tag.key}`"
                >
                  {{ tag.label }}
                </span>
              </div>
            </div>
            <div v-if="character.element" class="info-item">
              <span class="info-label">Element:</span>
              <span class="info-value">{{ character.element }}</span>
            </div>
            <div v-if="character.rarity" class="info-item">
              <span class="info-label">Rarity:</span>
              <span class="info-value">{{ character.rarity }}★</span>
            </div>
            <div v-if="character.tier !== null && character.tier !== undefined" class="info-item">
              <span class="info-label">Tier:</span>
              <span class="info-value">{{ Math.round(character.tier) }}</span>
            </div>
            <div v-if="weaponType" class="info-item">
              <span class="info-label">Weapon Type:</span>
              <span class="info-value">{{ weaponType }}</span>
            </div>
            <div v-if="character.role && character.role.length > 0" class="info-item">
              <span class="info-label">Role:</span>
              <span class="info-value">{{ Array.isArray(character.role) ? character.role.join(', ') : character.role }}</span>
            </div>
            <div v-if="character.skill_text" class="info-item full-width">
              <span class="info-label">Description:</span>
              <span class="info-value">{{ character.skill_text }}</span>
            </div>
          </div>
        </div>

        <!-- Materials Section (always use existing grid, not affected by feature flag) -->
        <div v-if="materialsSection" class="section-card">
          <h2 class="card-title">{{ materialsSection.title || 'Upgrade Materials' }}</h2>
          <div class="materials-grid">
            <div 
              v-for="(item, index) in materialsSection.items" 
              :key="index"
              class="material-item"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <!-- Dynamic Build Sections (when feature flag enabled) -->
        <template v-if="useNewBuildUI">
          <div
            v-for="section in sections.filter(shouldRenderSection)"
            :key="section.key"
            class="section-card"
          >
            <h2 class="card-title">{{ section.title || getDefaultTitle(section.key) }}</h2>
            <component
              :is="resolveBuildComponent(section.type)"
              v-if="resolveBuildComponent(section.type)"
              :items="section.items || []"
              :title="section.title"
            />
          </div>
        </template>

        <!-- Legacy Build Sections (when feature flag disabled) -->
        <template v-else>
          <!-- Weapons Section -->
          <div v-if="weaponsSection" class="section-card">
            <h2 class="card-title">{{ weaponsSection.title || (game === 'HSR' ? 'Best Light Cones' : game === 'ZZZ' ? 'Best W-Engines' : 'Best Weapons') }}</h2>
            <div v-if="weaponsSection.type === 'ranked-list'" class="ranked-list">
              <div 
                v-for="(item, index) in weaponsSection.items" 
                :key="index"
                class="ranked-item"
                :class="`rank-${item.rank || index + 1}`"
              >
                <div class="rank-badge">#{{ item.rank || index + 1 }}</div>
                <div class="item-content">
                  <span class="item-name">{{ item.name }}</span>
                  <span v-if="item.note" class="item-note">{{ item.note }}</span>
                </div>
              </div>
            </div>
            <div v-else class="simple-list">
              <div 
                v-for="(item, index) in weaponsSection.items" 
                :key="index"
                class="list-item"
              >
                {{ item.name }}
                <span v-if="item.note" class="item-note">{{ item.note }}</span>
              </div>
            </div>
          </div>

          <!-- Artifacts/Relics/Disk Sets Section -->
          <div v-if="artifactsSection" class="section-card">
            <h2 class="card-title">{{ artifactsSection.title || (game === 'HSR' ? 'Best Relics' : game === 'ZZZ' ? 'Best Disk Sets' : 'Best Artifacts') }}</h2>
            <div v-if="artifactsSection.type === 'ranked-list'" class="ranked-list">
              <div 
                v-for="(item, index) in artifactsSection.items" 
                :key="index"
                class="ranked-item artifact-item"
                :class="`rank-${item.rank || index + 1}`"
              >
                <div class="rank-badge">#{{ item.rank || index + 1 }}</div>
                <div class="item-content">
                  <div class="artifact-sets">
                    <span 
                      v-for="(set, setIndex) in item.sets" 
                      :key="setIndex"
                      class="artifact-set"
                    >
                      {{ set.name }} <span class="pieces-count">({{ set.pieces }})</span>
                      <span v-if="setIndex < item.sets.length - 1" class="set-separator">+</span>
                    </span>
                  </div>
                  <span v-if="item.note" class="item-note">{{ item.note }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats/Main Stats Section -->
          <div v-if="statsSection" class="section-card">
            <h2 class="card-title">{{ statsSection.title || 'Best Stats' }}</h2>
            <div class="stats-grid-section">
              <div 
                v-for="(item, index) in statsSection.items" 
                :key="index"
                class="stat-slot-item"
              >
                <div class="stat-slot">{{ item.slot }}</div>
                <div class="stat-value">{{ item.stat }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Stats Section -->
        <div v-if="hasAnyStats" class="stats-section">
          <h2 class="card-title">Stats</h2>
          
          <!-- Base and Graduation Stats (Side by Side) -->
          <div v-if="hasBaseStats || hasGraduationStats" class="stats-grid">
            <!-- Base Stats -->
            <div v-if="hasBaseStats" class="stats-card">
              <h3 class="stats-subtitle">Base Stats</h3>
              <table class="stats-table">
                <tbody>
                  <tr v-for="row in baseStatRows" :key="row.label">
                    <td class="stat-label">{{ row.label }}</td>
                    <td class="stat-value">{{ row.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Graduation Stats -->
            <div v-if="hasGraduationStats" class="stats-card">
              <h3 class="stats-subtitle">Graduation Stats</h3>
              <table class="stats-table">
                <tbody>
                  <tr v-for="row in graduationStatRows" :key="row.label">
                    <td class="stat-label">{{ row.label }}</td>
                    <td class="stat-value">{{ row.value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Sub Stats -->
          <div v-if="hasSubStats" class="stats-card">
            <h3 class="stats-subtitle">Sub Stats</h3>
            <table class="stats-table">
              <tbody>
                <tr v-for="row in subStatRows" :key="row.label">
                  <td class="stat-label">{{ row.label }}</td>
                  <td class="stat-value">{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Build Guides Section -->
        <div v-if="character.buildGuides && character.buildGuides.length > 0" class="build-guides-section">
          <h2 class="card-title">Build Guides</h2>
          <BuildGuideTabs :buildGuides="character.buildGuides" />
        </div>
        <div v-else class="no-build-guides">
          <p>Chưa có build guides cho nhân vật này.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BuildGuideTabs from '../../components/character/BuildGuideTabs.vue'
import SkeletonDetail from '../../components/character/SkeletonDetail.vue'
import BuildRankedList from '../../components/character/build/BuildRankedList.vue'
import BuildSetCombination from '../../components/character/build/BuildSetCombination.vue'
import BuildStatGrid from '../../components/character/build/BuildStatGrid.vue'
import BuildStatPriority from '../../components/character/build/BuildStatPriority.vue'
import type { Character } from '../../types/character'
import { getCharacterIconUrl, getCharacterSplashUrl, makeSrcSet, type Game } from '../../utils/character'
import { characterService } from '../../services/character'
import { useScrollRestore } from '../../composables'
import type { Section } from '../../types/character'

export default defineComponent({
  name: 'CharacterDetail',
  components: {
    BuildGuideTabs,
    SkeletonDetail,
    BuildRankedList,
    BuildSetCombination,
    BuildStatGrid,
    BuildStatPriority
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const character = ref<Character | null>(null)
    const loading = ref(true)
    const error = ref<string | null>(null)

    // Get character ID and game from route
    const characterId = computed(() => route.params.id as string)
    const game = computed(() => ((route.query.game as string) || 'GI').toUpperCase() as Game)

    // Image URLs using unified utils (same as VersionCard)
    const iconUrl = computed(() => character.value ? getCharacterIconUrl(character.value) : '')
    const splashUrl = computed(() => character.value ? getCharacterSplashUrl(character.value) : '')
    
    // Helper to extract name for path (same logic as getCharacterSplashUrl in utils/character.ts)
    function extractNameForSplash(char: any): string {
      if (!char) return ''
      
      // First try to get from splashPath (same as getCharacterSplashUrl)
      const splashPath = char.splashPath || char.character?.splashPath || ''
      if (splashPath) {
        // Extract filename from path (splashPath may or may not have extension)
        // Format: /images/characters/GI/splash/Aino or /images/characters/GI/splash/Aino.png
        const match = splashPath.match(/\/([^/]+?)(?:\.(png|jpg|jpeg|webp))?$/i)
        if (match && match[1]) {
          return match[1] // Return filename without extension
        }
      }
      
      // Fallback: extract from name (same as VersionCard and extractCharacterName)
      if (char.name) {
        const cleanName = char.name
          .replace(/\s*\d+★.*$/i, '')  // Remove " 5★" suffix
          .replace(/\s*\(.*?\)\s*/g, '')  // Remove parentheses content
          .trim()
        
        // Normalize for path: lowercase, replace spaces with underscore, remove special chars
        return cleanName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      }
      
      return ''
    }
    
    // Splash srcset for responsive images (using same logic as VersionCard)
    const splashSrcSet = computed(() => {
      if (!character.value) return ''
      
      const nameForPath = extractNameForSplash(character.value)
      if (!nameForPath) return ''
      
      // makeSrcSet uses 'splash' type which maps to 'splashart' folder
      return makeSrcSet(game.value, 'splash', nameForPath, [400, 800, 1200, 1920])
    })

    // Gradient for hero section based on game
    const heroGradient = computed(() => {
      const gameUpper = game.value.toUpperCase()
      if (gameUpper === 'GI') {
        return { background: 'linear-gradient(135deg, rgba(0, 150, 255, 0.2) 0%, rgba(0, 100, 200, 0.1) 100%)' }
      } else if (gameUpper === 'HSR') {
        return { background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2) 0%, rgba(75, 0, 130, 0.1) 100%)' }
      } else if (gameUpper === 'ZZZ') {
        return { background: 'linear-gradient(135deg, rgba(255, 50, 50, 0.2) 0%, rgba(200, 0, 0, 0.1) 100%)' }
      }
      return { background: 'linear-gradient(135deg, rgba(100, 108, 255, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%)' }
    })

    // Character stats (inline useCharacterStats logic)
    const hasStats = computed(() => {
      if (!character.value) return false
      const char = character.value as any
      return (char.base_stats || char.graduation_stats || char.sub_stats) ? true : false
    })

    const statRows = computed(() => {
      if (!character.value) return []
      const char = character.value as any
      const rows: Array<{ label: string; value: string | number }> = []
      
      // Add base stats if available
      if (char.base_stats) {
        Object.entries(char.base_stats).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            rows.push({
              label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              value: String(value)
            })
          }
        })
      }
      
      return rows
    })
    
    // Additional stats breakdown
    const hasBaseStats = computed(() => {
      if (!character.value) return false
      const char = character.value as any
      return char.base_stats && typeof char.base_stats === 'object' && Object.keys(char.base_stats).length > 0
    })

    const baseStatRows = computed(() => {
      if (!character.value) return []
      const char = character.value as any
      const baseStats = char.base_stats || {}
      const rows: Array<{ label: string; value: string | number }> = []
      
      Object.entries(baseStats).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          rows.push({
            label: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: String(value)
          })
        }
      })
      
      return rows
    })

    const hasGraduationStats = computed(() => {
      if (!character.value) return false
      const char = character.value as any
      const gameUpper = game.value.toUpperCase()
      const gradStats = char.graduation_stats?.[gameUpper] || char.graduationStats
      return gradStats && typeof gradStats === 'object' && Object.keys(gradStats).length > 0
    })

    const graduationStatRows = computed(() => {
      if (!character.value) return []
      const char = character.value as any
      const gameUpper = game.value.toUpperCase()
      const gradStats = char.graduation_stats?.[gameUpper] || char.graduationStats || {}
      const rows: Array<{ label: string; value: string | number }> = []
      
      Object.entries(gradStats).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'minimum' && key !== 'note') {
          rows.push({
            label: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase()),
            value: String(value)
          })
        }
      })
      
      return rows
    })

    const hasSubStats = computed(() => {
      if (!character.value) return false
      const char = character.value as any
      const gameUpper = game.value.toUpperCase()
      const subStats = char.sub_stats?.[gameUpper]
      return subStats && typeof subStats === 'object' && Object.keys(subStats).length > 0
    })

    const subStatRows = computed(() => {
      if (!character.value) return []
      const char = character.value as any
      const gameUpper = game.value.toUpperCase()
      const subStats = char.sub_stats?.[gameUpper] || {}
      const rows: Array<{ label: string; value: string | number }> = []
      
      Object.entries(subStats).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          rows.push({
            label: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/\b\w/g, l => l.toUpperCase()),
            value: String(value)
          })
        }
      })
      
      return rows
    })

    const hasAnyStats = computed(() => {
      return hasBaseStats.value || hasGraduationStats.value || hasSubStats.value || hasStats.value
    })

    const weaponType = computed(() => {
      if (!character.value) return ''
      const char = character.value as any
      return char.weapon_type || char.weaponType || ''
    })

    // Section key mapping functions
    const getWeaponSectionKey = (gameType: string): string => {
      const gameUpper = gameType.toUpperCase()
      if (gameUpper === 'HSR') return 'light_cones'
      return 'weapons' // GI, ZZZ
    }

    const getArtifactSectionKey = (gameType: string): string => {
      const gameUpper = gameType.toUpperCase()
      if (gameUpper === 'HSR') return 'relics'
      if (gameUpper === 'ZZZ') return 'disk_sets'
      return 'artifacts' // GI
    }

    // Best Weapon
    const bestWeapon = computed(() => {
      if (!character.value) return null
      const char = character.value as any
      const sections = char.sections || []
      const weaponKey = getWeaponSectionKey(game.value)
      
      const weaponSection = sections.find((s: any) => s.key === weaponKey)
      if (!weaponSection || !weaponSection.items || weaponSection.items.length === 0) {
        return null
      }
      
      // Nếu type="ranked-list", tìm rank === 1
      if (weaponSection.type === 'ranked-list') {
        const ranked = weaponSection.items.find((item: any) => item.rank === 1)
        return ranked ? ranked.name : weaponSection.items[0]?.name || null
      }
      
      // Nếu type="list", lấy item đầu tiên
      return weaponSection.items[0]?.name || null
    })

    // Best Artifact/Relic/Disk Set (for quick display in basic info - deprecated, now using full section)
    const bestArtifact = computed(() => {
      if (!character.value) return null
      const char = character.value as any
      const sections = char.sections || []
      const artifactKey = getArtifactSectionKey(game.value)
      
      const artifactSection = sections.find((s: any) => s.key === artifactKey)
      if (!artifactSection || !artifactSection.items || artifactSection.items.length === 0) {
        return null
      }
      
      // Tìm rank === 1
      const ranked = artifactSection.items.find((item: any) => item.rank === 1)
      if (!ranked || !ranked.sets || ranked.sets.length === 0) {
        return null
      }
      
      // Format: "Set Name (x pieces) + Set Name 2 (y pieces)"
      return ranked.sets.map((set: any) => `${set.name} (${set.pieces})`).join(' + ')
    })

    // Build title
    const buildTitle = computed(() => {
      if (!character.value) return ''
      const char = character.value as any
      return char.title || ''
    })

    // Character tags
    const characterTags = computed(() => {
      if (!character.value) return []
      const char = character.value as any
      const charObj = char.character || char
      return charObj.tags || []
    })

    // Sections
    const sections = computed(() => {
      if (!character.value) return []
      const char = character.value as any
      return char.sections || []
    })

    // Materials section
    const materialsSection = computed(() => {
      return sections.value.find((s: any) => s.key === 'materials') || null
    })

    // Weapons section
    const weaponsSection = computed(() => {
      const weaponKey = getWeaponSectionKey(game.value)
      return sections.value.find((s: any) => s.key === weaponKey) || null
    })

    // Artifacts section
    const artifactsSection = computed(() => {
      const artifactKey = getArtifactSectionKey(game.value)
      return sections.value.find((s: any) => s.key === artifactKey) || null
    })

    // Stats section (for stat-grid type)
    const statsSection = computed(() => {
      return sections.value.find((s: any) => 
        (s.key === 'stats' || s.key === 'main_stats') && s.type === 'stat-grid'
      ) || null
    })

    // Helper function to get default title for section key
    const getDefaultTitle = (key: string): string => {
      const titleMap: Record<string, string> = {
        weapons: game.value === 'HSR' ? 'Best Light Cones' : game.value === 'ZZZ' ? 'Best W-Engines' : 'Best Weapons',
        light_cones: 'Best Light Cones',
        artifacts: 'Best Artifacts',
        relics: 'Best Relics',
        disk_sets: 'Best Disk Sets',
        stats: 'Best Stats',
        main_stats: 'Best Main Stats',
        substats: 'Substat Priority',
        materials: 'Upgrade Materials'
      }
      return titleMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    // Helper function to check if section should be rendered
    const shouldRenderSection = (section: Section): boolean => {
      // Skip materials section (handled separately with existing grid)
      if (section.key === 'materials' && section.type === 'material-grid') {
        return false
      }
      return true
    }

    // Feature flag for new build UI (currently disabled, using legacy sections)
    const useNewBuildUI = ref(false)

    // Helper function to resolve build component name from section type
    const resolveBuildComponent = (type?: string): string | null => {
      if (!type) return null
      
      const componentMap: Record<string, string> = {
        'ranked-list': 'BuildRankedList',
        'set-combination': 'BuildSetCombination',
        'stat-grid': 'BuildStatGrid',
        'stat-priority': 'BuildStatPriority'
      }
      
      return componentMap[type] || null
    }

    // Load character
    const loadCharacter = async () => {
      if (!characterId.value || !game.value) {
        error.value = 'Character ID and game are required'
        loading.value = false
        return
      }

      loading.value = true
      error.value = null

      try {
        // Use characterService to load character (with retry, cache, validation)
        const found = await characterService.getCharacter(characterId.value, game.value)

        if (!found) {
            throw new Error('Character not found')
        }

        character.value = found
        await nextTick()
      } catch (err: any) {
        error.value = err?.message || 'Failed to load character'
      } finally {
        loading.value = false
      }
    }

    // Scroll restoration
    const { saveScrollState } = useScrollRestore()

    const goBack = () => {
      // Save scroll state before navigating
      saveScrollState({
        filters: { game: game.value },
        searchQuery: ''
      })
      router.push({ path: '/characters', query: { game: game.value } })
    }
    
    // Save scroll state when component is about to unmount (navigating to detail)
    onBeforeUnmount(() => {
      // This will be called when navigating away from detail page
      // But we want to save when navigating TO detail, so we handle it in goBack
    })

    // Handle icon load error - fallback WebP -> PNG -> placeholder
    const handleIconError = (event: Event) => {
      const target = event.target as HTMLImageElement
      const currentSrc = target.src
      
      // Prevent infinite loop
      if (target.dataset.fallbackAttempted === 'true') {
        target.src = '/images/shared/placeholder/character.png'
        return
      }
      
      // Try PNG if WebP failed
      if (currentSrc.endsWith('.webp')) {
        const pngSrc = currentSrc.replace('.webp', '.png')
        target.dataset.fallbackAttempted = 'png'
        target.src = pngSrc
        return
      }
      
      // If PNG also failed, use placeholder
      target.dataset.fallbackAttempted = 'true'
      target.src = '/images/placeholder/character.png'
    }

    // Handle splash load error - fallback WebP -> PNG -> hide
    // Handle splash load error - fallback WebP -> PNG -> hide
    const handleSplashError = (event: Event) => {
      const target = event.target as HTMLImageElement
      const currentSrc = target.src
      
      // Prevent infinite loop
      if (target.dataset.fallbackAttempted === 'true') {
        target.style.display = 'none'
        return
      }
      
      // Try PNG if WebP failed
      if (currentSrc.endsWith('.webp')) {
        const pngSrc = currentSrc.replace('.webp', '.png')
        target.dataset.fallbackAttempted = 'png'
        target.src = pngSrc
        return
      }
      
      // If PNG also failed, hide image
      target.dataset.fallbackAttempted = 'true'
      target.style.display = 'none'
    }

    onMounted(() => {
      loadCharacter()
    })

    return {
      character,
      loading,
      error,
      iconUrl,
      splashUrl,
      heroGradient,
      hasStats,
      statRows,
      hasBaseStats,
      baseStatRows,
      hasGraduationStats,
      graduationStatRows,
      hasSubStats,
      subStatRows,
      hasAnyStats,
      weaponType,
      bestWeapon,
      bestArtifact,
      game,
      splashSrcSet,
      buildTitle,
      characterTags,
      materialsSection,
      weaponsSection,
      artifactsSection,
      statsSection,
      sections,
      useNewBuildUI,
      resolveBuildComponent,
      getDefaultTitle,
      shouldRenderSection,
      goBack,
      handleIconError,
      handleSplashError,
    }
  }
})
</script>

<style scoped src="../../assets/styles/pages/CharacterDetail.css"></style>

