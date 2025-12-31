<template>
  <div class="game-column">
    <v-card class="game-card" outlined>
      <v-card-title class="game-card-header">
        <div class="game-info">
          <div class="game-icon-wrapper">
            <img :src="getGameIcon(game || gameId || '')" :alt="displayTitle" class="game-icon-img"/>
          </div>
          <div class="game-titles">
            <div
              class="game-title"
              :class="{
                AS: displayTitle === 'Genshin Impact',
                BS: displayTitle === 'Honkai: Star Rail',
                CS: displayTitle === 'Zenless Zone Zero',
                DS: displayTitle ? ![
                  'Genshin Impact',
                  'Honkai: Star Rail',
                  'Zenless Zone Zero',
                ].includes(displayTitle) : false,
              }"
            >
              {{ displayTitle }}
            </div>
            <div v-if="subtitle" class="game-subtitle">{{ subtitle }}</div>
            <div class="version-count">{{ versions.length }} version{{ versions.length !== 1 ? 's' : '' }}</div>
          </div>
        </div>

      </v-card-title>

      <v-divider class="game-divider" />

      <v-card-text class="game-card-body">
        <div class="versions-list">
          <VersionCard
            v-for="v in versions"
            :key="v._id || v.id"
            :version="v"
            :color="color"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import VersionCard from "../version/VersionCard.vue";
import { useGameConfig } from '../../composables/game';

const props = defineProps<{
  game?: string;
  gameId?: string;
  title?: string;
  subtitle?: string;
  color?: string;
  versions: any[];
  hideAddButton?: boolean;
}>();

const emit = defineEmits<{
  add: [game: string];
  edit: [version: any];
  delete: [id: string];
}>();

const { getGameIcon } = useGameConfig();

// ensure displayTitle is always a string (avoids template type errors when used in .includes)
const displayTitle = computed<string>(() => {
  return props.title || props.game || props.gameId || ''
});

</script>
