import { ref, computed, onMounted } from 'vue'

interface Version {
  _id?: string
  id?: string
  game: string
  version: string
  release_date?: string
  status?: string
}

export function useHome() {
  const versions = ref<Version[]>([])
  const loading = ref(true)

  // Load versions from JSON
  const loadVersions = async () => {
    try {
      const response = await fetch('/data/versions.json')
      if (!response.ok) {
        throw new Error('Failed to load versions')
      }
      versions.value = await response.json()
    } catch (error) {
      console.error('Error loading versions:', error)
      versions.value = []
    } finally {
      loading.value = false
    }
  }

  // Get game color
  const getGameColor = (game: string): string => {
    const gameUpper = (game || '').toUpperCase()
    switch (gameUpper) {
      case 'GI':
        return '#0096ff'
      case 'HSR':
        return '#8a2be2'
      case 'ZZZ':
        return '#ff3232'
      default:
        return '#646cff'
    }
  }

  // Upcoming versions - filter by status and sort by release date, then version number
  const upcomingVersions = computed(() => {
    const now = new Date()
    // Set time to start of day to avoid timezone issues
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    
    const filtered = versions.value
      .filter(v => {
        const status = (v.status || '').toLowerCase()
        return status === 'confirmed' || status === 'leak' || status === 'planned'
      })
      .filter(v => {
        if (!v.release_date) return true
        // Parse date string (format: YYYY-MM-DD) and compare
        const dateStr = v.release_date.trim()
        if (!dateStr) return true
        
        // Parse as UTC to avoid timezone issues
        const parts = dateStr.split('-')
        if (parts.length !== 3) return true
        
        const year = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10)
        const day = parseInt(parts[2], 10)
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) return true
        
        const releaseDateUTC = Date.UTC(year, month - 1, day)
        
        return releaseDateUTC >= todayUTC
      })
      .sort((a, b) => {
        // First sort by release date (ascending - earliest first)
        const getDateValue = (v: Version): number => {
          if (!v.release_date) return Number.MAX_SAFE_INTEGER
          const dateStr = v.release_date.trim()
          if (!dateStr) return Number.MAX_SAFE_INTEGER
          
          const parts = dateStr.split('-')
          if (parts.length !== 3) return Number.MAX_SAFE_INTEGER
          
          const year = parseInt(parts[0], 10)
          const month = parseInt(parts[1], 10)
          const day = parseInt(parts[2], 10)
          
          if (isNaN(year) || isNaN(month) || isNaN(day)) return Number.MAX_SAFE_INTEGER
          
          return Date.UTC(year, month - 1, day)
        }
        
        const dateA = getDateValue(a)
        const dateB = getDateValue(b)
        
        if (dateA !== dateB) {
          return dateA - dateB
        }
        
        // If same date, sort by version number within same game
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
    
    return filtered
  })

  onMounted(() => {
    loadVersions()
  })

  return {
    versions,
    loading,
    getGameColor,
    upcomingVersions
  }
}

