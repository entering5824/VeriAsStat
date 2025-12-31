import { provide, inject, type Ref } from 'vue'
import type { Weapon } from '../types/weapon'

const WeaponContextKey = Symbol('weapon')
const WeaponRefinementKey = Symbol('weapon-refinement')
const WeaponLevelKey = Symbol('weapon-level')

interface WeaponContext {
  weapon: Ref<Weapon | null>
  selectedRefinement: Ref<number>
  level: Ref<number>
}

export function provideWeaponContext(context?: WeaponContext): WeaponContext {
  if (context) {
    // Provide context to children
    provide(WeaponContextKey, context.weapon)
    provide(WeaponRefinementKey, context.selectedRefinement)
    provide(WeaponLevelKey, context.level)
    return context
  } else {
    // Inject context from parent (or return defaults if not provided)
    const weapon = inject<Ref<Weapon | null>>(WeaponContextKey, null)
    const selectedRefinement = inject<Ref<number>>(WeaponRefinementKey, null)
    const level = inject<Ref<number>>(WeaponLevelKey, null)
    
    return {
      weapon: weapon || null,
      selectedRefinement: selectedRefinement || null,
      level: level || null
    }
  }
}

