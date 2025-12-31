# Kế hoạch tái cấu trúc thư mục src/

## Cấu trúc hiện tại - Vấn đề

### Composables (15 files ở root)
- Character-related: `useCharacters.ts`, `useCharacterSort.ts`, `useCharacterStats.ts`
- Weapon-related: `useWeapon.ts`, `useWeaponFilter.ts`, `useWeaponScaling.ts`
- Game-related: `useGameConfig.ts`, `useGamePage.ts`
- UI/Common: `useAudio.ts`, `useHome.ts`, `useImagePreloader.ts`, `useLoading.ts`, `useNotifications.ts`, `useScrollRestore.ts`, `useSearchDebounce.ts`, `useVersionPage.ts`

### Utils (7 files, 1 subdirectory)
- Domain-specific: `character.ts`, `weapon.ts`, `version.ts`
- Common: `common.ts`, `fetchWithRetry.ts`, `lruCache.ts`
- Subdirectory: `common/imageHelpers.ts`

### Pages (9 files ở root)
- Tất cả pages ở root level

### Schema vs Schemas
- `src/schema/character.schema.ts` - có 1 file
- `src/schemas/index.ts` - có index.ts
- Có vẻ duplicate, cần merge

## Cấu trúc mới đề xuất

### Composables (nhóm theo domain)
```
src/composables/
├── character/
│   ├── useCharacters.ts
│   ├── useCharacterSort.ts
│   ├── useCharacterStats.ts
│   └── index.ts
├── weapon/
│   ├── useWeapon.ts
│   ├── useWeaponFilter.ts
│   ├── useWeaponScaling.ts
│   └── index.ts
├── game/
│   ├── useGameConfig.ts
│   ├── useGamePage.ts
│   └── index.ts
├── ui/
│   ├── useAudio.ts
│   ├── useImagePreloader.ts
│   ├── useLoading.ts
│   ├── useNotifications.ts
│   ├── useScrollRestore.ts
│   ├── useSearchDebounce.ts
│   └── index.ts
├── useHome.ts (có thể giữ ở root hoặc move vào ui/)
├── useVersionPage.ts (có thể giữ ở root hoặc move vào version/)
└── index.ts (barrel export)
```

### Utils (nhóm theo domain)
```
src/utils/
├── character/
│   ├── character.ts
│   └── index.ts
├── weapon/
│   ├── weapon.ts
│   └── index.ts
├── version/
│   ├── version.ts
│   └── index.ts
├── common/
│   ├── common.ts
│   ├── imageHelpers.ts
│   ├── fetchWithRetry.ts
│   ├── lruCache.ts
│   └── index.ts
└── index.ts (barrel export)
```

### Pages (có thể giữ nguyên hoặc nhóm theo feature)
```
src/pages/
├── character/
│   ├── Character.vue
│   └── CharacterDetail.vue
├── weapon/
│   ├── Weapon.vue
│   └── WeaponDetail.vue
├── artifact/
│   └── Artifact.vue
├── version/
│   └── VersionPage.vue
├── game/
│   └── GamePage.vue
├── Home.vue
└── loading.vue
```

### Schema (merge schema và schemas)
```
src/schemas/
├── character.schema.ts (move từ schema/)
└── index.ts (giữ nguyên)
```

## File Mapping

### Composables
1. `useCharacters.ts` → `composables/character/useCharacters.ts`
2. `useCharacterSort.ts` → `composables/character/useCharacterSort.ts`
3. `useCharacterStats.ts` → `composables/character/useCharacterStats.ts`
4. `useWeapon.ts` → `composables/weapon/useWeapon.ts`
5. `useWeaponFilter.ts` → `composables/weapon/useWeaponFilter.ts`
6. `useWeaponScaling.ts` → `composables/weapon/useWeaponScaling.ts`
7. `useGameConfig.ts` → `composables/game/useGameConfig.ts`
8. `useGamePage.ts` → `composables/game/useGamePage.ts`
9. `useAudio.ts` → `composables/ui/useAudio.ts`
10. `useImagePreloader.ts` → `composables/ui/useImagePreloader.ts`
11. `useLoading.ts` → `composables/ui/useLoading.ts`
12. `useNotifications.ts` → `composables/ui/useNotifications.ts`
13. `useScrollRestore.ts` → `composables/ui/useScrollRestore.ts`
14. `useSearchDebounce.ts` → `composables/ui/useSearchDebounce.ts`
15. `useHome.ts` → giữ ở root hoặc `composables/ui/useHome.ts`
16. `useVersionPage.ts` → giữ ở root hoặc `composables/version/useVersionPage.ts`

### Utils
1. `character.ts` → `utils/character/character.ts`
2. `weapon.ts` → `utils/weapon/weapon.ts`
3. `version.ts` → `utils/version/version.ts`
4. `common.ts` → `utils/common/common.ts` (hoặc giữ ở root)
5. `fetchWithRetry.ts` → `utils/common/fetchWithRetry.ts`
6. `lruCache.ts` → `utils/common/lruCache.ts`
7. `common/imageHelpers.ts` → `utils/common/imageHelpers.ts` (giữ nguyên)

### Schema
1. `schema/character.schema.ts` → `schemas/character.schema.ts`
2. Xóa thư mục `schema/` nếu trống

### Pages (optional - có thể giữ nguyên)
1. `Character.vue` → `pages/character/Character.vue`
2. `CharacterDetail.vue` → `pages/character/CharacterDetail.vue`
3. `Weapon.vue` → `pages/weapon/Weapon.vue`
4. `WeaponDetail.vue` → `pages/weapon/WeaponDetail.vue`
5. `Artifact.vue` → `pages/artifact/Artifact.vue`
6. `VersionPage.vue` → `pages/version/VersionPage.vue`
7. `GamePage.vue` → `pages/game/GamePage.vue`
8. `Home.vue` → giữ ở root
9. `loading.vue` → giữ ở root

## Path Updates Required

### Composables imports
- `'../composables/useCharacters'` → `'../composables/character'` hoặc `'../composables'`
- `'../composables/useWeapon'` → `'../composables/weapon'` hoặc `'../composables'`
- Tương tự cho các composables khác

### Utils imports
- `'../utils/character'` → `'../utils/character'` (giữ nguyên nếu có barrel)
- `'../utils/weapon'` → `'../utils/weapon'` (giữ nguyên nếu có barrel)
- `'../utils/common'` → `'../utils/common'` (giữ nguyên)
- `'../utils/fetchWithRetry'` → `'../utils/common/fetchWithRetry'` hoặc `'../utils/common'`

### Schema imports
- `'../schema/character.schema'` → `'../schemas/character.schema'` hoặc `'../schemas'`

### Pages (nếu di chuyển)
- Router lazy imports cần cập nhật

## Files cần cập nhật

### Composables usage
- Tất cả files import composables
- Router (nếu có)

### Utils usage
- Services (đã có relative paths)
- Components
- Pages

### Schema usage
- Services (characterService)

### Pages (nếu di chuyển)
- Router index.ts

## Lưu ý

1. **Barrel exports**: Tạo index.ts trong mỗi subdirectory để giữ backward compatibility
2. **Router**: Cần cập nhật lazy imports nếu di chuyển pages
3. **Relative paths**: Cần tính toán lại relative paths từ mỗi file
4. **Types**: Giữ nguyên cấu trúc (đã có index.ts)
5. **Config**: Giữ nguyên (chỉ có games.ts)

## Thứ tự thực hiện

1. Merge schema và schemas (đơn giản nhất)
2. Tái cấu trúc composables (nhiều files nhất)
3. Tái cấu trúc utils
4. Tái cấu trúc pages (optional, có thể skip nếu quá nhiều thay đổi)
