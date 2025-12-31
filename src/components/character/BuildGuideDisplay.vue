<!--
  Component: Build Guide Display
  Hiển thị thông tin build guide cho một character
-->
<template>
  <div class="build-guide-display">
    <div v-if="buildGuide" class="build-guide-content">
      <!-- Build Title -->
      <div class="build-title">
        <h3>{{ buildGuide.title }}</h3>
      </div>

      <!-- Genshin Impact Build -->
      <div v-if="isGI && giBuildGuide" class="build-section">
        <!-- Weapons -->
        <div v-if="giBuildGuide.weapons && giBuildGuide.weapons.length > 0" class="build-subsection">
          <h4 class="subsection-title">⚔️ Best Weapons</h4>
          <div class="ranked-list">
            <div 
              v-for="weapon in giBuildGuide.weapons" 
              :key="weapon.rank"
              class="ranked-item"
            >
              <span class="rank-badge">{{ weapon.rank }}</span>
              <span class="item-name">{{ weapon.name }}</span>
              <span v-if="weapon.note" class="item-note">{{ weapon.note }}</span>
            </div>
          </div>
        </div>

        <!-- Artifact Sets -->
        <div v-if="giBuildGuide.artifactSets && giBuildGuide.artifactSets.length > 0" class="build-subsection">
          <h4 class="subsection-title">🎴 Artifact Sets</h4>
          <div class="ranked-list">
            <div 
              v-for="setCombo in giBuildGuide.artifactSets" 
              :key="setCombo.rank"
              class="ranked-item set-combination"
            >
              <span class="rank-badge">{{ setCombo.rank }}</span>
              <div class="set-combo">
                <span 
                  v-for="(set, idx) in setCombo.sets" 
                  :key="idx"
                  class="set-piece"
                >
                  {{ set.name }} ({{ set.pieces }})
                  <span v-if="idx < setCombo.sets.length - 1" class="set-separator">+</span>
                </span>
              </div>
              <span v-if="setCombo.note" class="item-note">{{ setCombo.note }}</span>
            </div>
          </div>
        </div>

        <!-- Main Stats -->
        <div v-if="giBuildGuide.mainStats" class="build-subsection">
          <h4 class="subsection-title">📊 Main Stats</h4>
          <div class="main-stats">
            <div v-if="giBuildGuide.mainStats.sands?.length" class="stat-slot">
              <strong>Sands:</strong> {{ giBuildGuide.mainStats.sands.join(', ') }}
            </div>
            <div v-if="giBuildGuide.mainStats.goblet?.length" class="stat-slot">
              <strong>Goblet:</strong> {{ giBuildGuide.mainStats.goblet.join(', ') }}
            </div>
            <div v-if="giBuildGuide.mainStats.circlet?.length" class="stat-slot">
              <strong>Circlet:</strong> {{ giBuildGuide.mainStats.circlet.join(', ') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Honkai: Star Rail Build -->
      <div v-else-if="isHSR && hsrBuildGuide" class="build-section">
        <!-- Light Cones -->
        <div v-if="hsrBuildGuide.lightCones && hsrBuildGuide.lightCones.length > 0" class="build-subsection">
          <h4 class="subsection-title">🔮 Best Light Cones</h4>
          <div class="ranked-list">
            <div 
              v-for="lc in hsrBuildGuide.lightCones" 
              :key="lc.rank"
              class="ranked-item"
            >
              <span class="rank-badge">{{ lc.rank }}</span>
              <span class="item-name">{{ lc.name }}</span>
              <span v-if="lc.note" class="item-note">{{ lc.note }}</span>
            </div>
          </div>
        </div>

        <!-- Relic Sets -->
        <div v-if="hsrBuildGuide.relicSets && hsrBuildGuide.relicSets.length > 0" class="build-subsection">
          <h4 class="subsection-title">🎴 Relic Sets</h4>
          <div class="ranked-list">
            <div 
              v-for="setCombo in hsrBuildGuide.relicSets" 
              :key="setCombo.rank"
              class="ranked-item set-combination"
            >
              <span class="rank-badge">{{ setCombo.rank }}</span>
              <div class="set-combo">
                <span 
                  v-for="(set, idx) in setCombo.sets" 
                  :key="idx"
                  class="set-piece"
                >
                  {{ set.name }} ({{ set.pieces }})
                  <span v-if="idx < setCombo.sets.length - 1" class="set-separator">+</span>
                </span>
              </div>
              <span v-if="setCombo.note" class="item-note">{{ setCombo.note }}</span>
            </div>
          </div>
        </div>

        <!-- Planar Sets -->
        <div v-if="hsrBuildGuide.planarSets && hsrBuildGuide.planarSets.length > 0" class="build-subsection">
          <h4 class="subsection-title">⭐ Planar Sets</h4>
          <div class="ranked-list">
            <div 
              v-for="setCombo in hsrBuildGuide.planarSets" 
              :key="setCombo.rank"
              class="ranked-item set-combination"
            >
              <span class="rank-badge">{{ setCombo.rank }}</span>
              <div class="set-combo">
                <span 
                  v-for="(set, idx) in setCombo.sets" 
                  :key="idx"
                  class="set-piece"
                >
                  {{ set.name }} ({{ set.pieces }})
                  <span v-if="idx < setCombo.sets.length - 1" class="set-separator">+</span>
                </span>
              </div>
              <span v-if="setCombo.note" class="item-note">{{ setCombo.note }}</span>
            </div>
          </div>
        </div>

        <!-- Main Stats -->
        <div v-if="hsrBuildGuide.mainStats" class="build-subsection">
          <h4 class="subsection-title">📊 Main Stats</h4>
          <div class="main-stats">
            <div v-if="hsrBuildGuide.mainStats.body?.length" class="stat-slot">
              <strong>Body:</strong> {{ hsrBuildGuide.mainStats.body.join(', ') }}
            </div>
            <div v-if="hsrBuildGuide.mainStats.feet?.length" class="stat-slot">
              <strong>Feet:</strong> {{ hsrBuildGuide.mainStats.feet.join(', ') }}
            </div>
            <div v-if="hsrBuildGuide.mainStats.sphere?.length" class="stat-slot">
              <strong>Sphere:</strong> {{ hsrBuildGuide.mainStats.sphere.join(', ') }}
            </div>
            <div v-if="hsrBuildGuide.mainStats.rope?.length" class="stat-slot">
              <strong>Rope:</strong> {{ hsrBuildGuide.mainStats.rope.join(', ') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Zenless Zone Zero Build -->
      <div v-else-if="isZZZ && zzzBuildGuide" class="build-section">
        <!-- W-Engines -->
        <div v-if="zzzBuildGuide.wEngines && zzzBuildGuide.wEngines.length > 0" class="build-subsection">
          <h4 class="subsection-title">⚙️ Best W-Engines</h4>
          <div class="ranked-list">
            <div 
              v-for="we in zzzBuildGuide.wEngines" 
              :key="we.rank"
              class="ranked-item"
            >
              <span class="rank-badge">{{ we.rank }}</span>
              <span class="item-name">{{ we.name }}</span>
              <span v-if="we.note" class="item-note">{{ we.note }}</span>
            </div>
          </div>
        </div>

        <!-- Drive Sets -->
        <div v-if="zzzBuildGuide.driveSets && zzzBuildGuide.driveSets.length > 0" class="build-subsection">
          <h4 class="subsection-title">🎴 Drive Sets</h4>
          <div class="ranked-list">
            <div 
              v-for="setCombo in zzzBuildGuide.driveSets" 
              :key="setCombo.rank"
              class="ranked-item set-combination"
            >
              <span class="rank-badge">{{ setCombo.rank }}</span>
              <div class="set-combo">
                <span 
                  v-for="(set, idx) in setCombo.sets" 
                  :key="idx"
                  class="set-piece"
                >
                  {{ set.name }} ({{ set.pieces }})
                  <span v-if="idx < setCombo.sets.length - 1" class="set-separator">+</span>
                </span>
              </div>
              <span v-if="setCombo.note" class="item-note">{{ setCombo.note }}</span>
            </div>
          </div>
        </div>

        <!-- Main Stats -->
        <div v-if="zzzBuildGuide.mainStats" class="build-subsection">
          <h4 class="subsection-title">📊 Main Stats</h4>
          <div class="main-stats">
            <div v-if="zzzBuildGuide.mainStats.disk4?.length" class="stat-slot">
              <strong>Disk 4:</strong> {{ zzzBuildGuide.mainStats.disk4.join(', ') }}
            </div>
            <div v-if="zzzBuildGuide.mainStats.disk5?.length" class="stat-slot">
              <strong>Disk 5:</strong> {{ zzzBuildGuide.mainStats.disk5.join(', ') }}
            </div>
            <div v-if="zzzBuildGuide.mainStats.disk6?.length" class="stat-slot">
              <strong>Disk 6:</strong> {{ zzzBuildGuide.mainStats.disk6.join(', ') }}
            </div>
          </div>
        </div>
      </div>

      <!-- Substats Priority (common for all games) -->
      <div v-if="buildGuide.subStatsPriority && buildGuide.subStatsPriority.length > 0" class="build-subsection">
        <h4 class="subsection-title">📈 Substats Priority</h4>
        <div class="substats-list">
          <div 
            v-for="(substat, idx) in buildGuide.subStatsPriority" 
            :key="idx"
            class="substat-item"
          >
            <span class="priority-number">{{ idx + 1 }}</span>
            <span class="substat-name">{{ substat.stat }}</span>
            <span v-if="substat.note" class="substat-note">{{ substat.note }}</span>
          </div>
        </div>
      </div>

      <!-- Graduation Stats (common for all games) -->
      <div v-if="buildGuide.graduationStats" class="build-subsection graduation-stats">
        <h4 class="subsection-title">🎯 Graduation Stats</h4>
        <div class="graduation-content">
          <!-- Core Stats -->
          <div v-if="buildGuide.graduationStats.core && buildGuide.graduationStats.core.length > 0" class="graduation-section">
            <div class="graduation-label">
              <strong>Core Stats:</strong>
            </div>
            <div class="stat-tags">
              <span 
                v-for="stat in buildGuide.graduationStats.core" 
                :key="stat"
                class="stat-tag core"
              >
                {{ getStatLabel(stat) }}
              </span>
            </div>
          </div>

          <!-- Secondary Stats -->
          <div v-if="buildGuide.graduationStats.secondary && buildGuide.graduationStats.secondary.length > 0" class="graduation-section">
            <div class="graduation-label">
              <strong>Secondary Stats:</strong>
            </div>
            <div class="stat-tags">
              <span 
                v-for="stat in buildGuide.graduationStats.secondary" 
                :key="stat"
                class="stat-tag secondary"
              >
                {{ getStatLabel(stat) }}
              </span>
            </div>
          </div>

          <!-- Minimum Thresholds -->
          <div v-if="buildGuide.graduationStats.minimum && Object.keys(buildGuide.graduationStats.minimum).length > 0" class="graduation-section">
            <div class="graduation-label">
              <strong>Minimum Thresholds:</strong>
            </div>
            <div class="minimum-stats">
              <div 
                v-for="[stat, value] in Object.entries(buildGuide.graduationStats.minimum)" 
                :key="stat"
                class="minimum-item"
              >
                <span class="stat-name">{{ getStatLabel(stat) }}:</span>
                <span class="stat-value">{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div v-if="buildGuide.graduationStats.note" class="graduation-note">
            {{ buildGuide.graduationStats.note }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="no-build-guide">
      <p>Chưa có build guide cho nhân vật này.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BuildGuide, BuildGuideGI, BuildGuideHSR, BuildGuideZZZ } from '../../types/buildGuide'
import { isBuildGuideGI, isBuildGuideHSR, isBuildGuideZZZ, getBuildGuideGame, getStatLabel as getStatLabelHelper } from '../../utils/character'

interface Props {
  buildGuide: BuildGuide | null | undefined
}

const props = defineProps<Props>()

const isGI = computed(() => props.buildGuide ? isBuildGuideGI(props.buildGuide) : false)
const isHSR = computed(() => props.buildGuide ? isBuildGuideHSR(props.buildGuide) : false)
const isZZZ = computed(() => props.buildGuide ? isBuildGuideZZZ(props.buildGuide) : false)

// Narrowed build guide types
const giBuildGuide = computed<BuildGuideGI | null>(() => {
  return props.buildGuide && isBuildGuideGI(props.buildGuide) ? props.buildGuide : null
})

const hsrBuildGuide = computed<BuildGuideHSR | null>(() => {
  return props.buildGuide && isBuildGuideHSR(props.buildGuide) ? props.buildGuide : null
})

const zzzBuildGuide = computed<BuildGuideZZZ | null>(() => {
  return props.buildGuide && isBuildGuideZZZ(props.buildGuide) ? props.buildGuide : null
})

// Helper function to get stat label with game context
const getStatLabel = (statKey: string): string => {
  if (!props.buildGuide) return statKey
  const game = getBuildGuideGame(props.buildGuide)
  return getStatLabelHelper(game, statKey)
}
</script>

<style scoped>
.build-guide-display {
  width: 100%;
  color: #fff;
}

.build-guide-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.build-title h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff;
}

.build-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.build-subsection {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.subsection-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

/* Ranked List */
.ranked-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ranked-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
}

.item-name {
  flex: 1;
  font-weight: 500;
  color: #fff;
}

.item-note {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-style: italic;
}

/* Set Combination */
.set-combination {
  flex-wrap: wrap;
}

.set-combo {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  flex-wrap: wrap;
}

.set-piece {
  font-weight: 500;
  color: #fff;
}

.set-separator {
  color: rgba(255, 255, 255, 0.4);
  margin: 0 4px;
}

/* Main Stats */
.main-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-slot {
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
  font-size: 14px;
}

.stat-slot strong {
  color: rgba(255, 255, 255, 0.9);
  margin-right: 8px;
}

/* Substats Priority */
.substats-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.substat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4px;
}

.priority-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.substat-name {
  flex: 1;
  font-weight: 500;
  color: #fff;
}

.substat-note {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  font-style: italic;
}

/* Graduation Stats */
.graduation-stats {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
}

.graduation-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.graduation-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.graduation-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.stat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stat-tag {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-tag.core {
  background: rgba(102, 126, 234, 0.3);
  color: #fff;
  border: 1px solid rgba(102, 126, 234, 0.5);
}

.stat-tag.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.minimum-stats {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.minimum-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.minimum-item .stat-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.minimum-item .stat-value {
  color: #4ade80;
  font-weight: 600;
}

.graduation-note {
  margin-top: 8px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid rgba(102, 126, 234, 0.5);
  border-radius: 4px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
}

/* Empty state */
.no-build-guide {
  padding: 40px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
}
</style>
