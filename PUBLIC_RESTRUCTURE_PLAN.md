# Kế hoạch tái cấu trúc thư mục public/

## Cấu trúc hiện tại

### Data (không nhất quán):
- `data/characters/gi/characters.json` ✓
- `data/characters/hsr/characters.json` ✓
- `data/characters/zzz/characters.json` ✓
- `data/hsr/lightcones.json` ❌ (nên ở data/hsr/)
- `data/hsr/relics.json` ❌ (nên ở data/hsr/)
- `data/zzz/disks.json` ❌ (nên ở data/zzz/)
- `data/zzz/wengines.json` ❌ (nên ở data/zzz/)
- `data/versions.json` ✓
- `data/gi/weapons.json` - được reference nhưng không tồn tại
- `data/gi/artifacts.json` - được reference nhưng không tồn tại

### Images (không nhất quán):
- `images/characters/GI/icon/` ✓
- `images/characters/GI/splashart/` ✓
- `images/characters/HSR/icon/` ✓
- `images/characters/HSR/slashart/` ✓
- `images/characters/ZZZ/icon/` ✓
- `images/characters/ZZZ/slashart/` ✓
- `images/weapons/` - tất cả weapons ở root ❌
- `images/gi_icon.jpeg` - ở root ❌
- `images/hsr_icon.png` - ở root ❌
- `images/zzz_icon.png` - ở root ❌
- `images/gi.jpeg` - ở root ❌
- `images/hsr.jpg` - ở root ❌
- `images/zzz.jpg` - ở root ❌
- `images/loading.png` - ở root ❌

## Cấu trúc mới đề xuất

### Data (tổ chức theo game):
```
public/data/
├── gi/
│   ├── characters.json
│   ├── weapons.json
│   └── artifacts.json
├── hsr/
│   ├── characters.json
│   ├── lightcones.json
│   └── relics.json
├── zzz/
│   ├── characters.json
│   ├── wengines.json
│   └── disks.json
└── versions.json (shared)
```

### Images (tổ chức theo game):
```
public/images/
├── gi/
│   ├── characters/
│   │   ├── icon/
│   │   └── splashart/
│   ├── weapons/
│   └── icons/ (gi_icon.jpeg, gi.jpeg)
├── hsr/
│   ├── characters/
│   │   ├── icon/
│   │   └── slashart/
│   ├── lightcones/
│   └── icons/ (hsr_icon.png, hsr.jpg)
├── zzz/
│   ├── characters/
│   │   ├── icon/
│   │   └── slashart/
│   ├── wengines/
│   └── icons/ (zzz_icon.png, zzz.jpg)
└── shared/
    ├── loading.png
    └── placeholder/
        └── character.png
```

### Assets (root files):
```
public/assets/
├── genshin-impact.svg
├── home.png
└── vite.svg
```

## File Mapping

### Data moves:
1. `data/characters/gi/characters.json` → `data/gi/characters.json`
2. `data/characters/hsr/characters.json` → `data/hsr/characters.json`
3. `data/characters/zzz/characters.json` → `data/zzz/characters.json`
4. `data/hsr/lightcones.json` → `data/hsr/lightcones.json` (giữ nguyên vị trí)
5. `data/hsr/relics.json` → `data/hsr/relics.json` (giữ nguyên vị trí)
6. `data/zzz/disks.json` → `data/zzz/disks.json` (giữ nguyên vị trí)
7. `data/zzz/wengines.json` → `data/zzz/wengines.json` (giữ nguyên vị trí)
8. `data/versions.json` → `data/versions.json` (giữ nguyên)

### Images moves:
1. `images/characters/GI/` → `images/gi/characters/`
2. `images/characters/HSR/` → `images/hsr/characters/`
3. `images/characters/ZZZ/` → `images/zzz/characters/`
4. `images/weapons/` → `images/gi/weapons/` (tạm thời, có thể cần split sau)
5. `images/gi_icon.jpeg` → `images/gi/icons/gi_icon.jpeg`
6. `images/gi.jpeg` → `images/gi/icons/gi.jpeg`
7. `images/hsr_icon.png` → `images/hsr/icons/hsr_icon.png`
8. `images/hsr.jpg` → `images/hsr/icons/hsr.jpg`
9. `images/zzz_icon.png` → `images/zzz/icons/zzz_icon.png`
10. `images/zzz.jpg` → `images/zzz/icons/zzz.jpg`
11. `images/loading.png` → `images/shared/loading.png`

### Assets moves:
1. `genshin-impact.svg` → `assets/genshin-impact.svg`
2. `home.png` → `assets/home.png`
3. `vite.svg` → `assets/vite.svg`

## Path Updates Required

### Data paths:
- `/data/characters/gi/characters.json` → `/data/gi/characters.json`
- `/data/characters/hsr/characters.json` → `/data/hsr/characters.json`
- `/data/characters/zzz/characters.json` → `/data/zzz/characters.json`
- `/data/gi/weapons.json` → `/data/gi/weapons.json` (giữ nguyên)
- `/data/gi/artifacts.json` → `/data/gi/artifacts.json` (giữ nguyên)
- `/data/hsr/lightcones.json` → `/data/hsr/lightcones.json` (giữ nguyên)
- `/data/hsr/relics.json` → `/data/hsr/relics.json` (giữ nguyên)
- `/data/zzz/wengines.json` → `/data/zzz/wengines.json` (giữ nguyên)
- `/data/zzz/disks.json` → `/data/zzz/disks.json` (giữ nguyên)

### Images paths:
- `/images/characters/GI/icon/` → `/images/gi/characters/icon/`
- `/images/characters/GI/splashart/` → `/images/gi/characters/splashart/`
- `/images/characters/HSR/icon/` → `/images/hsr/characters/icon/`
- `/images/characters/HSR/slashart/` → `/images/hsr/characters/slashart/`
- `/images/characters/ZZZ/icon/` → `/images/zzz/characters/icon/`
- `/images/characters/ZZZ/slashart/` → `/images/zzz/characters/slashart/`
- `/images/weapons/` → `/images/gi/weapons/` (hoặc split theo game)
- `/images/gi_icon.jpeg` → `/images/gi/icons/gi_icon.jpeg`
- `/images/gi.jpeg` → `/images/gi/icons/gi.jpeg`
- `/images/hsr_icon.png` → `/images/hsr/icons/hsr_icon.png`
- `/images/hsr.jpg` → `/images/hsr/icons/hsr.jpg`
- `/images/zzz_icon.png` → `/images/zzz/icons/zzz_icon.png`
- `/images/zzz.jpg` → `/images/zzz/icons/zzz.jpg`
- `/images/loading.png` → `/images/shared/loading.png`
- `/images/placeholder/character.png` → `/images/shared/placeholder/character.png`

## Files cần cập nhật

### Services:
- `src/services/character/characterService.ts` - update character data path
- `src/services/weapon/weaponService.ts` - có thể cần update nếu weapons split theo game
- `src/services/artifact/artifactSetService.ts` - paths đã đúng

### Utils:
- `src/utils/character.ts` - update image paths
- `src/utils/weapon.ts` - update weapon image paths

### Components:
- `src/components/ui/HeroCarousel.vue` - update game icon paths
- `src/components/game/GameCard.vue` - update icon fallback
- `src/components/version/VersionCard.vue` - update character image paths
- `src/components/ui/ImageFull.vue` - update image paths

### Pages:
- `src/pages/CharacterDetail.vue` - update image paths
- `src/pages/WeaponDetail.vue` - update weapon image paths
- `src/pages/loading.vue` - update loading image path

### Config:
- `src/config/games.ts` - update game icon paths
- `src/composables/useGameConfig.ts` - update icon paths
- `src/composables/useGamePage.ts` - update data paths
- `src/composables/useHome.ts` - update data paths

### Scripts:
- `scripts/pyqt_crud.py` - update file paths
- `scripts/generate-artifact-core.ts` - update data paths
