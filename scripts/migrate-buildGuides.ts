/**
 * Migration Script for Build Guides
 * Transforms buildGuides to buildGuidesV2 with versioning fields
 */

import { readFileSync, writeFileSync, existsSync, statSync } from 'fs'
import { resolve, join } from 'path'
import { randomUUID } from 'crypto'

interface BuildGuide {
  game: 'GI' | 'HSR' | 'ZZZ'
  characterId: string
  title: string
  version?: string
  lastUpdated?: string
  author?: string
  _schemaVersion?: string
  [key: string]: any
}

interface Character {
  _id?: string
  id?: string
  name: string
  game: 'GI' | 'HSR' | 'ZZZ'
  buildGuides?: BuildGuide[]
  [key: string]: any
}

const DRY_RUN = process.argv.includes('--dry-run')
const APPLY = process.argv.includes('--apply')

if (!DRY_RUN && !APPLY) {
  console.log('Usage: node scripts/migrate-buildGuides.ts --dry-run | --apply')
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

function migrateBuildGuide(buildGuide: BuildGuide, fileMtime: Date): BuildGuide {
  // Skip if already migrated (idempotent)
  if (buildGuide._schemaVersion === 'v2') {
    return buildGuide
  }
  
  const migrated: BuildGuide = {
    ...buildGuide,
    version: buildGuide.version || 'unknown',
    lastUpdated: buildGuide.lastUpdated || fileMtime.toISOString(),
    author: buildGuide.author || 'migrator',
    _schemaVersion: 'v2'
  }
  
  return migrated
}

function migrateCharacterFile(filename: string): { transformed: number; total: number } {
  console.log(`\nProcessing: ${filename}`)
  
  const characters = readJsonFile<Character>(filename)
  let transformedCount = 0
  let totalGuides = 0
  
  const migratedCharacters = characters.map(char => {
    if (!char.buildGuides || char.buildGuides.length === 0) {
      return char
    }
    
    totalGuides += char.buildGuides.length
    
    // Get file mtime for lastUpdated
    const filePath = getDataPath(filename)
    const stats = existsSync(filePath) ? statSync(filePath) : null
    const fileMtime = stats ? stats.mtime : new Date()
    
    const migratedGuides = char.buildGuides.map(guide => {
      const migrated = migrateBuildGuide(guide, fileMtime)
      if (JSON.stringify(migrated) !== JSON.stringify(guide)) {
        transformedCount++
      }
      return migrated
    })
    
    return {
      ...char,
      buildGuides: migratedGuides
    }
  })
  
  console.log(`  Total characters: ${characters.length}`)
  console.log(`  Total build guides: ${totalGuides}`)
  console.log(`  Guides to transform: ${transformedCount}`)
  
  if (APPLY && transformedCount > 0) {
    writeJsonFile(filename, migratedCharacters)
    console.log(`  ✓ Applied changes`)
  } else if (DRY_RUN) {
    console.log(`  [DRY RUN] Would transform ${transformedCount} guides`)
    
    // Show sample transformation
    if (transformedCount > 0) {
      const sampleChar = migratedCharacters.find(c => c.buildGuides && c.buildGuides.length > 0)
      if (sampleChar && sampleChar.buildGuides) {
        console.log(`\n  Sample transformation:`)
        console.log(`  Before:`, JSON.stringify(sampleChar.buildGuides[0], null, 2))
        console.log(`  After:`, JSON.stringify(sampleChar.buildGuides[0], null, 2))
      }
    }
  }
  
  return { transformed: transformedCount, total: totalGuides }
}

function main() {
  console.log('Build Guide Migration Script')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'APPLY'}`)
  console.log('=' .repeat(50))
  
  const characterFiles = [
    'characters/gi/characters.json',
    'characters/hsr/characters.json',
    'characters/zzz/characters.json'
  ]
  
  let totalTransformed = 0
  let totalGuides = 0
  
  for (const filename of characterFiles) {
    const result = migrateCharacterFile(filename)
    totalTransformed += result.transformed
    totalGuides += result.total
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('Summary:')
  console.log(`  Total build guides processed: ${totalGuides}`)
  console.log(`  Guides transformed: ${totalTransformed}`)
  
  if (DRY_RUN) {
    console.log('\n[DRY RUN] No files were modified.')
    console.log('Run with --apply to apply changes.')
  } else if (APPLY) {
    console.log('\n✓ Migration completed. Backups created.')
  }
}

main()

