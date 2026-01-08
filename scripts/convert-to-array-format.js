#!/usr/bin/env node

/**
 * Convert characters.json from { characters: [...] } to [...] format
 * Usage: node scripts/convert-to-array-format.js [game] [inputFile] [outputFile]
 * 
 * If no arguments provided, converts all games in public/data/ directory
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const GAMES = ['GI', 'HSR', 'ZZZ'];

/**
 * Convert a single file from { characters: [...] } to [...]
 */
function convertFile(inputPath, outputPath) {
    console.log(`Converting: ${inputPath}`);
    
    if (!fs.existsSync(inputPath)) {
        console.error(`  ✗ File not found: ${inputPath}`);
        return false;
    }
    
    try {
        const content = fs.readFileSync(inputPath, 'utf-8');
        const data = JSON.parse(content);
        
        let characters = [];
        
        // Handle both formats
        if (Array.isArray(data)) {
            // Already array format
            characters = data;
            console.log(`  ℹ Already in array format`);
        } else if (data && typeof data === 'object' && Array.isArray(data.characters)) {
            // Old format: { characters: [...] }
            characters = data.characters;
            console.log(`  ✓ Converted from { characters: [...] } format`);
        } else {
            console.error(`  ✗ Invalid format: expected array or { characters: [...] }`);
            return false;
        }
        
        // Create backup
        const backupPath = `${inputPath}.backup.${Date.now()}`;
        fs.copyFileSync(inputPath, backupPath);
        console.log(`  ✓ Backup created: ${backupPath}`);
        
        // Write new format (array directly)
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        fs.writeFileSync(outputPath, JSON.stringify(characters, null, 2), 'utf-8');
        console.log(`  ✓ Wrote ${characters.length} characters to ${outputPath}`);
        
        return true;
    } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        return false;
    }
}

/**
 * Convert all games in data directory
 */
function convertAllGames() {
    console.log('Converting all character files to array format...\n');
    
    let successCount = 0;
    let failCount = 0;
    
    for (const game of GAMES) {
        const filePath = path.join(DATA_DIR, game, 'characters.json');
        
        if (fs.existsSync(filePath)) {
            if (convertFile(filePath, filePath)) {
                successCount++;
            } else {
                failCount++;
            }
            console.log('');
        } else {
            console.log(`⚠ ${game}: File not found (skipping)\n`);
        }
    }
    
    console.log(`\n✓ Conversion complete!`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Failed: ${failCount}`);
}

// CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        // Convert all games
        convertAllGames();
    } else if (args.length === 3) {
        // Convert specific file: game inputFile outputFile
        const [game, inputFile, outputFile] = args;
        const inputPath = path.isAbsolute(inputFile) ? inputFile : path.resolve(inputFile);
        const outputPath = path.isAbsolute(outputFile) ? outputFile : path.resolve(outputFile);
        convertFile(inputPath, outputPath);
    } else if (args.length === 1) {
        // Convert specific game
        const game = args[0].toUpperCase();
        if (!GAMES.includes(game)) {
            console.error(`Invalid game: ${game}. Must be one of: ${GAMES.join(', ')}`);
            process.exit(1);
        }
        const filePath = path.join(DATA_DIR, game, 'characters.json');
        convertFile(filePath, filePath);
    } else {
        console.error('Usage:');
        console.error('  node scripts/convert-to-array-format.js                    # Convert all games');
        console.error('  node scripts/convert-to-array-format.js <GAME>              # Convert specific game');
        console.error('  node scripts/convert-to-array-format.js <input> <output>    # Convert specific files');
        process.exit(1);
    }
}

module.exports = { convertFile, convertAllGames };
