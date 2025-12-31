/**
 * Type definitions for the application
 */

export interface GameVersion {
  _id?: string;
  id?: string;
  game: string;
  version: string;
  release_date?: string;
  releaseDate?: string;
  description?: string;
  event_region_main?: string;
  status?: string;
  characters_rateup?: Array<{ name: string; rarity: string; imageUrlIcon?: string; imageUrlSplash?: string }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
}

// Re-export all types from other modules
export * from './common'
export * from './artifact'
export * from './character'
export * from './weapon'
export * from './buildGuide'
export * from './fitScore'

