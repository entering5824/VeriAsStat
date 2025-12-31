<template>
  <v-dialog v-model="localVisible" width="720" max-width="95vw" scrollable>
    <v-card class="version-modal-card">
      <v-toolbar class="version-modal-header" density="compact">
        <v-toolbar-title class="text-subtitle-1" style="font-weight: 500;">
          {{ editing ? 'Edit Version' : 'Create Version' }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon variant="text" size="small" @click="handleClose" aria-label="Close dialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      
      <v-divider />
      
      <v-card-text class="version-modal-content">
        <v-form ref="formRef" @submit.prevent="onSave">
          <v-progress-linear v-if="saving" indeterminate color="primary" height="3" class="mb-4" />
          
          <!-- Basic info -->
          <v-row>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.game"
                :items="games"
                label="Game"
                variant="filled"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                v-model="form.version"
                label="Version"
                variant="filled"
                density="comfortable"
                :rules="[rules.required]"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-select
                v-model="form.status"
                :items="statuses"
                label="Status"
                variant="filled"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.release_date"
                label="Release date"
                type="date"
                variant="filled"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.event_region_main"
                label="Event region (main)"
                variant="filled"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="Description"
                rows="3"
                auto-grow
                variant="filled"
                density="comfortable"
                hide-details="auto"
              />
            </v-col>
          </v-row>

          <div class="section-spacer" />

          <!-- Characters rate-up -->
          <v-row>
            <v-col cols="12">
              <div class="text-subtitle-1 mb-3" style="font-weight: 500;">Characters rate-up</div>
              <v-row class="align-center">
                <v-col cols="12" sm="7">
                  <v-autocomplete
                    v-model="newCharacterName"
                    :items="characterSuggestions"
                    label="Character name"
                    clearable
                    variant="filled"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6" sm="3">
                  <v-select
                    v-model="newCharacterRarity"
                    :items="rarityOptions"
                    label="Rarity"
                    variant="filled"
                    density="comfortable"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="6" sm="2">
                  <v-btn
                    color="primary"
                    block
                    @click="addCharacter"
                    :disabled="!newCharacterName || saving"
                    :loading="saving"
                  >
                    Add
                  </v-btn>
                </v-col>
              </v-row>

              <v-row v-if="charactersList.length" class="mt-3">
                <v-col cols="12" v-for="(c, idx) in charactersList" :key="idx">
                  <v-row class="align-center">
                    <v-col cols="12" sm="7">
                      <v-text-field
                        v-model="c.name"
                        label="Name"
                        variant="filled"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>
                    <v-col cols="10" sm="3">
                      <v-select
                        v-model="c.rarity"
                        :items="rarityOptions"
                        label="Rarity"
                        variant="filled"
                        density="comfortable"
                        hide-details="auto"
                      />
                    </v-col>
                    <v-col cols="2" sm="2">
                      <v-btn
                        icon="mdi-delete"
                        color="error"
                        variant="text"
                        size="small"
                        @click="removeCharacter(idx)"
                        :disabled="saving"
                        aria-label="Remove character"
                      />
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
              <div v-else class="text-caption text-medium-emphasis mt-2">No characters added yet.</div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-divider />
      
      <v-card-actions class="version-modal-actions">
        <v-spacer />
        <v-btn
          variant="text"
          @click="handleClose"
          :disabled="saving"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          @click="onSave"
          :loading="saving"
          :disabled="saving"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, ref, computed, onMounted } from 'vue'
import type { PropType } from 'vue'
import { characterService } from '../../services'
import type { Character } from '../../types/character'

export default defineComponent({
  props: {
    visible: { type: Boolean as PropType<boolean>, required: true },
    model: { type: Object as PropType<any>, default: null }
  },
  emits: ['save', 'close'],
  setup(props, { emit }) {
    const localVisible = ref(props.visible)
    const formRef = ref(null)
    const games = ['GI', 'HSR', 'ZZZ']
    const statuses = ['leak', 'confirmed', 'gone', 'no information']
    const form = reactive({ 
      game: 'GI', 
      version: '', 
      release_date: '', 
      description: '',
      event_region_main: '',
      status: 'leak',
      characters_rateup: [] as { name: string; rarity: string }[]
    })
    // Improved inputs
  const rarityOptions = ['5', '4', '5(rerun)', '4(rerun)']
    const allCharacters = ref<Character[]>([])
    const characterSuggestions = computed(() => {
      if (allCharacters.value.length === 0) return []
      const gameFilter = form.game || 'GI'
      return allCharacters.value
        .filter((char: any) => String(char.game || '').toUpperCase() === gameFilter.toUpperCase())
        .map((char: any) => String(char.name || '').trim())
        .filter((name: string) => name.length > 0)
        .sort()
    })
  const charactersList = ref<{ name: string; rarity: string }[]>([])
    const newCharacterName = ref('')
  const newCharacterRarity = ref('5')
    const saving = ref(false)

    // Load characters on mount for suggestions
    // Fetches characters for all games and merges them
    onMounted(async () => {
      try {
        const [giChars, hsrChars, zzzChars] = await Promise.all([
          characterService.getCharacters('GI').catch(() => []),
          characterService.getCharacters('HSR').catch(() => []),
          characterService.getCharacters('ZZZ').catch(() => [])
        ])
        allCharacters.value = [...giChars, ...hsrChars, ...zzzChars]
      } catch (error) {
        console.error('Error loading characters for suggestions:', error)
      }
    })

    watch(() => props.visible, (v) => (localVisible.value = v))
    watch(() => localVisible.value, (v) => { if (!v) emit('close') })

    const editing = ref(false)

    watch(
      () => props.model,
      (v) => {
        editing.value = !!v
        if (v) {
          form.game = v.game || 'GI'
          form.version = v.version || ''
          form.release_date = v.release_date ? v.release_date.split('T')[0] : ''
          form.description = v.description || ''
           // type removed in new schema
           form.event_region_main = v.event_region_main || ''
          form.status = v.status || 'leak'
           
          // hydrate enhanced fields
          charactersList.value = Array.isArray(v.characters_rateup) ? [...v.characters_rateup] : []
        } else {
          form.game = 'GI'
          form.version = ''
          form.release_date = ''
          form.description = ''
          form.event_region_main = ''
          form.status = 'leak'
          form.characters_rateup = []
          charactersList.value = []
          newCharacterName.value = ''
          newCharacterRarity.value = '5'
        }
      },
      { immediate: true }
    )

    const addCharacter = () => {
      const name = (newCharacterName.value || '').trim()
      if (!name) return
      charactersList.value.push({ name, rarity: newCharacterRarity.value || '5' })
      newCharacterName.value = ''
      newCharacterRarity.value = '5'
    }

    const removeCharacter = (idx: number) => {
      charactersList.value.splice(idx, 1)
    }

    const handleClose = () => {
      localVisible.value = false
      emit('close')
    }

    const rules = {
      required: (v: any) => !!v || 'Bắt buộc'
    }

    const onSave = async () => {
      if (saving.value) return
      
      // Basic validation
      if (!form.game) {
        return
      }
      if (!form.version || !String(form.version).trim()) {
        return
      }

      saving.value = true
      try {
        emit('save', { 
          ...form,
          characters_rateup: charactersList.value.filter(c => c.name?.trim()),
        })
        localVisible.value = false
      } finally {
        saving.value = false
      }
    }

    return { 
      localVisible, 
      form, 
      onSave, 
      handleClose,
      editing, 
      games, 
      statuses,
      formRef,
      rules,
      // enhanced bindings
      rarityOptions,
      characterSuggestions,
      charactersList,
      newCharacterName,
      newCharacterRarity,
      saving,
      addCharacter,
      removeCharacter,
    }
  }
})
</script>


