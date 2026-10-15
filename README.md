# House of Canbran Taichung

肯邦屋官方展示網站，準備用於 GitHub + Vercel 自動部署。

## 部署方式

這個網站以前台靜態頁為主，並加入 Vercel API 後台管理。主要檔案如下：

- `index.html`
- `styles.css`
- `script.js`
- `admin.html`
- `admin.css`
- `admin.js`
- `api/`
- `assets/`

在 Vercel 匯入 GitHub repo 時，建議設定：

- Framework Preset: `Other`
- Build Command: 留空
- Output Directory: 留空或 `.`
- Install Command: 使用預設值

之後只要更新 GitHub 的 `main` 分支，Vercel 就會自動重新部署。

## 後台管理

後台網址：

- `/admin`

「商品」管理完整商品資料；「熱門髮品」可選擇及排序前台展示商品；「店長推薦」可獨立設定最多三席推薦商品、顯示名稱與推薦標籤。兩個分頁各有儲存按鈕，儲存其中一項不會套用另一頁尚未儲存的調整。設定存入現有 CMS，前台重新載入即可讀取。下架商品會自動略過，商品快搜仍涵蓋所有上架商品。

後台寫入和圖片上傳需要在 Vercel 設定環境變數：

- `CANBRAN_ADMIN_PASSWORD`
- `BLOB_READ_WRITE_TOKEN`

`BLOB_READ_WRITE_TOKEN` 由 Vercel Blob Store 提供。若尚未設定，前台會使用內建商品、優惠與美髮知識資料，後台可以讀取預覽，但無法真正儲存。
