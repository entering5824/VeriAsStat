# Convert Characters JSON to Array Format

Script này chuyển đổi format của `characters.json` từ `{ "characters": [...] }` sang `[...]` (array trực tiếp).

## Lý do

- MongoDB import với `--jsonArray` flag yêu cầu format array trực tiếp
- Giảm độ sâu của JSON structure
- Dễ dàng xử lý hơn trong code

## Cách sử dụng

```bash
# Chuyển đổi tất cả games (GI, HSR, ZZZ)
node scripts/convert-to-array-format.js

# Chuyển đổi một game cụ thể
node scripts/convert-to-array-format.js GI

# Chuyển đổi file cụ thể
node scripts/convert-to-array-format.js input.json output.json
```

## Backup

Script tự động tạo backup file với format: `{filename}.backup.{timestamp}`

## Format

### Trước (Old Format)
```json
{
  "characters": [
    { "id": "...", "name": "..." },
    { "id": "...", "name": "..." }
  ]
}
```

### Sau (New Format)
```json
[
  { "id": "...", "name": "..." },
  { "id": "...", "name": "..." }
]
```

## MongoDB Import

Sau khi chuyển đổi, có thể import vào MongoDB với:

```bash
mongoimport --db yourdb --collection characters --file public/data/GI/characters.json --jsonArray
```

Flag `--jsonArray` báo cho MongoDB biết file là một array của documents, mỗi object trong array sẽ được import như một document riêng biệt.
