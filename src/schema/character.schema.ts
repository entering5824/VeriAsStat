import { z } from 'zod'

/**
 * Zod schema for validating character JSON data
 * Matches the structure in public/data/{game}/characters.json
 */

// Schema for section items (weapons, artifacts, etc.)
export const SectionItemSchema = z.object({
  rank: z.number().int().positive().optional(),
  name: z.string().optional(),
  note: z.string().optional(),
  slot: z.string().optional(),
  stat: z.string().optional(),
  sets: z.array(
    z.object({
      name: z.string(),
      pieces: z.number().int().positive()
    })
  ).optional()
})

// Schema for sections (weapons, artifacts, materials, stats, etc.)
export const SectionSchema = z.object({
  key: z.string(),
  title: z.string().optional(),
  type: z.enum(['ranked-list', 'list', 'material-grid', 'stat-grid']).optional(),
  items: z.array(SectionItemSchema).optional().default([])
})

// Schema for character object (nested in the main structure)
export const CharacterObjectSchema = z.object({
  name: z.string(),
  avatar: z.string().optional(),
  tags: z.array(
    z.object({
      key: z.string(),
      label: z.string()
    })
  ).optional(),
  iconPath: z.string().optional(),
  splashPath: z.string().optional(),
  element: z.string().optional(),
  weapon_type: z.string().optional(),
  weaponType: z.string().optional(),
  role: z.union([z.string(), z.array(z.string())]).optional(),
  skill_text: z.string().nullable().optional(),
  rarity: z.number().int().positive().optional(),
  tier: z.number().optional()
})

// Schema for stats objects (can have null values)
const StatsSchema = z.record(z.string(), z.number().nullable())

// Schema for graduation stats (can be nested by game)
const GraduationStatsSchema = z.union([
  z.record(z.string(), z.number().nullable()),
  z.record(z.string(), z.record(z.string(), z.number().nullable()))
])

// Schema for sub stats (nested by game)
const SubStatsSchema = z.record(z.string(), z.record(z.string(), z.number().nullable()))

// Main character entry schema (what's in the JSON array)
export const CharacterEntrySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  character: CharacterObjectSchema,
  base_stats: StatsSchema.optional(),
  graduation_stats: GraduationStatsSchema.optional(),
  sub_stats: SubStatsSchema.optional(),
  sections: z.array(SectionSchema).optional().default([])
})

// Schema for the entire characters.json file (array of character entries)
export const CharactersFileSchema = z.array(CharacterEntrySchema)

/**
 * Validate and sanitize character data
 * Returns valid characters and logs invalid ones
 * 
 * @param data - Raw JSON data to validate
 * @returns Array of valid character entries
 */
export function validateCharacters(data: unknown): z.infer<typeof CharacterEntrySchema>[] {
  const result = CharactersFileSchema.safeParse(data)
  
  if (result.success) {
    return result.data
  }
  
  // If the root is not an array, try to parse individual entries
  if (Array.isArray(data)) {
    const validEntries: z.infer<typeof CharacterEntrySchema>[] = []
    const errors: string[] = []
    
    data.forEach((item, index) => {
      const entryResult = CharacterEntrySchema.safeParse(item)
      
      if (entryResult.success) {
        validEntries.push(entryResult.data)
      } else {
        const id = (item as any)?.id || `index-${index}`
        errors.push(`Invalid character entry at index ${index} (id: ${id}): ${entryResult.error.message}`)
        console.warn(`Skipping invalid character entry:`, entryResult.error.format())
      }
    })
    
    if (errors.length > 0) {
      console.warn(`Found ${errors.length} invalid character entries out of ${data.length} total`)
    }
    
    return validEntries
  }
  
  // If data is not an array, return empty array
  console.error('Invalid characters data: expected array, got', typeof data)
  return []
}

