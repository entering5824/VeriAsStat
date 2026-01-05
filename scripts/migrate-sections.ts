/**
 * Migration Script for Section Types
 * Converts existing sections to new types: set-combination, stat-priority
 */

import { readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { resolve, join } from 'path'

interface SectionItem {
  rank?: number
  name?: string
  note?: string
  slot?: string
  stat?: string
  sets?: Array<{ name: string; pieces: number }>
  [key: string]: any
}

interface Section {
  key: string
  title?: string
  type?: string
  items?: SectionItem[] | string[]
}

interface CharacterEntry {
  _id?: number | string
  id?: string
  character: any
  sections?: Section[]
  [key: string]: any
}

const DRY_RUN = process.argv.includes('--dry-run')
const APPLY = process.argv.includes('--apply')

if (!DRY_RUN && !APPLY) {
  console.log('Usage: tsx scripts/migrate-sections.ts --dry-run | --apply')
  console.log('  --dry-run: Preview changes without modifying files')
  console.log('  --apply: Apply changes (creates backups first)')
  process.exit(1)
}

function getDataPath(filename: string): string {
  return resolve(process.cwd(), 'public', 'data', filename)
}

function readJsonFile<T>(filename: string): T[] {
  const filePath = getDataPath(filename)
  if (!existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`)
    return []
  }
  
  try {
    const content = readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(content)
    
    if (Array.isArray(parsed)) {
      return parsed as T[]
    }
    
    return []
  } catch (error: any) {
    console.error(`Error reading ${filename}:`, error.message)
    return []
  }
}

function writeJsonFile<T>(filename: string, data: T[]): void {
  const filePath = getDataPath(filename)
  const backupPath = `${filePath}.bak.${Date.now()}`
  
  // Create backup
  if (existsSync(filePath)) {
    const content = readFileSync(filePath, 'utf-8')
    writeFileSync(backupPath, content, 'utf-8')
    console.log(`Created backup: ${backupPath}`)
  }
  
  // Write new file
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`Wrote file: ${filePath}`)
}

/**
 * Normalize section items: ensure sets use { name, pieces } structure
 */
function normalizeSetItem(item: SectionItem): SectionItem {
  if (item.sets && Array.isArray(item.sets)) {
    const normalizedSets = item.sets.map(set => {
      if (typeof set === 'string') {
        // If set is a string, assume it's a name with default pieces (invalid, but handle gracefully)
        return { name: set, pieces: 4 }
      }
      if (typeof set === 'object' && set !== null) {
        // Ensure name and pieces exist
        return {
          name: set.name || String(set),
          pieces: typeof set.pieces === 'number' ? set.pieces : 4
        }
      }
      return { name: String(set), pieces: 4 }
    })
    return { ...item, sets: normalizedSets }
  }
  return item
}

/**
 * Migrate a section to new type if needed
 */
function migrateSection(section: Section): Section {
  const migrated = { ...section }
  
  // Normalize items first
  if (migrated.items && Array.isArray(migrated.items)) {
    // Normalize set items
    migrated.items = migrated.items.map(item => {
      if (typeof item === 'object' && item !== null) {
        return normalizeSetItem(item as SectionItem)
      }
      return item
    })
  }
  
  // Detect set-combination: section has sets[] in items
  // Note: Plan says to preserve ranked-list as supported type too
  if (migrated.type === 'ranked-list' && migrated.items?.some(item => {
    if (typeof item === 'object' && item !== null) {
      const sectionItem = item as SectionItem
      return sectionItem.sets && Array.isArray(sectionItem.sets) && sectionItem.sets.length > 0
    }
    return false
  })) {
    migrated.type = 'set-combination'
  }
  
  // Detect stat-priority: items are strings or have stat names
  if (migrated.items && migrated.items.length > 0) {
    const allHaveName = migrated.items.every(item => {
      if (typeof item === 'string') return true
      if (typeof item === 'object' && item !== null) {
        const sectionItem = item as SectionItem
        return sectionItem.name !== undefined || sectionItem.stat !== undefined
      }
      return false
    })
    
    // Only convert to stat-priority if items look like stat names (no sets, no slots)
    const hasSetsOrSlots = migrated.items.some(item => {
      if (typeof item === 'object' && item !== null) {
        const sectionItem = item as SectionItem
        return (sectionItem.sets && sectionItem.sets.length > 0) || sectionItem.slot !== undefined
      }
      return false
    })
    
    if (allHaveName && !hasSetsOrSlots && migrated.type !== 'stat-grid' && migrated.type !== 'set-combination') {
      // Convert string items to { name: string } objects
      migrated.items = migrated.items.map(item => {
        if (typeof item === 'string') {
          return { name: item }
        }
        if (typeof item === 'object' && item !== null) {
          const sectionItem = item as SectionItem
          // If it has a stat field but no name, use stat as name
          if (sectionItem.stat && !sectionItem.name) {
            return { ...sectionItem, name: sectionItem.stat }
          }
          return sectionItem
        }
        return item
      })
      
      // Only set type if it's not already a specific type
      if (!migrated.type || migrated.type === 'list') {
        migrated.type = 'stat-priority'
      }
    }
  }
  
  return migrated
}

function migrateCharacterFile(filename: string): { transformed: number; total: number } {
  console.log(`\nProcessing: ${filename}`)
  
  const characters = readJsonFile<CharacterEntry>(filename)
  let transformedCount = 0
  let totalSections = 0
  
  const migratedCharacters = characters.map(char => {
    if (!char.sections || char.sections.length === 0) {
      return char
    }
    
    totalSections += char.sections.length
    
    const migratedSections = char.sections.map(section => {
      const migrated = migrateSection(section)
      // Check if section was actually changed
      const originalStr = JSON.stringify(section)
      const migratedStr = JSON.stringify(migrated)
      if (originalStr !== migratedStr) {
        transformedCount++
        if (DRY_RUN) {
          console.log(`  Character ${char._id || char.id || 'unknown'}: Section "${section.key}" changed`)
          console.log(`    Type: ${section.type} -> ${migrated.type}`)
        }
      }
      return migrated
    })
    
    return {
      ...char,
      sections: migratedSections
    }
  })
  
  if (DRY_RUN) {
    console.log(`  Preview: ${transformedCount} sections would be transformed out of ${totalSections} total`)
  } else {
    writeJsonFile(filename, migratedCharacters)
    console.log(`  Transformed: ${transformedCount} sections out of ${totalSections} total`)
  }
  
  return { transformed: transformedCount, total: totalSections }
}

// Main execution
const gameFiles = [
  'gi/characters.json',
  'hsr/characters.json',
  'zzz/characters.json'
]

console.log(DRY_RUN ? '=== DRY RUN MODE ===' : '=== APPLY MODE ===')
console.log('Migrating section types in character files...\n')

let totalTransformed = 0
let totalSections = 0

for (const file of gameFiles) {
  const result = migrateCharacterFile(file)
  totalTransformed += result.transformed
  totalSections += result.total
}

console.log(`\n=== Summary ===`)
console.log(`Total sections transformed: ${totalTransformed} out of ${totalSections}`)
if (DRY_RUN) {
  console.log('\nRun with --apply to apply changes')
} else {
  console.log('\nMigration complete! Backups created with .bak.{timestamp} suffix')
}
