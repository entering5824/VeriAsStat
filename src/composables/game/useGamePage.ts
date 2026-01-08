import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useGameConfig } from './useGameConfig'
import { characterService } from '../../services/character'

interface GameConfig {
  code: string
  name: string
  subtitle: string
  icon: string
  color: string
}

export function useGamePage() {
  const route = useRoute()
  const { getGameIcon } = useGameConfig()
  
  const loading = ref(true)
  
  // Get game code from route
  const gameCode = computed(() => {
    const path = route.path
    if (path.includes('/gi')) return 'GI'
    if (path.includes('/hsr')) return 'HSR'
    if (path.includes('/zzz')) return 'ZZZ'
    return 'GI'
  })
  
  // Game config
  const gameConfig = computed<GameConfig | null>(() => {
    const code = gameCode.value
    const gameUpper = code.toUpperCase()
    
    const configs: Record<string, GameConfig> = {
      GI: {
        code: 'GI',
        name: 'Genshin Impact',
        subtitle: 'Open-world action RPG',
        icon: getGameIcon('GI'),
        color: '#0096ff'
      },
      HSR: {
        code: 'HSR',
        name: 'Honkai: Star Rail',
        subtitle: 'Space fantasy RPG',
        icon: getGameIcon('HSR'),
        color: '#8a2be2'
      },
      ZZZ: {
        code: 'ZZZ',
        name: 'Zenless Zone Zero',
        subtitle: 'Urban fantasy action RPG',
        icon: getGameIcon('ZZZ'),
        color: '#ff3232'
      }
    }
    
    return configs[gameUpper] || null
  })
  
  // Data
  const versions = ref<any[]>([])
  const characters = ref<any[]>([])
  const weapons = ref<any[]>([])
  const artifacts = ref<any[]>([])
  
  // Load data
  const loadData = async () => {
    loading.value = true
    const game = gameCode.value
    
    try {
      // Load versions
      const versionsResponse = await fetch('/data/versions.json')
      if (versionsResponse.ok) {
        const allVersions = await versionsResponse.json()
        versions.value = allVersions.filter((v: any) => 
          (v.game || '').toUpperCase() === game.toUpperCase()
        )
      }
      
      // Load characters
      try {
        characters.value = await characterService.getCharacters(game)
      } catch (err) {
        console.error('Error loading characters:', err)
        characters.value = []
      }
      
      // Load weapons/artifacts based on game
      
      // Weapons
      try {
        if (game === 'GI') {
          const weaponsResponse = await fetch('/data/gi/weapons.json')
          if (weaponsResponse.ok) {
            weapons.value = await weaponsResponse.json()
          }
        } else if (game === 'HSR') {
          const lightconesResponse = await fetch('/data/hsr/lightcones.json')
          if (lightconesResponse.ok) {
            weapons.value = await lightconesResponse.json()
          }
        } else if (game === 'ZZZ') {
          const wenginesResponse = await fetch('/data/zzz/wengines.json')
          if (wenginesResponse.ok) {
            weapons.value = await wenginesResponse.json()
          }
        }
      } catch (err) {
        console.error('Error loading weapons:', err)
        weapons.value = []
      }
      
      // Artifacts
      try {
        if (game === 'GI') {
          const artifactsResponse = await fetch('/data/gi/artifacts.json')
          if (artifactsResponse.ok) {
            artifacts.value = await artifactsResponse.json()
          }
        } else if (game === 'HSR') {
          const relicsResponse = await fetch('/data/hsr/relics.json')
          if (relicsResponse.ok) {
            artifacts.value = await relicsResponse.json()
          }
        } else if (game === 'ZZZ') {
          const disksResponse = await fetch('/data/zzz/disks.json')
          if (disksResponse.ok) {
            artifacts.value = await disksResponse.json()
          }
        }
      } catch (err) {
        console.error('Error loading artifacts:', err)
        artifacts.value = []
      }
    } catch (error) {
      console.error('Error loading game page data:', error)
    } finally {
      loading.value = false
    }
  }
  
  // Sorted versions by version number (ascending: 6.0, 6.1, 6.2, ..., 7.0)
  const sortedVersions = computed(() => {
    return [...versions.value].sort((a, b) => {
      const versionA = a.version || ''
      const versionB = b.version || ''
      
      // Parse version numbers (e.g., "6.0" -> 6.0, "6.1" -> 6.1)
      const parseVersion = (v: string): number => {
        if (!v) return 0
        const cleaned = v.replace(/[^0-9.]/g, '')
        const parts = cleaned.split('.')
        const major = parseInt(parts[0] || '0', 10)
        const minor = parseInt(parts[1] || '0', 10)
        return major + minor / 10
      }
      
      return parseVersion(versionA) - parseVersion(versionB) // Ascending order
    })
  })
  
  onMounted(() => {
    loadData()
  })
  
  return {
    loading,
    gameCode,
    gameConfig,
    versions,
    sortedVersions
  }
}

