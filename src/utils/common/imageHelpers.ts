/**
 * Get image URL with WebP extension
 * Returns WebP path, browser will fallback to PNG if WebP not supported
 */
export function getImageUrlWithWebp(basePath: string): string {
  // Remove existing extension if present
  const cleanPath = basePath.replace(/\.(png|jpg|jpeg|webp)$/i, '')
  // Return WebP path (browser will handle fallback via <picture> or manual fallback)
  return `${cleanPath}.webp`
}

