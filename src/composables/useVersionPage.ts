import { ref, computed, onMounted } from 'vue'

interface Version {
  _id?: string
  id?: string
  game: string
  version: string
  release_date?: string
  status?: string
  [key: string]: any
}

export function useVersionPage() {
  
  const currentView = ref<'home' | 'game'>('home')
  const selectedGame = ref<string | null>(null)
  const selectedGameType = ref<'GI' | 'HSR' | 'ZZZ'>('GI')
  const activeTab = ref<'versions' | 'builds'>('versions')
  const loading = ref(true)
  
  const versionData = ref<Record<string, Version[]>>({
    GI: [],
    HSR: [],
    ZZZ: []
  })
  
  // Parse version number for sorting
  const parseVersionNumber = (version: string): number => {
    if (!version) return 0
    const cleaned = version.replace(/[^0-9.]/g, '')
    const parts = cleaned.split('.')
    const major = parseInt(parts[0] || '0', 10)
    const minor = parseInt(parts[1] || '0', 10)
    return major + minor / 10
  }
  
  // Load versions from JSON
  const fetchVersions = async () => {
    loading.value = true
    try {
      const response = await fetch('/data/versions.json')
      if (!response.ok) {
        throw new Error('Failed to load versions')
      }
      const allVersions = await response.json()
      
      // Group by game
      versionData.value = {
        GI: allVersions.filter((v: Version) => (v.game || '').toUpperCase() === 'GI'),
        HSR: allVersions.filter((v: Version) => (v.game || '').toUpperCase() === 'HSR'),
        ZZZ: allVersions.filter((v: Version) => (v.game || '').toUpperCase() === 'ZZZ')
      }
      
      // Sort each game's versions by version number (ascending)
      Object.keys(versionData.value).forEach(game => {
        versionData.value[game]!.sort((a, b) => {
          return parseVersionNumber(a.version || '') - parseVersionNumber(b.version || '')
        })
      })
    } catch (error) {
      console.error('Error loading versions:', error)
      versionData.value = { GI: [], HSR: [], ZZZ: [] }
    } finally {
      loading.value = false
    }
  }
  
  // Visible version data based on current view
  const visibleVersionData = computed(() => versionData.value)
  
  // Sorted game versions for selected game
  const sortedGameVersions = computed(() => {
    if (!selectedGame.value) return []
    const game = selectedGame.value.toUpperCase() as 'GI' | 'HSR' | 'ZZZ'
    const versions = versionData.value[game] || []
    
    // Already sorted by version number in fetchVersions
    return versions
  })
  
  // CRUD functions (placeholder - can be extended for backend)
  const createVersion = async (version: Version) => {
    // Placeholder - would call API in real implementation
    console.log('Create version:', version)
  }
  
  const updateVersion = async (id: string, version: Version) => {
    // Placeholder - would call API in real implementation
    console.log('Update version:', id, version)
  }
  
  const deleteVersion = async (id: string) => {
    // Placeholder - would call API in real implementation
    console.log('Delete version:', id)
  }
  
  onMounted(() => {
    fetchVersions()
  })
  
  return {
    currentView,
    selectedGame,
    selectedGameType,
    activeTab,
    visibleVersionData,
    sortedGameVersions,
    loading,
    createVersion,
    updateVersion,
    deleteVersion,
    versionData,
    fetchVersions
  }
}

