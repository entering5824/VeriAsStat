<template>
  <transition name="fade">
    <div v-if="show" class="loading-overlay">
      <div class="loading-container">
        <img src="/images/loading.png" alt="Loading..." class="loading-image">
        <p class="loading-text">Đang tải...</p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const show = ref(true) // ✅ Bắt đầu là true để hiển thị overlay trước

let timer: number

onMounted(() => {
  // ✅ Tự động ẩn sau 2s (mô phỏng hoàn tất tải)
  timer = window.setTimeout(() => {
    show.value = false
  }, 2000)
})

onBeforeUnmount(() => {
  clearTimeout(timer)
})
</script>

<style scoped src="../assets/styles/pages/loading.css"></style>
