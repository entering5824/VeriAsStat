<template>
  <v-card class="character-form-card">
    <v-toolbar class="character-form-header" density="compact">
      <v-toolbar-title class="text-subtitle-1" style="font-weight: 500;">
        {{ form.game ? `Thông tin: ${getGameTitle(form.game)}` : 'Thông tin cơ bản' }}
      </v-toolbar-title>
    </v-toolbar>
    
    <v-divider />
    
    <v-card-text class="character-form-content">
      <v-row>
        <v-col cols="12">
          <v-select
            v-model="form.game"
            :items="games"
            label="Chọn Game"
            item-title="title"
            item-value="value"
            variant="filled"
            density="comfortable"
            hide-details="auto"
            :rules="[rules.required]"
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            v-model="form.name"
            label="Tên nhân vật"
            :rules="[rules.required]"
            variant="filled"
            density="comfortable"
            hide-details="auto"
            clearable
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-autocomplete
            v-model="form.element"
            :items="elementOptions"
            :label="elementLabel"
            variant="filled"
            density="comfortable"
            hide-details="auto"
            clearable
            :disabled="!form.game"
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-select
            v-model.number="form.rarity"
            :items="[4, 5]"
            label="Rarity"
            variant="filled"
            density="comfortable"
            hide-details="auto"
            clearable
            :rules="[rules.required]"
          />
        </v-col>

        <v-col cols="12" sm="6">
          <v-text-field
            v-model.number="form.tier"
            label="Tier Score"
            type="number"
            min="0"
            max="100"
            step="0.1"
            variant="filled"
            density="comfortable"
            hide-details="auto"
            clearable
          />
        </v-col>

        <v-col cols="12">
          <div class="text-subtitle-2 mb-2">Role (Array)</div>
          <ArrayEditor
            v-model="form.role"
            label="Add role"
            placeholder="e.g. DPS, Support, SubDPS"
          />
        </v-col>

        <v-col cols="12">
          <div class="text-subtitle-2 mb-2">Role Tags (Array)</div>
          <ArrayEditor
            v-model="form.role_tags"
            label="Add role tag"
            placeholder="e.g. Lunar, Hydro, Off-field DPS"
          />
        </v-col>

        <v-col cols="12">
          <v-textarea
            v-model="form.skill_text"
            label="Skill Text / Description"
            rows="4"
            variant="filled"
            density="comfortable"
            hide-details="auto"
            placeholder="Mô tả kỹ năng và cơ chế của nhân vật"
          />
        </v-col>

        <v-col cols="12">
          <div class="text-subtitle-2 mb-2">Teammate (Array)</div>
          <v-autocomplete
            v-model="form.teammate"
            :items="teammateOptions"
            label="Select teammates"
            placeholder="Type to search characters"
            multiple
            chips
            closable-chips
            variant="filled"
            density="comfortable"
            hide-details="auto"
            :loading="loadingCharacters"
            :disabled="!form.game"
            clearable
          >
            <template v-slot:no-data>
              <div class="pa-2">No characters found</div>
            </template>
          </v-autocomplete>
        </v-col>
      </v-row>

      <v-fade-transition>
        <div v-if="form.game" class="game-attributes-section">
          <v-row>
            <v-col v-if="form.game === 'GI'" cols="12">
              <v-select
                v-model="form.weaponType"
                :items="weaponOptionsGI"
                label="Loại vũ khí"
                variant="filled"
                density="comfortable"
                hide-details="auto"
                clearable
              />
            </v-col>

            <v-col v-else-if="form.game === 'HSR'" cols="12">
              <v-select
                v-model="form.path"
                :items="pathOptions"
                label="Vận mệnh (Path)"
                variant="filled"
                density="comfortable"
                hide-details="auto"
                clearable
              />
            </v-col>

            <v-col v-else-if="form.game === 'ZZZ'" cols="12">
              <v-select
                v-model="form.class"
                :items="classOptions"
                label="Hệ (Class)"
                variant="filled"
                density="comfortable"
                hide-details="auto"
                clearable
              />
            </v-col>
          </v-row>
        </div>
      </v-fade-transition>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch, onMounted } from 'vue'
import ArrayEditor from './ArrayEditor.vue'
import { characterService } from '../../services'
import type { Character } from '../../types/character'

export default defineComponent({
  name: 'CharacterBasicInfoForm',
  components: {
    ArrayEditor
  },
  props: {
    modelValue: {
      type: Object as () => Record<string, any>,
      required: true
    },
    mode: {
      type: String as () => 'create' | 'edit',
      default: 'create'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const loadingCharacters = ref(false)
    const availableCharacters = ref<Character[]>([])
    const games = [
      { title: 'Genshin Impact', value: 'GI' },
      { title: 'Honkai: Star Rail', value: 'HSR' },
      { title: 'Zenless Zone Zero', value: 'ZZZ' }
    ]

    const giElementOptions = ['Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo']
    const hsrElementOptions = ['Fire', 'Ice', 'Lightning', 'Wind', 'Quantum', 'Imaginary', 'Physical']
    const zzzElementOptions = ['Electro', 'Ether', 'Fire', 'Ice', 'Physical', 'Aurik Ink', 'Frost']

    const weaponOptionsGI = ['Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst']
    const pathOptions = ['The Destruction', 'The Hunt', 'Erudition', 'Harmony', 'Nihility', 'Preservation', 'Abundance']
    const classOptions = ['Anomaly', 'Attack', 'Defense', 'Stun', 'Support']

    const form = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const elementOptions = computed(() => {
      const game = form.value.game
      if (game === 'HSR') return hsrElementOptions
      if (game === 'ZZZ') return zzzElementOptions
      return giElementOptions
    })

    const elementLabel = computed(() => {
      if (form.value.game === 'HSR') return 'Combat Type'
      if (form.value.game === 'ZZZ') return 'Attribute'
      return 'Vision / Element'
    })

    const getGameTitle = (val: string) => {
      const g = games.find(x => x.value === val)
      return g ? g.title : val
    }

    const rules = {
      required: (v: any) => !!v || 'Bắt buộc'
    }

    // Load characters for teammate autocomplete
    const loadCharacters = async (game: string) => {
      if (!game) return
      loadingCharacters.value = true
      try {
        const chars = await characterService.getCharacters(game)
        // Exclude current character name when editing
        const currentName = props.mode === 'edit' ? form.value.name : null
        availableCharacters.value = chars.filter((c: Character) => 
          c.name !== currentName
        )
      } catch (error) {
        console.error('Failed to load characters for teammate autocomplete:', error)
        availableCharacters.value = []
      } finally {
        loadingCharacters.value = false
      }
    }

    const teammateOptions = computed(() => {
      return availableCharacters.value.map((c: Character) => c.name)
    })

    // Watch game changes to reload characters
    watch(() => form.value.game, (newGame) => {
      if (newGame) {
        loadCharacters(newGame)
      }
    }, { immediate: true })

    // Reload when mode changes to edit
    watch(() => props.mode, () => {
      if (form.value.game) {
        loadCharacters(form.value.game)
      }
    })

    onMounted(() => {
      if (form.value.game) {
        loadCharacters(form.value.game)
      }
    })

    return {
      form,
      games,
      elementOptions,
      weaponOptionsGI,
      pathOptions,
      classOptions,
      rules,
      elementLabel,
      getGameTitle,
      teammateOptions,
      loadingCharacters
    }
  }
})
</script>

<style scoped src="../../assets/styles/components/CharacterBasicInfoForm.css"></style>
