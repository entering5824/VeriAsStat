export interface Game {
  name: string
  subtitle: string
  icon: string
  color: string
}

export const GAMES = {
  genshin: {
    name: 'Genshin Impact',
    subtitle: 'Open-world action RPG',
    icon: '/images/gi_icon.jpeg',
    color: '#0096ff'
  },
  hsr: {
    name: 'Honkai: Star Rail',
    subtitle: 'Space fantasy RPG',
    icon: '/images/hsr_icon.png',
    color: '#8a2be2'
  },
  zzz: {
    name: 'Zenless Zone Zero',
    subtitle: 'Urban fantasy action RPG',
    icon: '/images/zzz_icon.png',
    color: '#ff3232'
  },
  GI: {
    name: 'Genshin Impact',
    subtitle: 'Open-world action RPG',
    icon: '/images/gi_icon.jpeg',
    color: '#0096ff'
  },
  HSR: {
    name: 'Honkai: Star Rail',
    subtitle: 'Space fantasy RPG',
    icon: '/images/hsr_icon.png',
    color: '#8a2be2'
  },
  ZZZ: {
    name: 'Zenless Zone Zero',
    subtitle: 'Urban fantasy action RPG',
    icon: '/images/zzz_icon.png',
    color: '#ff3232'
  }
} as const

export const API_GAMES = ['GI', 'HSR', 'ZZZ'] as const

