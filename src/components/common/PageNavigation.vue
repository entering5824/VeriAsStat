<template>
  <div class="page-navigation">
    <RouterLink 
      :to="`/${game.toLowerCase()}`" 
      class="nav-btn"
      :class="{ active: isActive('versions') }"
    >
      Versions
    </RouterLink>
    <RouterLink 
      :to="`/characters?game=${game}`" 
      class="nav-btn"
      :class="{ active: isActive('characters') }"
    >
      Characters
    </RouterLink>
    <RouterLink 
      :to="`/weapons?game=${game}`" 
      class="nav-btn"
      :class="{ active: isActive('weapons') }"
    >
      Weapons
    </RouterLink>
    <RouterLink 
      :to="`/artifacts?game=${game}`" 
      class="nav-btn"
      :class="{ active: isActive('artifacts') }"
    >
      Artifacts
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { useRoute, RouterLink } from 'vue-router'

interface Props {
  game: string
}

const props = withDefaults(defineProps<Props>(), {
  game: 'GI'
})

const route = useRoute()

const isActive = (tab: string): boolean => {
  const path = route.path.toLowerCase()
  const queryGame = (route.query.game as string)?.toLowerCase() || ''
  const gameLower = props.game.toLowerCase()
  
  switch (tab) {
    case 'versions':
      // Active if on game page (e.g., /gi, /hsr, /zzz)
      return path === `/${gameLower}`
    case 'characters':
      return path === '/characters' && queryGame === gameLower
    case 'weapons':
      return path === '/weapons' && queryGame === gameLower
    case 'artifacts':
      return path === '/artifacts' && queryGame === gameLower
    default:
      return false
  }
}
</script>

<style scoped src="../../assets/styles/components/PageNavigation.css"></style>

