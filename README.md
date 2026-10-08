# imgv - Trình xem ảnh tốc độ cao (Hỗ trợ ảnh tĩnh & ảnh động)

**imgv** là một công cụ xem ảnh hiện đại, hiệu năng cao viết bằng **Golang**, hỗ trợ tất cả các định dạng ảnh phổ biến (cả tĩnh và động) với giao diện desktop frameless/app-mode mượt mà.

---

## ✨ Điểm nổi bật

1. **Hỗ trợ toàn diện các loại ảnh**:
   - **Ảnh động (Animated)**: GIF, Animated WebP, APNG (Animated PNG), Animated SVG, Animated AVIF.
   - **Ảnh tĩnh (Static)**: JPEG/JPG, PNG, WebP, SVG, BMP, ICO, AVIF, TIFF/TIF (tự động convert hiển thị on-the-fly).
2. **Preview động ngay lập tức**:
   - Khi chọn ảnh, chế độ preview tự động phát ảnh động mượt mà ở đúng tốc độ khung hình gốc.
   - Hỗ trợ nút **Pause / Play** (đóng băng frame hiện tại bằng Canvas hoặc tiếp tục phát) chỉ với 1 phím `Space`.
3. **CLI trực quan**:
   - Chạy trực tiếp với folder: `imgv .` hoặc `imgv /path/to/folder` hoặc `imgv ~/Pictures`.
   - Hỗ trợ cờ đệ quy `-r` / `--recursive` để quét cả thư mục con (có thể bật/tắt ngay trên UI).
4. **Trải nghiệm Desktop Native**:
   - Tự động mở cửa sổ độc lập (Chromium app-mode không thanh địa chỉ/tabs) hoặc fallback về trình duyệt mặc định.
   - Tự động đóng server khi tắt cửa sổ hoặc bấm `Ctrl+C`.
5. **Bộ công cụ xem ảnh chuyên nghiệp**:
   - Zoom mượt mà bằng con lăn chuột theo vị trí con trỏ chuột (0.05x - 25x).
   - Kéo rê (pan/drag) khi phóng to.
   - Phím tắt `0` để Fit to screen, `1` để xem tỉ lệ 100% (1:1).
   - Xoay ảnh 90° (`R`), Fullscreen (`F`).
   - Copy đường dẫn file (`C`), mở vị trí file trong File Manager (`📂`).
   - Bộ lọc thông minh: Lọc nhanh ảnh động (⚡ Animated), ảnh tĩnh (Static), lọc theo định dạng (GIF, WebP, PNG...), tìm kiếm tức thì theo tên (`/`).

---

## 🚀 Cài đặt & Build

Chương trình được đóng gói thành **1 file nhị phân duy nhất** (single standalone binary) không phụ thuộc file ngoài nhờ Go `embed`:

```bash
cd /mnt/data/Work/mine/3.pets/img-viewer
go build -o imgv main.go
```

Cài đặt vào hệ thống để dùng lệnh `imgv` ở bất cứ đâu:
```bash
sudo mv imgv /usr/local/bin/
# hoặc cài vào user bin:
# mv imgv ~/.local/bin/
```

---

## 💻 Cách sử dụng CLI

```bash
# Xem ảnh trong folder hiện tại
imgv .

# Xem ảnh trong một thư mục cụ thể
imgv ~/Pictures
imgv /path/to/my-folder

# Quét đệ quy cả các thư mục con
imgv -r ~/Wallpapers

# Chỉ định cổng mạng hoặc không tự bật cửa sổ
imgv -p 8080 --no-open .

# Xem hướng dẫn
imgv --help
```

---

## ⌨️ Phím tắt (Keyboard Shortcuts)

| Phím | Chức năng |
| :--- | :--- |
| `→` / `D` / `J` | Xem ảnh kế tiếp |
| `←` / `A` / `K` | Xem ảnh trước đó |
| `Space` | **Tạm dừng / Tiếp tục phát ảnh động** (Play/Pause) |
| `F` | Bật / tắt chế độ toàn màn hình (Fullscreen) |
| `0` | Fit ảnh vừa với màn hình |
| `1` | Xem kích thước thật 100% (1:1) |
| `+` / `-` | Phóng to / Thu nhỏ |
| `R` | Xoay ảnh 90 độ |
| `C` | Copy đường dẫn tuyệt đối của file |
| `Delete` | Xóa ảnh (có hộp thoại xác nhận) |
| `/` | Focus nhanh vào ô tìm kiếm |
| `?` | Bật bảng trợ giúp phím tắt |
| `Esc` | Thoát fullscreen hoặc đóng modal |
