<template>
  <div class="weapon-detail-page">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>Loading weapon details...</span>
    </div>
    
    <div v-else-if="weapon" class="page-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-visual">
            <div class="icon-wrapper">
              <img :src="iconUrl" :alt="weapon.name" class="weapon-hero-icon" />
              <div class="glow-effect"></div>
            </div>
          </div>
          
          <div class="hero-info">
            <div class="hero-header">
              <h1 class="weapon-title">{{ weapon.name }}</h1>
              <div class="weapon-meta-badges">
                <span class="badge rarity-badge" :class="`rarity-${weapon.rarity}`">
                  {{ weapon.rarity }}★
                </span>
                <span v-if="weapon.meta?.isSignature" class="badge signature-badge">Signature</span>
                <span v-if="weapon.meta?.powerTier" class="badge tier-badge">
                  Tier {{ weapon.meta.powerTier }}
                </span>
                <span class="badge game-badge">{{ weapon.game }}</span>
              </div>
            </div>
            
            <div class="hero-stats">
              <div class="main-stat" v-if="displayStats.main">
                <span class="stat-label">{{ displayStats.main.label }}</span>
                <span class="stat-val">{{ displayStats.main.value }}</span>
              </div>
              <div class="sub-stat" v-if="displayStats.sub">
                <span class="stat-label">{{ displayStats.sub.label }}</span>
                <span class="stat-val">{{ displayStats.sub.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="detail-grid">
        <!-- Left Column: Stats & Analysis -->
        <div class="detail-left">
          <!-- Summary Card -->
          <section class="detail-card summary-card">
            <h2><i class="mdi mdi-information-outline"></i> Why this weapon?</h2>
            <p class="summary-text">{{ weaponSummary }}</p>
          </section>

          <!-- Stats Table (Collapsible) -->
          <section class="detail-card stats-card">
            <div class="card-header">
              <h2><i class="mdi mdi-chart-bar"></i> Stats Scaling</h2>
              <button class="toggle-btn" @click="toggleSection('stats')">
                {{ sections.stats ? 'Hide' : 'Show Details' }}
              </button>
            </div>
            
            <div v-show="sections.stats" class="card-content">
               <div class="level-slider-container">
                 <label>Level: {{ level }}</label>
                 <input 
                   type="range" 
                   v-model.number="level" 
                   min="1" 
                   max="90" 
                   class="slider"
                 />
               </div>
               <WeaponStatsTable
                :stats="calculatedStats"
                :highlighted-stats="highlightedStats"
                @stat-hover="handleStatHover"
              />
            </div>
          </section>
        </div>

        <!-- Right Column: Passives & Mechanics -->
        <div class="detail-right">
          <!-- Passive Effects -->
          <section class="detail-card passive-card">
            <div class="card-header sticky-header" :class="{ 'is-stuck': isSticky }">
              <h2><i class="mdi mdi-flash"></i> Passive Effects</h2>
              
              <!-- Sticky Refinement Selector -->
              <div class="refinement-controls">
                <span>R{{ selectedRefinement }}</span>
                <div class="btn-group">
                  <button 
                    v-for="i in 5" 
                    :key="i"
                    class="refine-btn"
                    :class="{ active: selectedRefinement === i }"
                    @click="selectedRefinement = i"
                  >
                    {{ i }}
                  </button>
                </div>
              </div>
            </div>

            <div class="passive-content">
              <PassiveRenderer
                v-for="(passive, idx) in passiveEffects"
                :key="idx"
                :passive="passive"
                :weapon="weapon"
                :refinement="selectedRefinement"
                @highlight="handlePassiveHighlight"
              />
            </div>
          </section>

          <!-- Advanced Data (Progressive Disclosure) -->
          <section class="detail-card advanced-card">
            <div class="card-header">
              <h2><i class="mdi mdi-code-tags"></i> Advanced Data</h2>
              <button class="toggle-btn" @click="toggleSection('advanced')">
                {{ sections.advanced ? 'Hide' : 'Show JSON' }}
              </button>
            </div>
            <div v-if="sections.advanced" class="card-content code-block">
              <pre>{{ JSON.stringify(weapon.meta, null, 2) }}</pre>
            </div>
          </section>
        </div>
      </div>
    </div>
    
    <div v-else class="error-state">
      <i class="mdi mdi-alert-circle"></i>
      <h3>Weapon not found</h3>
      <button @click="router.push('/weapons')" class="back-btn">Back to Catalog</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Weapon, PassiveEffect } from '../../types/weapon'
import { weaponService } from '../../services'
import { useWeaponScaling, provideWeaponContext, useImagePreloader } from '../../composables'
import WeaponStatsTable from '../../components/weapon/WeaponStatsTable.vue'
import PassiveRenderer from '../../components/weapon/PassiveRenderer.vue'
import { isGenshinWeapon, isHSRLightCone, isZZZWEngine } from '../../utils/weapon'

const route = useRoute()
const router = useRouter()
const context = provideWeaponContext()

// State
const weapon = ref<Weapon | null>(null)
const loading = ref(false)
const selectedRefinement = ref(1)
const level = ref(90)
const highlightedStats = ref<string[]>([])
const isSticky = ref(false)

// Progressive Disclosure State
const sections = reactive({
  stats: true,
  advanced: false
})

const iconUrl = computed(() => {
  if (!weapon.value) return ''
  const cleanName = weapon.value.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  const gameLower = weapon.value.game.toLowerCase()
  return `/images/${gameLower}/weapons/${cleanName}.png`
})

const { calculatedStats } = useWeaponScaling(weapon, level)

const displayStats = computed(() => {
  if (!weapon.value) return { main: null, sub: null }
  const w = weapon.value
  
  if (isGenshinWeapon(w)) {
    return {
      main: { label: 'Base ATK', value: (w as any).baseATK },
      sub: (w as any).subStat ? { label: (w as any).subStat.type, value: (w as any).subStat.value + (typeof (w as any).subStat.value === 'number' && (w as any).subStat.type !== 'Elemental Mastery' ? '%' : '') } : null
    }
  }
  
  if (isHSRLightCone(w)) {
    return {
      main: { label: 'Base HP', value: (w as any).baseHP },
      sub: { label: 'Base ATK', value: (w as any).baseATK } // Showing ATK as sub for hero
    }
  }
  
  if (isZZZWEngine(w)) {
    return {
      main: { label: 'Base ATK', value: (w as any).baseATK },
      sub: (w as any).advancedStat ? { label: (w as any).advancedStat.type, value: (w as any).advancedStat.value } : null
    }
  }
  
  return { main: null, sub: null }
})

const passiveEffects = computed<PassiveEffect[]>(() => {
  if (!weapon.value) return []
  if (weapon.value.game === 'GI' && 'refinementEffects' in weapon.value) return weapon.value.refinementEffects
  if (weapon.value.game === 'HSR' && 'superimpositionEffects' in weapon.value) return weapon.value.superimpositionEffects
  if (weapon.value.game === 'ZZZ' && 'corePassive' in weapon.value) return [weapon.value.corePassive]
  return []
})

const weaponSummary = computed(() => {
  if (!weapon.value) return ''
  const parts: string[] = []
  if (weapon.value.meta?.isSignature) parts.push('This is a signature weapon designed for specific synergy.')
  if (weapon.value.meta?.powerTier === 'S') parts.push('Widely considered a top-tier choice in the current meta.')
  return parts.join(' ') || 'A versatile option suitable for developing your characters.'
})



function toggleSection(section: keyof typeof sections) {
  sections[section] = !sections[section]
}

const { preloadImages } = useImagePreloader()

async function loadWeapon() {
  const id = route.params.id as string
  const game = (route.query.game as string) || 'GI'
  loading.value = true
  try {
    const loaded = await weaponService.getWeapon(id, game)
    if (loaded) {
      weapon.value = loaded
      context.weapon.value = loaded
      
      // Đợi DOM update để có image URLs
      await nextTick()
      
      // Preload weapon icon trước khi ẩn loading
      const imageSources = [iconUrl.value].filter(Boolean)
      if (imageSources.length > 0) {
        await preloadImages(imageSources, { timeout: 30000, continueOnError: true })
      }
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}

function handleStatHover(stat: string) {
  highlightedStats.value = stat ? [stat] : []
}

function handlePassiveHighlight(stats: string[]) {
  highlightedStats.value = stats
}

// Logic for sticky header detection
onMounted(() => {
  loadWeapon()
  
  // const observer = new IntersectionObserver(
  //   ([e]) => e.target.classList.toggle('is-pinned', e.intersectionRatio < 1),
  //   { threshold: [1] }
  // );
  // Note: True sticky detection in JS is tricky, usually CSS position:sticky works fine.
  // The logic in previous version was watching a sentinel.
  // We'll rely on CSS styling mostly, but can add class on scroll if needed.
})
</script>

<style scoped>
.weapon-detail-page {
  padding: var(--space-6) var(--space-4);
  background: radial-gradient(circle at top, var(--color-bg-secondary) 0%, var(--color-bg-primary) 80%);
  min-height: 100vh;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

/* Hero Section */
.hero-section {
  position: relative;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  overflow: hidden;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  position: relative;
  z-index: 2;
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
}

.icon-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
}

.weapon-hero-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
}

.glow-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  background: radial-gradient(circle, var(--color-primary-glow) 0%, transparent 70%);
  z-index: -1;
  border-radius: 50%;
}

.hero-info {
  flex: 1;
}

.weapon-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  margin: 0 0 var(--space-2) 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.weapon-meta-badges {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}

.badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--glass-bg-strong);
  border: 1px solid var(--glass-border);
}

.badge.rarity-5 { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; }
.badge.rarity-4 { background: linear-gradient(135deg, #a855f7, #7c3aed); color: white; border: none; }
.badge.rarity-3 { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; border: none; }

.badge.signature-badge {
  background: var(--color-primary-alpha);
  color: var(--color-primary-light);
  border-color: var(--color-primary);
}

.hero-stats {
  display: flex;
  gap: var(--space-8);
  flex-wrap: wrap;
}

.stat-label {
  display: block;
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-1);
}

.stat-val {
  font-size: var(--font-size-2xl);
  font-weight: bold;
  font-family: 'Roboto Mono', monospace;
}

/* Detail Grid */
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
  align-items: start;
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

.detail-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: var(--space-6);
  transition: box-shadow 0.3s;
}

.detail-card:hover {
  box-shadow: var(--shadow-md);
}

.card-header {
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: var(--font-size-lg);
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.card-content {
  padding: var(--space-4);
}

.summary-text {
  font-size: var(--font-size-md);
  line-height: 1.6;
  color: var(--color-on-surface);
  padding: var(--space-4);
}

.toggle-btn {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-on-surface-variant);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-xs);
}

/* Slider */
.level-slider-container {
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: var(--color-bg-secondary);
  padding: var(--space-3);
  border-radius: var(--radius-md);
}

.slider {
  flex: 1;
  accent-color: var(--color-primary);
}

/* Refinement Controls */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgba(26, 26, 46, 0.95); /* Hardcoded dark bg for sticky visibility */
  backdrop-filter: blur(10px);
}

.refinement-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.btn-group {
  display: flex;
  background: var(--color-bg-primary);
  border-radius: var(--radius-md);
  padding: 2px;
}

.refine-btn {
  background: transparent;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  cursor: pointer;
  font-weight: bold;
  font-size: var(--font-size-sm);
}

.refine-btn:hover {
  background: var(--color-surface);
  color: var(--color-text-primary);
}

.refine-btn.active {
  background: var(--color-primary);
  color: white;
}

/* Utils */
.code-block pre {
  background: var(--color-bg-secondary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  overflow-x: auto;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  text-align: center;
  color: var(--color-text-muted);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin: 0 auto var(--space-4);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

