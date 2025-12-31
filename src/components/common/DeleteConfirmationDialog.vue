<template>
  <v-dialog v-model="localVisible" width="400" persistent>
    <v-card>
      <v-card-title class="text-h6">
        Xác nhận xóa
      </v-card-title>
      <v-card-text>
        <p>{{ message }}</p>
        <p class="text-caption text-medium-emphasis mt-2">
          Hành động này không thể hoàn tác.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="handleCancel">
          Hủy
        </v-btn>
        <v-btn color="error" @click="handleConfirm" :loading="deleting">
          Xóa
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'DeleteConfirmationDialog',
  props: {
    visible: { type: Boolean as PropType<boolean>, required: true },
    message: { type: String as PropType<string>, default: 'Bạn có chắc chắn muốn xóa mục này?' }
  },
  emits: ['confirm', 'cancel', 'close'],
  setup(props, { emit }) {
    const localVisible = ref(props.visible)
    const deleting = ref(false)

    watch(() => props.visible, (v) => (localVisible.value = v))
    watch(() => localVisible.value, (v) => { if (!v) emit('close') })

    const handleConfirm = async () => {
      deleting.value = true
      try {
        emit('confirm')
        localVisible.value = false
      } finally {
        deleting.value = false
      }
    }

    const handleCancel = () => {
      emit('cancel')
      localVisible.value = false
    }

    return {
      localVisible,
      deleting,
      handleConfirm,
      handleCancel,
    }
  }
})
</script>

