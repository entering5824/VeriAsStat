# Tái cấu trúc thư mục public/ - Hoàn thành

## Tóm tắt

Đã hoàn thành tái cấu trúc thư mục `public/` theo cấu trúc tổ chức theo game, giúp codebase dễ maintain và mở rộng hơn.

## Cấu trúc mới

### Data (`public/data/`)
```
public/data/
├── gi/
│   ├── characters.json
│   ├── weapons.json (được reference, cần tạo nếu chưa có)
│   └── artifacts.json (được reference, cần tạo nếu chưa có)
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

### Images (`public/images/`)
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
│   ├── lightcones/ (thư mục trống, sẵn sàng cho tương lai)
│   └── icons/ (hsr_icon.png, hsr.jpg)
├── zzz/
│   ├── characters/
│   │   ├── icon/
│   │   └── slashart/
│   ├── wengines/ (thư mục trống, sẵn sàng cho tương lai)
│   └── icons/ (zzz_icon.png, zzz.jpg)
└── shared/
    ├── loading.png
    └── placeholder/ (thư mục sẵn sàng cho placeholders)
```

### Assets (`public/assets/`)
```
public/assets/
├── genshin-impact.svg
├── home.png
└── vite.svg
```

## Thay đổi paths

### Data paths
- `/data/characters/gi/characters.json` → `/data/gi/characters.json`
- `/data/characters/hsr/characters.json` → `/data/hsr/characters.json`
- `/data/characters/zzz/characters.json` → `/data/zzz/characters.json`
- Các paths khác giữ nguyên (đã đúng cấu trúc)

### Image paths
- `/images/characters/GI/icon/` → `/images/gi/characters/icon/`
- `/images/characters/GI/splashart/` → `/images/gi/characters/splashart/`
- `/images/characters/HSR/icon/` → `/images/hsr/characters/icon/`
- `/images/characters/HSR/slashart/` → `/images/hsr/characters/slashart/`
- `/images/characters/ZZZ/icon/` → `/images/zzz/characters/icon/`
- `/images/characters/ZZZ/slashart/` → `/images/zzz/characters/slashart/`
- `/images/weapons/` → `/images/gi/weapons/`
- `/images/gi_icon.jpeg` → `/images/gi/icons/gi_icon.jpeg`
- `/images/gi.jpeg` → `/images/gi/icons/gi.jpeg`
- `/images/hsr_icon.png` → `/images/hsr/icons/hsr_icon.png`
- `/images/hsr.jpg` → `/images/hsr/icons/hsr.jpg`
- `/images/zzz_icon.png` → `/images/zzz/icons/zzz_icon.png`
- `/images/zzz.jpg` → `/images/zzz/icons/zzz.jpg`
- `/images/loading.png` → `/images/shared/loading.png`
- `/images/placeholder/character.png` → `/images/shared/placeholder/character.png`

## Files đã cập nhật

### Services
- `src/services/character/characterService.ts` - data path

### Utils
- `src/utils/character.ts` - tất cả character image paths
- `src/utils/weapon.ts` - weapon image path

### Components
- `src/components/ui/HeroCarousel.vue` - game icons
- `src/components/game/GameCard.vue` - icon fallback
- `src/components/version/VersionCard.vue` - character image paths
- `src/components/ui/ImageFull.vue` - character full image path

### Pages
- `src/pages/CharacterDetail.vue` - placeholder paths
- `src/pages/WeaponDetail.vue` - weapon image path
- `src/pages/loading.vue` - loading image path

### Config & Composables
- `src/config/games.ts` - game icon paths
- `src/composables/useGameConfig.ts` - icon paths

### Types
- `src/types/character.ts` - path comments

### Scripts
- `scripts/pyqt_crud.py` - data file paths
- `src/schema/character.schema.ts` - comment path

## Commits

1. `chore(public): reorganize data files by game`
2. `chore(public): reorganize images by game structure`
3. `chore(public): move character images to game-specific folders`
4. `chore(public): move root assets to assets folder`
5. `refactor(public): update all paths after restructuring public directory`

## Validation

- ✅ Typecheck: PASS (không có lỗi liên quan đến paths)
- ✅ File moves: Tất cả files đã được di chuyển thành công
- ✅ Path updates: Tất cả paths đã được cập nhật

## Notes

- Weapons hiện tại chỉ có GI, nên đã di chuyển vào `images/gi/weapons/`
- Thư mục `lightcones/` và `wengines/` đã được tạo sẵn cho tương lai
- Placeholder images cần được tạo trong `images/shared/placeholder/` nếu chưa có
- Cấu trúc mới giúp dễ dàng thêm assets cho các game mới trong tương lai
