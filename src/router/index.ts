import { createRouter, createWebHistory } from 'vue-router'

// Lazy load pages for code splitting
const HomePage = () => import('../pages/Home.vue')
const VersionPage = () => import('../pages/version/VersionPage.vue')
const Character = () => import('../pages/character/Character.vue')
const CharacterDetail = () => import('../pages/character/CharacterDetail.vue')
const Weapon = () => import('../pages/weapon/Weapon.vue')
const WeaponDetail = () => import('../pages/weapon/WeaponDetail.vue')
const Artifact = () => import('../pages/artifact/Artifact.vue')
const GamePage = () => import('../pages/game/GamePage.vue')

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
    meta: {
      title: 'VeriAsStat - Home',
      description: 'Track characters, versions, and builds for Genshin Impact, Honkai: Star Rail, and Zenless Zone Zero.',
      keywords: 'Genshin Impact, Honkai Star Rail, Zenless Zone Zero, character tracker'
    }
  },
  {
    path: '/versions',
    name: 'versions',
    component: VersionPage,
    meta: {
      title: 'Versions - VeriAsStat',
      description: 'Track game versions and updates for Genshin Impact, Honkai: Star Rail, and Zenless Zone Zero.',
      keywords: 'game versions, updates, patch notes, Genshin Impact versions, HSR versions, ZZZ versions'
    }
  },
  {
    path: '/characters',
    name: 'characters',
    component: Character,
    meta: {
      title: 'Characters - VeriAsStat',
      description: 'Browse and manage character database for Genshin Impact, Honkai: Star Rail, and Zenless Zone Zero.',
      keywords: 'characters, character database, character stats, build guides, Genshin characters, HSR characters'
    }
  },
  {
    path: '/characters/:id',
    name: 'character-detail',
    component: CharacterDetail,
    meta: {
      title: 'Character Detail - VeriAsStat',
      description: 'View detailed character information, stats, and build guides.',
      keywords: 'character detail, character stats, build guide, character information'
    }
  },
  {
    path: '/weapons',
    name: 'weapons',
    component: Weapon,
    meta: {
      title: 'Weapons - VeriAsStat',
      description: 'Browse and manage weapon database for Genshin Impact, Honkai: Star Rail, and Zenless Zone Zero.',
      keywords: 'weapons, weapon database, weapon stats, light cones, w-engines, weapon builds'
    }
  },
  {
    path: '/weapons/:id',
    name: 'weapon-detail',
    component: WeaponDetail,
    meta: {
      title: 'Weapon Detail - VeriAsStat',
      description: 'View detailed weapon information, stats, and passive effects.',
      keywords: 'weapon detail, weapon stats, passive effects, weapon information'
    }
  },
  {
    path: '/artifacts',
    name: 'artifacts',
    component: Artifact,
    meta: {
      title: 'Artifacts - VeriAsStat',
      description: 'Browse and manage artifact database for Genshin Impact, Honkai: Star Rail, and Zenless Zone Zero.',
      keywords: 'artifacts, artifact database, artifact stats, relics, planar ornaments, disks, artifact builds'
    }
  },
  {
    path: '/gi',
    name: 'game-gi',
    component: GamePage,
    meta: {
      title: 'Genshin Impact - VeriAsStat',
      description: 'Browse versions, characters, weapons, and artifacts for Genshin Impact.',
      keywords: 'Genshin Impact, GI, versions, characters, weapons, artifacts'
    }
  },
  {
    path: '/hsr',
    name: 'game-hsr',
    component: GamePage,
    meta: {
      title: 'Honkai: Star Rail - VeriAsStat',
      description: 'Browse versions, characters, light cones, and relics for Honkai: Star Rail.',
      keywords: 'Honkai Star Rail, HSR, versions, characters, light cones, relics'
    }
  },
  {
    path: '/zzz',
    name: 'game-zzz',
    component: GamePage,
    meta: {
      title: 'Zenless Zone Zero - VeriAsStat',
      description: 'Browse versions, characters, w-engines, and disks for Zenless Zone Zero.',
      keywords: 'Zenless Zone Zero, ZZZ, versions, characters, w-engines, disks'
    }
  }
]

// Use Vite's base when creating history to ensure correct routing in dev/production
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Update document title and meta tags on route change
router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // Update meta description
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription && to.meta.description) {
    metaDescription.setAttribute('content', to.meta.description as string)
  }
  
  // Update meta keywords
  const metaKeywords = document.querySelector('meta[name="keywords"]')
  if (metaKeywords && to.meta.keywords) {
    metaKeywords.setAttribute('content', to.meta.keywords as string)
  }
  
  // Update Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle && to.meta.title) {
    ogTitle.setAttribute('content', to.meta.title as string)
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]')
  if (ogDescription && to.meta.description) {
    ogDescription.setAttribute('content', to.meta.description as string)
  }
  
  const ogUrl = document.querySelector('meta[property="og:url"]')
  if (ogUrl) {
    ogUrl.setAttribute('content', window.location.href)
  }
  
  next()
})

export default router
