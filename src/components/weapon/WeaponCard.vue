<template>
  <div class="weapon-card" :class="{ 'is-pinned': isPinned }" @click="$emit('click', weapon)">
    <div class="weapon-card-header">
      <img :src="iconUrl" :alt="weapon.name" class="weapon-icon" />
      <div class="weapon-info">
        <h3 class="weapon-name">{{ weapon.name }}</h3>
        <div class="weapon-meta">
          <span class="rarity-badge" :class="`rarity-${weapon.rarity}`">
            {{ weapon.rarity }}★
          </span>
          <span v-if="weapon.meta?.isSignature" class="signature-badge">Signature</span>
        </div>
      </div>
      <button
        v-if="showPin"
        class="pin-button"
        :class="{ 'is-pinned': isPinned }"
        @click.stop="$emit('toggle-pin', weapon.id)"
        :aria-label="isPinned ? 'Unpin weapon' : 'Pin weapon'"
      >
        ⭐
      </button>
    </div>
    <div v-if="weapon.meta?.powerTier" class="power-tier">
      Tier: {{ weapon.meta.powerTier }}
    </div>
    <div v-if="tags.length > 0" class="weapon-tags">
      <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BaseWeapon } from '../../types/weapon'
import { getWeaponIconUrl } from '../../utils/weapon'

interface Props {
  weapon: BaseWeapon
  isPinned?: boolean
  showPin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPinned: false,
  showPin: true
})

const emit = defineEmits<{
  click: [weapon: BaseWeapon]
  'toggle-pin': [weaponId: string]
}>()

const iconUrl = computed(() => {
  // Use getWeaponIconUrl which now supports WebP
  return getWeaponIconUrl(props.weapon as any)
})

const tags = computed(() => {
  const tags: string[] = []
  if (props.weapon.meta?.isSignature) tags.push('Signature')
  if (props.weapon.meta?.powerTier === 'S') tags.push('Meta')
  return tags
})
</script>

<style scoped>
.weapon-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--color-border);
}

.weapon-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.weapon-card.is-pinned {
  border-color: var(--color-primary);
}

.weapon-card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.weapon-icon {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: var(--radius-md);
}

.weapon-info {
  flex: 1;
}

.weapon-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-1) 0;
  color: var(--color-on-surface);
}

.weapon-meta {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.rarity-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.rarity-5 {
  background: var(--color-rarity-5);
  color: var(--color-on-rarity-5);
}

.rarity-4 {
  background: var(--color-rarity-4);
  color: var(--color-on-rarity-4);
}

.rarity-3 {
  background: var(--color-rarity-3);
  color: var(--color-on-rarity-3);
}

.signature-badge {
  padding: var(--space-1) var(--space-2);
  background: var(--color-primary);
  color: var(--color-on-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}

.pin-button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: var(--font-size-lg);
  opacity: 0.5;
  transition: opacity 0.2s;
}

.pin-button:hover {
  opacity: 1;
}

.pin-button.is-pinned {
  opacity: 1;
  color: var(--color-primary);
}

.power-tier {
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-on-surface-variant);
}

.weapon-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  margin-top: var(--space-2);
}

.tag {
  padding: var(--space-1) var(--space-2);
  background: var(--color-surface-variant);
  color: var(--color-on-surface-variant);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
}
</style>

