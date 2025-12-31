import { ref, onUnmounted } from 'vue'

interface AudioOptions {
  volume?: number
  loop?: boolean
  autoplay?: boolean
}

export function useAudio(src: string, options: AudioOptions = {}) {
  const audio = ref<HTMLAudioElement | null>(null)
  const isPlaying = ref(false)
  const { volume = 1, loop = false, autoplay = false } = options

  const initAudio = () => {
    if (!audio.value) {
      audio.value = new Audio(src)
      audio.value.volume = volume
      audio.value.loop = loop
      
      if (autoplay) {
        audio.value.play().catch(err => {
          console.warn('Autoplay prevented:', err)
        })
      }
    }
  }

  const play = () => {
    if (!audio.value) {
      initAudio()
    }
    if (audio.value) {
      audio.value.play().then(() => {
        isPlaying.value = true
      }).catch(err => {
        console.warn('Failed to play audio:', err)
      })
    }
  }

  const pause = () => {
    if (audio.value) {
      audio.value.pause()
      isPlaying.value = false
    }
  }

  const stop = () => {
    if (audio.value) {
      audio.value.pause()
      audio.value.currentTime = 0
      isPlaying.value = false
    }
  }

  const setVolume = (vol: number) => {
    if (audio.value) {
      audio.value.volume = Math.max(0, Math.min(1, vol))
    }
  }

  // Initialize on mount
  initAudio()

  // Cleanup on unmount
  onUnmounted(() => {
    if (audio.value) {
      audio.value.pause()
      audio.value = null
    }
  })

  return {
    audio,
    isPlaying,
    play,
    pause,
    stop,
    setVolume
  }
}

