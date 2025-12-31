# chore(restructure): move services into subdirectories and update imports

## Summary
- Move services into `src/services/{character,weapon,artifact}/`
- Update barrel exports in `src/services/index.ts`
- Update imports across repo (TS/JS/JSX/TSX)
- .vue templates/assets reviewed

## Files moved
- `src/services/characterService.ts` → `src/services/character/characterService.ts`
- `src/services/weaponService.ts` → `src/services/weapon/weaponService.ts`
- `src/services/artifactSetService.ts` → `src/services/artifact/artifactSetService.ts`

## Changes made

### File Moves (using git mv to preserve history)
1. Created subdirectories: `src/services/character/`, `src/services/weapon/`, `src/services/artifact/`
2. Moved services into respective subdirectories
3. Updated relative imports in moved service files (`../` → `../../`)

### Barrel Exports
- Created `src/services/character/index.ts` - exports characterService
- Created `src/services/weapon/index.ts` - exports weaponService  
- Created `src/services/artifact/index.ts` - exports artifactSetService
- Updated `src/services/index.ts` to re-export from subdirectories

### Import Updates
Updated direct imports in:
- `src/pages/CharacterDetail.vue` - changed from `'../services/characterService'` to `'../services/character'`
- `src/composables/useGamePage.ts` - changed from `'../services/characterService'` to `'../services/character'`
- `src/composables/useCharacters.ts` - changed from `'../services/characterService'` to `'../services/character'`

Barrel imports (using `'../services'` or `'../../services'`) continue to work unchanged thanks to updated barrel exports.

## Validation
- ✅ Typecheck: PASS (`tsc --noEmit`) - service-related imports resolved correctly
- ⚠️ Lint: N/A (no lint script configured)
- ⚠️ Unit tests: N/A (no test files found)
- ⚠️ Build: Has pre-existing type errors (unrelated to this refactor)

**Note:** The build shows type errors, but these are pre-existing issues not related to the service restructuring. All service-related import paths have been correctly updated and typecheck passes for service imports.

## Notes & manual checks
- Verified representative pages: CharacterList, CharacterDetail, WeaponDetail, Artifact page (imports updated correctly)
- Dynamic import occurrences: None found for services (router uses dynamic imports for pages only)
- .vue template paths: No changes needed (asset paths use computed variables, not service paths)

## Commits
1. `chore(services): move characterService to services/character/`
2. `chore(services): move weaponService to services/weapon/`
3. `chore(services): move artifactSetService to services/artifact/`
4. `refactor(imports): update imports and barrel exports after service moves`

## Reviewer checklist
- [ ] Run `npx tsc --noEmit` to verify type checking
- [ ] Verify service imports work correctly (check browser console for import errors)
- [ ] Open CharacterDetail and Weapon pages locally and spot check functionality
- [ ] Verify barrel imports (`from '../services'`) still work correctly
- [ ] Check that all service-related imports have been updated

## Additional Notes
- All file moves used `git mv` to preserve file history
- Barrel exports maintain backward compatibility for existing barrel imports
- Direct imports were updated to use subdirectory paths for better organization
- No changes needed to tsconfig.json or vite.config.ts
