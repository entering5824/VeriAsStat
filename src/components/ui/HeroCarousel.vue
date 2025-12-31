<template>
  <section
    class="hero-carousel"
    role="region"
    aria-label="Điểm nhấn cộng đồng"
    tabindex="0"
    @keydown.left.prevent="prev"
    @keydown.right.prevent="next"
    @mouseenter="pauseAutoplay"
    @mouseleave="resumeAutoplay"
  >
    <article
      v-for="(slide, index) in slides"
      :key="index"
      class="slide"
      :class="{ active: current === index }"
      aria-hidden="true"
    >
      <img :src="slide.image" alt="" class="slide-bg" loading="lazy" />
      <div class="overlay" />
      <div class="content">
        <div class="game-info">
          <img :src="slide.icon" :alt="slide.category" class="game-icon" loading="lazy" />
          <span class="game-name">{{ slide.category }}</span>
        </div>
        <h2 class="title">{{ slide.title }}</h2>
        <p class="desc">{{ slide.description }}</p>
        <div class="cta-row">
          <button class="btn primary">Xem thêm</button>
          <button class="btn ghost" @click.stop="next">Lịch cập nhật</button>
        </div>
      </div>
    </article>

    <div class="carousel-controls" aria-label="Điều khiển slide">
      <button class="control-btn" @click="prev" aria-label="Slide trước">
        <span aria-hidden="true">‹</span>
      </button>
      <div class="carousel-progress">
        <span
          v-for="(_, i) in slides"
          :key="i"
          class="progress-step"
        >
          <span class="progress-fill" :style="{ width: getProgressWidth(i) + '%' }" />
        </span>
      </div>
      <button class="control-btn" @click="next" aria-label="Slide kế tiếp">
        <span aria-hidden="true">›</span>
      </button>
    </div>
  </section>
</template>


<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const slides = [
    {
    image: '/images/gi.jpeg',
    icon: '/images/gi_icon.jpeg',
    category: 'Genshin Impact',
    title: 'Thế giới mở kỳ ảo với nguyên tố và phiêu lưu bất tận',
    description: 'Khám phá lục địa Teyvat, điều khiển nhiều nhân vật và khai thác sức mạnh nguyên tố trong cuộc hành trình tìm kiếm người thân thất lạc.'
  },
  {
    image: '/images/hsr.jpg',
    icon: '/images/hsr_icon.png',
    category: 'Honkai: Star Rail',
    title: 'Cuộc phiêu lưu vũ trụ trên con tàu Astral Express',
    description: 'Bước vào hành trình xuyên ngân hà, chiến đấu theo lượt cùng những người bạn để khám phá bí ẩn của Stellaron.'
  },

  {
    image: '/images/zzz.jpg',
    icon: '/images/zzz_icon.png',
    category: 'Zenless Zone Zero',
    title: 'Hành động nhịp độ cao giữa thế giới hậu tận thế',
    description: 'Trở thành Proxy tại thành phố New Eridu, chiến đấu phong cách và khám phá những khu vực đầy hỗn loạn gọi là Hollows.'
  }
]

const current = ref(0)
const progressValue = ref(0)
const AUTOPLAY_INTERVAL = 7000
const PROGRESS_TICK = 120
let slideTimer: ReturnType<typeof setInterval> | null = null
let progressTimer: ReturnType<typeof setInterval> | null = null
let isPaused = false

const stopAutoplay = () => {
  if (slideTimer) {
    clearInterval(slideTimer)
    slideTimer = null
  }
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
}

const startAutoplay = (preserveProgress = false) => {
  stopAutoplay()
  if (!preserveProgress) {
    progressValue.value = 0
  }
  slideTimer = setInterval(() => {
    next()
  }, AUTOPLAY_INTERVAL)

  progressTimer = setInterval(() => {
    progressValue.value = Math.min(progressValue.value + (100 / (AUTOPLAY_INTERVAL / PROGRESS_TICK)), 100)
  }, PROGRESS_TICK)
}

const goTo = (index: number) => {
  current.value = (index + slides.length) % slides.length
  progressValue.value = 0
  startAutoplay()
}

const next = () => {
  goTo(current.value + 1)
}

const prev = () => {
  goTo(current.value - 1)
}

const getProgressWidth = (index: number) => {
  if (index < current.value) return 100
  if (index > current.value) return 0
  return progressValue.value
}

const pauseAutoplay = () => {
  isPaused = true
  stopAutoplay()
}

const resumeAutoplay = () => {
  if (!isPaused) return
  isPaused = false
  startAutoplay(true)
}

onMounted(() => {
  startAutoplay()
})

onBeforeUnmount(() => {
  stopAutoplay()
})
</script>


