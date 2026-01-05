#!/usr/bin/env node
/**
 * Image Conversion Script
 * Converts PNG, JPEG, JPG images to WebP format
 * 
 * Usage:
 *   npm run convert:webp
 *   npm run convert:webp -- --dir=public/images/gi/characters
 *   npm run convert:webp -- --quality=85 --delete-original
 */

import { existsSync, readdirSync, statSync, unlinkSync } from 'fs'
import { join, dirname, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supported input formats
const SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.jpe']
const OUTPUT_FORMAT = '.webp'

interface ConvertOptions {
  dir?: string
  quality?: number
  deleteOriginal?: boolean
  skipExisting?: boolean
  recursive?: boolean
}

// Default options
const defaultOptions: Required<ConvertOptions> = {
  dir: join(__dirname, '../public/images'),
  quality: 85,
  deleteOriginal: false,
  skipExisting: true,
  recursive: true
}

/**
 * Convert a single image file to WebP
 */
async function convertImageToWebp(
  inputPath: string,
  options: Required<ConvertOptions>
): Promise<{ success: boolean; inputSize: number; outputSize: number; saved: number }> {
  const ext = extname(inputPath).toLowerCase()
  
  if (!SUPPORTED_FORMATS.includes(ext)) {
    return { success: false, inputSize: 0, outputSize: 0, saved: 0 }
  }

  const outputPath = inputPath.replace(ext, OUTPUT_FORMAT)
  
  // Skip if WebP already exists and skipExisting is true
  if (options.skipExisting && existsSync(outputPath)) {
    const inputStats = statSync(inputPath)
    const outputStats = statSync(outputPath)
    return {
      success: true,
      inputSize: inputStats.size,
      outputSize: outputStats.size,
      saved: 0 // Already converted
    }
  }

  try {
    const inputStats = statSync(inputPath)
    const inputSize = inputStats.size

    // Convert to WebP
    await sharp(inputPath)
      .webp({ quality: options.quality })
      .toFile(outputPath)

    const outputStats = statSync(outputPath)
    const outputSize = outputStats.size
    const saved = inputSize - outputSize

    // Delete original if requested
    if (options.deleteOriginal) {
      unlinkSync(inputPath)
      console.log(`  ✓ Converted and deleted: ${basename(inputPath)} (saved ${formatBytes(saved)})`)
    } else {
      console.log(`  ✓ Converted: ${basename(inputPath)} → ${basename(outputPath)} (saved ${formatBytes(saved)})`)
    }

    return { success: true, inputSize, outputSize, saved }
  } catch (error) {
    console.error(`  ✗ Failed to convert ${basename(inputPath)}:`, error)
    return { success: false, inputSize: 0, outputSize: 0, saved: 0 }
  }
}

/**
 * Process a directory recursively
 */
async function processDirectory(
  dirPath: string,
  options: Required<ConvertOptions>
): Promise<{ converted: number; failed: number; totalSaved: number; totalInputSize: number; totalOutputSize: number }> {
  let converted = 0
  let failed = 0
  let totalSaved = 0
  let totalInputSize = 0
  let totalOutputSize = 0

  if (!existsSync(dirPath)) {
    console.error(`Directory does not exist: ${dirPath}`)
    return { converted, failed, totalSaved, totalInputSize, totalOutputSize }
  }

  const entries = readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name)

    if (entry.isDirectory() && options.recursive) {
      // Skip node_modules and other common ignore directories
      if (['node_modules', '.git', 'dist', 'build'].includes(entry.name)) {
        continue
      }
      const result = await processDirectory(fullPath, options)
      converted += result.converted
      failed += result.failed
      totalSaved += result.totalSaved
      totalInputSize += result.totalInputSize
      totalOutputSize += result.totalOutputSize
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase()
      if (SUPPORTED_FORMATS.includes(ext)) {
        const result = await convertImageToWebp(fullPath, options)
        if (result.success) {
          converted++
          totalSaved += result.saved
          totalInputSize += result.inputSize
          totalOutputSize += result.outputSize
        } else {
          failed++
        }
      }
    }
  }

  return { converted, failed, totalSaved, totalInputSize, totalOutputSize }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 0) return `+${formatBytes(-bytes)}`
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Parse command line arguments
 */
function parseArgs(): ConvertOptions {
  const args = process.argv.slice(2)
  const options: ConvertOptions = {}

  for (const arg of args) {
    if (arg.startsWith('--dir=')) {
      const dirPath = arg.split('=')[1]
      // Resolve relative paths from project root
      options.dir = dirPath.startsWith('/') || dirPath.match(/^[A-Za-z]:/)
        ? dirPath
        : join(__dirname, '..', dirPath)
    } else if (arg.startsWith('--quality=')) {
      const quality = parseInt(arg.split('=')[1], 10)
      if (quality >= 0 && quality <= 100) {
        options.quality = quality
      } else {
        console.warn(`Invalid quality value: ${quality}. Using default: ${defaultOptions.quality}`)
      }
    } else if (arg === '--delete-original') {
      options.deleteOriginal = true
    } else if (arg === '--no-skip-existing') {
      options.skipExisting = false
    } else if (arg === '--no-recursive') {
      options.recursive = false
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Image to WebP Converter

Usage:
  npm run convert:webp [options]

Options:
  --dir=<path>              Directory to process (default: public/images)
  --quality=<number>        WebP quality 0-100 (default: 85)
  --delete-original         Delete original files after conversion
  --no-skip-existing        Convert even if WebP already exists
  --no-recursive            Don't process subdirectories
  --help, -h                Show this help message

Examples:
  npm run convert:webp
  npm run convert:webp -- --dir=public/images/gi/characters
  npm run convert:webp -- --quality=90 --delete-original
      `)
      process.exit(0)
    }
  }

  return options
}

/**
 * Main function
 */
async function main() {
  const userOptions = parseArgs()
  const options: Required<ConvertOptions> = { ...defaultOptions, ...userOptions }

  console.log('🖼️  Image to WebP Converter\n')
  console.log(`Directory: ${options.dir}`)
  console.log(`Quality: ${options.quality}`)
  console.log(`Delete original: ${options.deleteOriginal ? 'Yes' : 'No'}`)
  console.log(`Skip existing: ${options.skipExisting ? 'Yes' : 'No'}`)
  console.log(`Recursive: ${options.recursive ? 'Yes' : 'No'}`)
  console.log('\nStarting conversion...\n')

  const startTime = Date.now()
  const result = await processDirectory(options.dir, options)
  const endTime = Date.now()
  const duration = ((endTime - startTime) / 1000).toFixed(2)

  console.log('\n' + '='.repeat(50))
  console.log('📊 Conversion Summary')
  console.log('='.repeat(50))
  console.log(`✅ Converted: ${result.converted} files`)
  console.log(`❌ Failed: ${result.failed} files`)
  console.log(`💾 Total size saved: ${formatBytes(result.totalSaved)}`)
  console.log(`📥 Total input size: ${formatBytes(result.totalInputSize)}`)
  console.log(`📤 Total output size: ${formatBytes(result.totalOutputSize)}`)
  if (result.totalInputSize > 0) {
    const compressionRatio = ((1 - result.totalOutputSize / result.totalInputSize) * 100).toFixed(1)
    console.log(`🗜️  Compression ratio: ${compressionRatio}%`)
  }
  console.log(`⏱️  Duration: ${duration}s`)
  console.log('='.repeat(50))
}

// Run the script
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
