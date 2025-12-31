# Artifact Set Parser

Multi-game artifact set parser for ML/DL datasets. Supports Genshin Impact (GI), Honkai: Star Rail (HSR), and Zenless Zone Zero (ZZZ).

## Features

- **Multi-game support**: GI, HSR, ZZZ with game-specific parsing rules
- **Auto-detection**: Automatically detect game type from input text
- **Enhanced parsing**: 
  - Support for `reset_on_repeat` flags
  - Support for `no_stack_passive` flags
  - Multi-trigger parsing ("EX Special Attack, Chain Attack, or Ultimate")
  - Value array parsing (15%/30% → [15, 30])
  - Duration and unit parsing (turn/s)
- **Debug mode**: Log failed blocks with timestamps and reasons
- **Schema validation**: Output matches `artifact_schema_updated.json`

## Installation

Requires Python 3.10+.

```bash
# No external dependencies required (uses only standard library)
python parse_artifacts_multi.py --help
```

## Usage

### Basic Usage

```bash
# Parse with explicit game
python parse_artifacts_multi.py --game ZZZ --input input_zzz.txt --output output.json

# Auto-detect game from input
python parse_artifacts_multi.py --auto --input input.txt --output output.json

# Use default input file (input_{game}.txt)
python parse_artifacts_multi.py --game GI
```

### CLI Arguments

- `--input`, `-i`: Input file path (default: `input_{game}.txt`)
- `--output`, `-o`: Output JSON file (default: `output.json`)
- `--game`, `-g`: Game type: `GI`, `HSR`, `ZZZ`, or `1`/`2`/`3`
- `--auto`: Auto-detect game from input text
- `--debug`: Enable debug logging to `debug.log`

### Examples

```bash
# Parse ZZZ artifacts
python parse_artifacts_multi.py --game ZZZ --input sample_inputs/zzz_sample.txt

# Parse with auto-detection
python parse_artifacts_multi.py --auto --input input.txt --output artifacts.json

# Parse with debug logging
python parse_artifacts_multi.py --game HSR --input input_hsr.txt --debug
```

## Game Detection Logic

The `--auto` flag uses keyword-based detection:

- **ZZZ**: Anomaly Proficiency, EX Special Attack, Chain Attack, Ether Veil, Sheer DMG, PEN Ratio, Daze, Assault, Aftershock
- **HSR**: Ultimate, Follow-Up ATK, Break Effect, DoT, memosprite, Planar Ornament, Simulated Universe
- **GI**: Elemental Mastery, Elemental Burst, Elemental Skill, Normal Attack, Charged Attack, Plunging Attack

If detection is uncertain and running interactively, the user will be prompted. In non-interactive mode, defaults to GI.

## Output Format

Output JSON matches `artifact_schema_updated.json`:

```json
{
  "name": "Shining Aria",
  "2pc_bonus": {
    "stat": "Ether DMG",
    "value": 10,
    "type": "percent"
  },
  "4pc_bonus": [
    {
      "trigger": "When the equipper's Basic Attack hits an enemy",
      "effect": [
        {
          "stat": "Anomaly Proficiency",
          "value": 36,
          "type": "flat",
          "duration": 8,
          "unit": "s",
          "reset_on_repeat": true
        }
      ]
    }
  ],
  "raw_2pc": "Ether DMG +10%",
  "raw_4pc": "When the equipper's Basic Attack hits an enemy..."
}
```

### Schema Requirements

- `name` (required): Artifact set name
- `2pc_bonus` (required): Object with `stat`, `value`, `type` (required), and optional fields:
  - `trigger`: String or array of strings
  - `condition`: String or array of strings
  - `duration`: Number
  - `unit`: "s" or "turn"
  - `stacking`: String (e.g., "up to 3 stacks")
  - `reset_on_repeat`: Boolean
  - `no_stack_passive`: Boolean
- `4pc_bonus` (optional): Array of objects with `trigger` and `effect` array
- `raw_2pc`, `raw_4pc`: Original text from input
- `no_stack_passive`: Boolean at set level

## Debug Mode

With `--debug`, failed parsing attempts are logged to `debug.log`:

```
2024-01-01 12:00:00 - WARNING - Skipping SetName: Missing or invalid 2pc bonus. Block: ...
```

## Testing

Run tests with pytest:

```bash
pytest tests/test_parser.py -v
```

Tests include:
- Shining Aria example (ZZZ) with `reset_on_repeat` verification
- Multi-trigger parsing
- `no_stack_passive` detection
- Value array parsing
- Game detection
- Full file parsing (90%+ success rate expected)

## Input Format

Input files should have the following format:

```
Set Name
2-Pc: 2-piece bonus description
4-Pc: 4-piece bonus description

Next Set Name
2-Pc: ...
4-Pc: ...
```

- Set name on its own line
- `2-Pc:` or `2-piece:` prefix for 2-piece bonus
- `4-Pc:` or `4-piece:` prefix for 4-piece bonus (optional)
- Blank lines separate sets

## Notes

- Parser requires at least a valid 2pc bonus (schema requirement)
- Sets without 2pc are skipped and logged (if `--debug`)
- Multi-trigger sentences are split on commas, "or", "and"
- Duration parsing supports both "s" (seconds) and "turn" units
- Stat names are normalized using aliases (see `STAT_ALIASES` in code)

## Integration

The parser output can be integrated into the website backend:

1. Run parser: `python parse_artifacts_multi.py --game ZZZ --input input_zzz.txt --output output.json`
2. Use migration script to convert to website format: `scripts/migrate-artifact-sets.ts`
3. Output goes to `public/data/{game}/artifact-sets.json`

## License

Part of VeriAsStat project.
