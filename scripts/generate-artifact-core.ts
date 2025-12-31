/**
 * Generate artifact-core.json from artifact sets
 * Creates artifact instances for each slot from each artifact set
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

interface ArtifactSet {
  name: string
  [key: string]: any
}

interface ArtifactCore {
  artifactId: string
  game: 'GI' | 'HSR' | 'ZZZ'
  slot: string
  rarity: number
  setId: string
  releaseVersion: string
  domainType: 'domain' | 'su' | 'hollow'
}

// Slot definitions
const GI_SLOTS = ['flower', 'plume', 'sands', 'goblet', 'circlet']
const HSR_RELIC_SLOTS = ['head', 'hands', 'body', 'feet']
const HSR_PLANAR_SLOTS = ['planarSphere', 'linkRope']
const ZZZ_SLOTS = ['disk1', 'disk2', 'disk3', 'disk4']

// Helper to normalize setId from name
function normalizeSetId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

// Generate artifact instances from sets
function generateArtifactsFromSets(
  sets: ArtifactSet[],
  game: 'GI' | 'HSR' | 'ZZZ',
  slots: string[],
  domainType: 'domain' | 'su' | 'hollow' = 'domain'
): ArtifactCore[] {
  const artifacts: ArtifactCore[] = []
  
  for (const set of sets) {
    const setId = normalizeSetId(set.name)
    
    for (const slot of slots) {
      const artifactId = `${game.toLowerCase()}_${setId}_${slot}`
      
      artifacts.push({
        artifactId,
        game,
        slot,
        rarity: 5, // Default to 5-star
        setId,
        releaseVersion: '1.0', // Default version
        domainType
      })
    }
  }
  
  return artifacts
}

// Main function
function main() {
  const publicDataPath = resolve(process.cwd(), 'public', 'data')
  
  // Load artifact sets
  const giSets = JSON.parse(
    readFileSync(resolve(publicDataPath, 'gi', 'artifacts.json'), 'utf-8')
  ) as ArtifactSet[]
  
  const hsrSets = JSON.parse(
    readFileSync(resolve(publicDataPath, 'hsr', 'relics.json'), 'utf-8')
  ) as ArtifactSet[]
  
  const zzzSets = JSON.parse(
    readFileSync(resolve(publicDataPath, 'zzz', 'disks.json'), 'utf-8')
  ) as ArtifactSet[]
  
  // Generate artifacts
  const giArtifacts = generateArtifactsFromSets(giSets, 'GI', GI_SLOTS, 'domain')
  const hsrRelicArtifacts = generateArtifactsFromSets(hsrSets, 'HSR', HSR_RELIC_SLOTS, 'domain')
  const hsrPlanarArtifacts = generateArtifactsFromSets(hsrSets, 'HSR', HSR_PLANAR_SLOTS, 'su')
  const zzzArtifacts = generateArtifactsFromSets(zzzSets, 'ZZZ', ZZZ_SLOTS, 'hollow')
  
  // Combine all artifacts
  const allArtifacts = [
    ...giArtifacts,
    ...hsrRelicArtifacts,
    ...hsrPlanarArtifacts,
    ...zzzArtifacts
  ]
  
  // Write to artifact-core.json
  const outputPath = resolve(publicDataPath, 'core', 'artifact-core.json')
  writeFileSync(outputPath, JSON.stringify(allArtifacts, null, 2), 'utf-8')
  
  console.log(`Generated ${allArtifacts.length} artifact instances:`)
  console.log(`  - GI: ${giArtifacts.length}`)
  console.log(`  - HSR Relics: ${hsrRelicArtifacts.length}`)
  console.log(`  - HSR Planar: ${hsrPlanarArtifacts.length}`)
  console.log(`  - ZZZ: ${zzzArtifacts.length}`)
  console.log(`\nWritten to: ${outputPath}`)
}

main()

