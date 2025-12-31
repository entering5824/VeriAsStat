/**
 * Migration script: Convert parser output.json → public/data/{game}/artifact-sets.json
 * 
 * Usage:
 *   ts-node scripts/migrate-artifact-sets.ts --input output.json --game ZZZ
 *   ts-node scripts/migrate-artifact-sets.ts --input output.json --game GI --output public/data/gi/artifact-sets.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface ArtifactSet {
  name: string
  game?: 'GI' | 'HSR' | 'ZZZ'
  '2pc_bonus': any
  '4pc_bonus'?: any[]
  raw_2pc: string
  raw_4pc?: string
  no_stack_passive?: boolean
}

function parseArgs() {
  const args = process.argv.slice(2)
  const parsed: { input?: string; output?: string; game?: string } = {}
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--input' || args[i] === '-i') {
      parsed.input = args[++i]
    } else if (args[i] === '--output' || args[i] === '-o') {
      parsed.output = args[++i]
    } else if (args[i] === '--game' || args[i] === '-g') {
      parsed.game = args[++i]
    }
  }
  
  return parsed
}

function getOutputPath(game: string): string {
  const gameLower = game.toLowerCase()
  const projectRoot = resolve(__dirname, '..')
  return resolve(projectRoot, `public/data/${gameLower}/artifact-sets.json`)
}

function main() {
  const args = parseArgs()
  
  if (!args.input) {
    console.error('Error: --input is required')
    console.error('Usage: ts-node scripts/migrate-artifact-sets.ts --input output.json --game ZZZ')
    process.exit(1)
  }
  
  const game = args.game?.toUpperCase() || 'GI'
  const inputPath = resolve(process.cwd(), args.input)
  const outputPath = args.output 
    ? resolve(process.cwd(), args.output)
    : getOutputPath(game)
  
  console.log(`Reading from: ${inputPath}`)
  console.log(`Writing to: ${outputPath}`)
  console.log(`Game: ${game}`)
  
  try {
    // Read input JSON
    const inputContent = readFileSync(inputPath, 'utf-8')
    const sets: ArtifactSet[] = JSON.parse(inputContent)
    
    if (!Array.isArray(sets)) {
      throw new Error('Input JSON must be an array of artifact sets')
    }
    
    // Add game field to each set if not present
    const setsWithGame = sets.map(set => ({
      ...set,
      game: set.game || game as 'GI' | 'HSR' | 'ZZZ'
    }))
    
    // Filter by game if needed (in case input contains multiple games)
    const filteredSets = setsWithGame.filter(set => 
      (set.game || game) === game
    )
    
    console.log(`Found ${filteredSets.length} sets for ${game}`)
    
    // Ensure output directory exists
    const outputDir = dirname(outputPath)
    mkdirSync(outputDir, { recursive: true })
    
    // Write output
    writeFileSync(outputPath, JSON.stringify(filteredSets, null, 2), 'utf-8')
    
    console.log(`✓ Successfully migrated ${filteredSets.length} sets to ${outputPath}`)
    
    // Print summary
    const with4pc = filteredSets.filter(s => s['4pc_bonus'] && s['4pc_bonus'].length > 0).length
    console.log(`  - Sets with 4pc bonus: ${with4pc}`)
    console.log(`  - Sets with 2pc only: ${filteredSets.length - with4pc}`)
    
  } catch (error: any) {
    console.error('Error:', error.message)
    if (error.code === 'ENOENT') {
      console.error(`File not found: ${inputPath}`)
    }
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

