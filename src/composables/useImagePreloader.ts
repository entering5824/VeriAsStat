interface PreloadOptions {
  timeout?: number
  continueOnError?: boolean
}

export function useImagePreloader() {
  const preloadImage = (src: string, options: PreloadOptions = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const timeout = options.timeout || 10000
      
      const timeoutId = setTimeout(() => {
        if (options.continueOnError) {
          resolve()
        } else {
          reject(new Error(`Image preload timeout: ${src}`))
        }
      }, timeout)
      
      img.onload = () => {
        clearTimeout(timeoutId)
        resolve()
      }
      
      img.onerror = () => {
        clearTimeout(timeoutId)
        if (options.continueOnError) {
          resolve()
        } else {
          reject(new Error(`Failed to load image: ${src}`))
        }
      }
      
      img.src = src
    })
  }
  
  const preloadImages = async (sources: string[], options: PreloadOptions = {}): Promise<void> => {
    const promises = sources.map(src => preloadImage(src, options))
    await Promise.allSettled(promises)
  }
  
  const preloadImagesFromSelector = async (selector: string, options: PreloadOptions = {}): Promise<void> => {
    if (typeof document === 'undefined') return
    
    const images = document.querySelectorAll<HTMLImageElement>(selector)
    const sources = Array.from(images)
      .map(img => img.src || img.getAttribute('src'))
      .filter((src): src is string => !!src)
    
    if (sources.length > 0) {
      await preloadImages(sources, options)
    }
  }
  
  return {
    preloadImage,
    preloadImages,
    preloadImagesFromSelector
  }
}

