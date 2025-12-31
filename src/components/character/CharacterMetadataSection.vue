<template>
  <v-card variant="tonal" class="pa-4">
    <div class="d-flex align-center justify-space-between">
      <div class="text-subtitle-1">Metadata</div>
      <v-chip size="x-small" color="primary" variant="tonal">Optional</v-chip>
    </div>

    <v-expansion-panels variant="accordion" class="mt-3">
      <v-expansion-panel>
        <v-expansion-panel-title>Identifiers</v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-row>
            <v-col cols="12" sm="6" v-if="isEdit">
              <v-text-field
                v-model="localForm.characterId"
                label="Character ID"
                readonly
                append-inner-icon="mdi-content-copy"
                @click:append-inner="copyId"
                hint="Read-only trong Edit mode"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="localForm.createdAt"
                label="Created At"
                type="date"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="localForm.updatedAt"
                label="Updated At"
                type="date"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'CharacterMetadataSection',
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
    const localForm = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val)
    })

    const isEdit = computed(() => props.mode === 'edit')

    const copyId = () => {
      if (!localForm.value.characterId) return
      navigator.clipboard?.writeText(String(localForm.value.characterId))
    }

    return {
      localForm,
      isEdit,
      copyId
    }
  }
})
</script>
