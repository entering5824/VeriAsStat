<template>
  <div class="passive-renderer">
    <component
      :is="passiveComponent"
      :passive="passive"
      :weapon="weapon as any"
      :level="level"
      :refinement="refinement"
      :superimposition="superimposition"
      :rank="rank"
      @highlight="handleHighlight"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Weapon, PassiveEffect } from '../../types/weapon'
import { isGenshinWeapon, isHSRLightCone, isZZZWEngine } from '../../utils/weapon'
import GenshinPassiveLogic from './GenshinPassiveLogic.vue'
import HSRPassiveLogic from './HSRPassiveLogic.vue'
import ZZZPassiveLogic from './ZZZPassiveLogic.vue'

interface Props {
  passive: PassiveEffect
  weapon: Weapon
  level?: number
  refinement?: number
  superimposition?: number
  rank?: number
}

const props = withDefaults(defineProps<Props>(), {
  level: 90,
  refinement: 1,
  superimposition: 1,
  rank: 1
})

const emit = defineEmits<{
  highlight: [stats: string[], characters: string[]]
}>()

const passiveComponent = computed(() => {
  if (isGenshinWeapon(props.weapon)) {
    return GenshinPassiveLogic
  }
  if (isHSRLightCone(props.weapon)) {
    return HSRPassiveLogic
  }
  if (isZZZWEngine(props.weapon)) {
    return ZZZPassiveLogic
  }
  return null
})

function handleHighlight(stats: string[], characters: string[]) {
  emit('highlight', stats, characters)
}
</script>

<style scoped>
.passive-renderer {
  /* Styles will be in separate CSS file */
}
</style>

