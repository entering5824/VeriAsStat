<template>
  <div class="version-column">
    <v-card class="pa-0 column-card" outlined>
      <div class="column-accent" v-if="color" :style="{ background: `linear-gradient(180deg, ${color}, rgba(0,0,0,0.06))` }"></div>
      <div class="column-header" :style="{ background: 'transparent' }">
        <div class="header-content">
          <div>
            <div class="text-h6 column-title" :style="{ fontFamily: 'Roboto, sans-serif' }">{{ title }}</div>
            <div class="text-caption muted column-sub">{{ subtitle }}</div>
          </div>
          <div>
            <v-btn class="add-circle" small icon @click.stop="$emit('add', gameId)" :style="color ? { background: color } : {}">
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </div>
        </div>
        <div class="header-bar" :style="color ? { background: color } : {}"></div>
      </div>

      <v-card-text class="versions-list">
        <div v-if="versions && versions.length">
          <VersionCard
            v-for="v in versions"
            :key="v._id || v.id"
            :version="v"
            :color="color"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
          />
        </div>
        <div v-else class="text-center muted pa-4">No versions yet</div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import VersionCard from './VersionCard.vue'

export default defineComponent({
  name: 'VersionColumn',
  components: { VersionCard },
  props: {
    gameId: { type: String, default: '' },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    versions: { type: Array as any, default: () => [] },
    color: { type: String, default: '' }
  },
  emits: ['add', 'edit', 'delete']
})
</script>

