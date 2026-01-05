# Image to WebP Converter

Script để chuyển đổi ảnh từ PNG, JPEG, JPG sang định dạng WebP để tối ưu hiệu suất.

## Cài đặt

Script đã được cấu hình sẵn trong `package.json`. Đảm bảo đã cài đặt dependencies:

```bash
npm install
```

## Sử dụng

### Chuyển đổi tất cả ảnh trong thư mục `public/images`

```bash
npm run convert:webp
```

### Chuyển đổi ảnh trong thư mục cụ thể

```bash
npm run convert:webp -- --dir=public/images/gi/characters/icon
npm run convert:webp -- --dir=public/images/hsr/characters/icon
npm run convert:webp -- --dir=public/images/zzz/characters/slashart
```

### Tùy chọn chất lượng WebP (0-100, mặc định: 85)

```bash
npm run convert:webp -- --quality=90
npm run convert:webp -- --quality=80
```

### Xóa file gốc sau khi chuyển đổi (CẨN THẬN!)

```bash
npm run convert:webp -- --delete-original
```

### Chuyển đổi lại ngay cả khi file WebP đã tồn tại

```bash
npm run convert:webp -- --no-skip-existing
```

### Chỉ xử lý thư mục hiện tại, không đệ quy

```bash
npm run convert:webp -- --no-recursive
```

### Kết hợp nhiều tùy chọn

```bash
npm run convert:webp -- --dir=public/images/gi/weapons --quality=90 --delete-original
```

### Xem hướng dẫn

```bash
npm run convert:webp -- --help
```

## Các tùy chọn

| Tùy chọn | Mô tả | Mặc định |
|----------|-------|----------|
| `--dir=<path>` | Thư mục cần xử lý | `public/images` |
| `--quality=<number>` | Chất lượng WebP (0-100) | `85` |
| `--delete-original` | Xóa file gốc sau khi convert | `false` |
| `--no-skip-existing` | Convert lại file WebP đã tồn tại | `false` (skip) |
| `--no-recursive` | Không xử lý thư mục con | `false` (recursive) |
| `--help` | Hiển thị hướng dẫn | - |

## Định dạng hỗ trợ

- ✅ PNG (`.png`)
- ✅ JPEG (`.jpg`, `.jpeg`, `.jpe`)

## Ví dụ sử dụng

### Chuyển đổi tất cả ảnh character icons của Genshin Impact

```bash
npm run convert:webp -- --dir=public/images/gi/characters/icon
```

### Chuyển đổi ảnh splashart với chất lượng cao và giữ file gốc

```bash
npm run convert:webp -- --dir=public/images/gi/characters/splashart --quality=90
```

### Chuyển đổi ảnh weapon và xóa file PNG gốc (tiết kiệm dung lượng)

```bash
npm run convert:webp -- --dir=public/images/gi/weapons/weapons --quality=85 --delete-original
```

### Chuyển đổi toàn bộ thư mục images với chất lượng tối ưu

```bash
npm run convert:webp -- --quality=85
```

## Lưu ý

1. **Backup**: Nên backup dữ liệu trước khi sử dụng `--delete-original`
2. **Chất lượng**: 
   - 80-85: Tối ưu giữa chất lượng và dung lượng (khuyến nghị)
   - 90-100: Chất lượng cao hơn nhưng dung lượng lớn hơn
   - 60-80: Dung lượng nhỏ nhưng có thể giảm chất lượng
3. **Performance**: WebP thường giảm dung lượng 25-35% so với PNG/JPG
4. **Browser Support**: WebP được hỗ trợ tốt trên các trình duyệt hiện đại. Codebase đã có fallback về PNG

## Output

Script sẽ hiển thị:
- Số file đã convert thành công
- Số file lỗi
- Tổng dung lượng tiết kiệm được
- Tỷ lệ nén
- Thời gian thực thi

## Troubleshooting

### Lỗi "sharp not found"
```bash
npm install sharp --save-dev
```

### Lỗi quyền truy cập
Kiểm tra quyền read/write trên thư mục đích

### File không được convert
- Kiểm tra định dạng file (chỉ hỗ trợ PNG, JPEG)
- Kiểm tra đường dẫn thư mục
- Xem log chi tiết trong console
