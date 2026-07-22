# House of Canbran Taichung

肯邦屋官方展示網站，準備用於 GitHub + Vercel 自動部署。

## 部署方式

這是一個純靜態網站，主要檔案如下：

- `index.html`
- `styles.css`
- `script.js`
- `assets/`

在 Vercel 匯入 GitHub repo 時，建議設定：

- Framework Preset: `Other`
- Build Command: 留空
- Output Directory: 留空或 `.`
- Install Command: 留空

之後只要更新 GitHub 的 `main` 分支，Vercel 就會自動重新部署。
