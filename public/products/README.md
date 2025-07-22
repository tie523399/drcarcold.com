# 產品圖片目錄

這個目錄用於存放產品圖片。

## 圖片命名規則

- machine.jpg - 冷氣系統保養機
- r134a.jpg - R-134A 冷媒
- connector.jpg - 快速接頭
- oil.jpg - 冷凍油

## 圖片規格建議

- 尺寸：400x400 像素（正方形）
- 格式：JPG 或 PNG
- 檔案大小：建議小於 200KB
- 背景：白色或淺色背景為佳

## 如何替換圖片

1. 將您的產品圖片按照上述命名規則命名
2. 將圖片放入此目錄
3. 修改 `src/app/(public)/products/product-list.tsx` 中的圖片路徑：
   - 將 `https://images.unsplash.com/...` 改為 `/products/您的圖片檔名.jpg`

## 範例

```javascript
// 原本的程式碼
image: 'https://images.unsplash.com/photo-1630700225710-2cc6e58f0ac5?w=400&h=400&fit=crop',

// 改為
image: '/products/machine.jpg',
```

## 注意事項

- 確保圖片版權合法
- 優化圖片大小以提升網站載入速度
- 使用描述性的檔名 
 

這個目錄用於存放產品圖片。

## 圖片命名規則

- machine.jpg - 冷氣系統保養機
- r134a.jpg - R-134A 冷媒
- connector.jpg - 快速接頭
- oil.jpg - 冷凍油

## 圖片規格建議

- 尺寸：400x400 像素（正方形）
- 格式：JPG 或 PNG
- 檔案大小：建議小於 200KB
- 背景：白色或淺色背景為佳

## 如何替換圖片

1. 將您的產品圖片按照上述命名規則命名
2. 將圖片放入此目錄
3. 修改 `src/app/(public)/products/product-list.tsx` 中的圖片路徑：
   - 將 `https://images.unsplash.com/...` 改為 `/products/您的圖片檔名.jpg`

## 範例

```javascript
// 原本的程式碼
image: 'https://images.unsplash.com/photo-1630700225710-2cc6e58f0ac5?w=400&h=400&fit=crop',

// 改為
image: '/products/machine.jpg',
```

## 注意事項

- 確保圖片版權合法
- 優化圖片大小以提升網站載入速度
- 使用描述性的檔名 