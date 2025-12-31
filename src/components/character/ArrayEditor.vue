<template>
  <div>
    <div v-if="items.length > 0" class="mb-2">
      <v-chip
        v-for="(item, index) in items"
        :key="index"
        class="ma-1"
        closable
        @click:close="removeItem(index)"
      >
        {{ item }}
      </v-chip>
    </div>
    <v-row>
      <v-col cols="12" sm="8">
        <v-text-field
          v-model="newItem"
          :label="label"
          :placeholder="placeholder"
          @keyup.enter="addItem"
          hide-details="auto"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-btn color="primary" block @click="addItem" :disabled="!newItem.trim()">
          Thêm
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'ArrayEditor',
  props: {
    modelValue: {
      type: Array as PropType<string[]>,
      default: () => []
    },
    label: {
      type: String,
      default: 'Add item'
    },
    placeholder: {
      type: String,
      default: 'Enter item'
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const items = ref<string[]>([...props.modelValue])
    const newItem = ref('')

    watch(() => props.modelValue, (newVal) => {
      items.value = [...newVal]
    }, { deep: true })

    const addItem = () => {
      const trimmed = newItem.value.trim()
      if (trimmed && !items.value.includes(trimmed)) {
        items.value.push(trimmed)
        emit('update:modelValue', items.value)
        newItem.value = ''
      }
    }

    const removeItem = (index: number) => {
      items.value.splice(index, 1)
      emit('update:modelValue', items.value)
    }

    return {
      items,
      newItem,
      addItem,
      removeItem,
    }
  }
})
</script>

