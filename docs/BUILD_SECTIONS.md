# Build Sections Schema Documentation

## Overview

Character build guide sections are rendered dynamically based on section types. This document describes the schema changes, migration process, and usage.

## Schema Changes

### New Section Types

Two new section types have been added to support better build guide rendering:

1. **`set-combination`** - For artifact/relic/disk set combinations with pieces
2. **`stat-priority`** - For substat priority lists

### Updated Schema

The `SectionSchema.type` enum now includes:

- `ranked-list` - Ranked list of items (existing)
- `list` - Simple list of items (existing)
- `material-grid` - Grid of material items (existing)
- `stat-grid` - Grid of stat slots (existing)
- `set-combination` - Set combinations with pieces (NEW)
- `stat-priority` - Stat priority list (NEW)

### Section Structure

```typescript
interface Section {
  key: string                    // Section identifier (e.g., "weapons", "artifacts")
  title?: string                 // Display title
  type?: SectionType             // Section type (see above)
  items?: SectionItem[]          // Section items
}

interface SectionItem {
  rank?: number                  // Ranking order (1 = best)
  name?: string                  // Item name (required for stat-priority)
  note?: string                  // Optional note
  slot?: string                  // Slot name (for stat-grid)
  stat?: string                  // Stat value (for stat-grid)
  sets?: Array<{                 // Set combinations (for set-combination)
    name: string
    pieces: number
  }>
}
```

## Migration Script

### Usage

Run the migration script to convert existing character data to use new section types:

```bash
# Preview changes (dry run)
tsx scripts/migrate-sections.ts --dry-run

# Apply changes (creates backups first)
tsx scripts/migrate-sections.ts --apply
```

### What It Does

1. Scans all `public/data/{gi,hsr,zzz}/characters.json` files
2. Detects sections with `ranked-list` type that contain `sets[]` → marks as `set-combination`
3. Detects sections with stat strings → converts to `stat-priority` with normalized `{ name: string }` objects
4. Normalizes all artifact set items to use `{ name, pieces }` structure
5. Creates `.bak.{timestamp}` backups before modifying

### Migration Rules

- **Set Combination Detection**: Sections with `type: "ranked-list"` and items containing `sets[]` are marked as `type: "set-combination"`
- **Stat Priority Detection**: Sections with items that are strings or have `name` fields (without `sets` or `slot`) are converted to `stat-priority`
- **Normalization**: All set items are normalized to `{ name: string, pieces: number }` structure

## Feature Flag

The new build UI is behind a feature flag for gradual rollout.

### Environment Variable

Set in `.env` file:

```env
VITE_FEATURE_BUILD_UI=true
```

### URL Query Parameter

Add `?newBuildUI=1` to the URL:

```
/characters/4?game=GI&newBuildUI=1
```

**Note**: URL query parameter overrides environment variable.

### Rollout Checklist

- [ ] Run migration script in dry-run mode
- [ ] Review changes and backups
- [ ] Run migration script with --apply
- [ ] Test with feature flag disabled (legacy UI)
- [ ] Enable feature flag in development
- [ ] Test with feature flag enabled (new UI)
- [ ] Enable feature flag in staging
- [ ] Enable feature flag in production
- [ ] Monitor for issues
- [ ] Remove legacy code after stable period

## Component Mapping

The new build components map to section types as follows:

| Section Type | Component | Description |
|-------------|-----------|-------------|
| `ranked-list` | `BuildRankedList` | Ranked list with badges |
| `set-combination` | `BuildSetCombination` | Set combinations with chips |
| `stat-grid` | `BuildStatGrid` | Grid of stat slots |
| `stat-priority` | `BuildStatPriority` | Priority list of stats |
| `list` | `BuildRankedList` | Falls back to ranked-list component |
| `material-grid` | (existing) | Uses existing materials grid |

## Example JSON

See `examples/` directory for example character JSON files demonstrating all section types:

- `example-character-gi.json` - Genshin Impact example
- `example-character-hsr.json` - Honkai: Star Rail example
- `example-character-zzz.json` - Zenless Zone Zero example

## Backward Compatibility

All existing section types (`ranked-list`, `list`, `material-grid`, `stat-grid`) remain fully supported. The new types are additive and do not break existing functionality.

When the feature flag is disabled, the legacy rendering logic is used, ensuring zero impact on existing deployments.
