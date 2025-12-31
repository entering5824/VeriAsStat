export function useGameConfig() {
  const getGameIcon = (game: string): string => {
    const gameUpper = (game || '').toUpperCase()
    switch (gameUpper) {
      case 'GI':
        return '/images/gi_icon.jpeg'
      case 'HSR':
        return '/images/hsr_icon.png'
      case 'ZZZ':
        return '/images/zzz_icon.png'
      default:
        return '/images/gi_icon.jpeg'
    }
  }

  const getGameName = (game: string): string => {
    const gameUpper = (game || '').toUpperCase()
    switch (gameUpper) {
      case 'GI':
        return 'Genshin Impact'
      case 'HSR':
        return 'Honkai: Star Rail'
      case 'ZZZ':
        return 'Zenless Zone Zero'
      default:
        return game || 'Unknown'
    }
  }

  return {
    getGameIcon,
    getGameName
  }
}

