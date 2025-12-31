<!-- 
  Component: Character Grid
  
  Chức năng: Lưới hiển thị danh sách nhân vật
  - Grid responsive với auto-fill
  - Skeleton loader khi loading
  - Empty state khi không có nhân vật
  - Emit edit event khi click vào item
-->
<template>
  <div class="character-grid-container">
    <!-- Loading state với skeleton -->
    <SkeletonLoader
      v-if="loading"
      variant="grid"
      :count="12"
      item-variant="rectangular"
      :height="90"
      custom-class="character-skeleton"
    />

    <!-- Grid với characters -->
    <div 
      v-else-if="characters && characters.length > 0" 
      class="character-grid"
      :style="{ '--grid-columns': columns }"
    >
      <Character_Item
        v-for="char in characters"
        :key="getCharacterKey(char)"
        :character="char"
        @viewBuildGuide="$emit('viewBuildGuide', getCharacterId(char))"
      />
    </div>

    <!-- Empty state nếu không có nhân vật -->
    <div v-else class="empty-state">
      <div class="empty-icon">📭</div>
      <p class="empty-text">Chưa có nhân vật nào. Hãy thêm nhân vật đầu tiên!</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType } from 'vue'
import type { Character } from '../../types/character'
import Character_Item from './Character_Item.vue'
import SkeletonLoader from '../ui/SkeletonLoader.vue'

export default defineComponent({
  name: 'CharacterGrid',
  components: { Character_Item, SkeletonLoader },
  props: {
    characters: {
      type: Array as PropType<Character[]>,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Number,
      default: 8
    }
  },
  emits: ['refresh', 'viewBuildGuide'],
  methods: {
    /**
     * Get unique key for character (supports _id, id, characterId)
     */
    getCharacterKey(char: Character): string {
      const c = char as any
      return String(c._id || c.id || c.characterId || c.name || Math.random())
    },
    /**
     * Get character ID for edit event
     */
    getCharacterId(char: Character): string {
      const c = char as any
      return String(c._id || c.id || c.characterId || '')
    }
  }
})
</script>

<style scoped src="../../assets/styles/components/CharacterGrid.css"></style>
