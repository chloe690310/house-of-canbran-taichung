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

後台寫入和圖片上傳需要在 Vercel 設定環境變數：

- `CANBRAN_ADMIN_PASSWORD`
- `BLOB_READ_WRITE_TOKEN`

`BLOB_READ_WRITE_TOKEN` 由 Vercel Blob Store 提供。若尚未設定，前台會使用內建商品、優惠與美髮知識資料，後台可以讀取預覽，但無法真正儲存。
