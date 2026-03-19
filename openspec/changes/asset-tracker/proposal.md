## Why

個人資產分散在多種類別（台股、美股、英股、現金、定存、外幣現金），缺乏統一的記錄與視覺化工具。需要一個簡單的網頁應用，定期以快照方式記錄各類資產，並透過 Dashboard 追蹤資產配置與趨勢變化。

## What Changes

- 建立全新的 SvelteKit 5 網頁應用
- 整合 Supabase 作為後端（Auth + Postgres）
- 首頁：卡片式資產總覽，可展開查看子項目明細
- 新增快照：固定欄位表單，原幣輸入，透過匯率 API（frankfurter.app）自動換算台幣
- 報表頁 Dashboard：圓餅圖 x2（資產配置比例、股票市場比例）+ 折線圖（資產趨勢）+ 明細表
- 底部 Tab 導航（首頁 / 報表）

## Capabilities

### New Capabilities

- `snapshot-management`: 快照的 CRUD — 建立、讀取、更新、刪除資產快照，包含固定的資產類別欄位（台股TWD、美股USD、英股USD、現金TWD、定存TWD、外幣現金USD/JPY）
- `exchange-rate`: 匯率整合 — 透過 frankfurter.app API 抓取 USD/JPY 對 TWD 的即時匯率，自動換算外幣金額為台幣
- `home-dashboard`: 首頁卡片式總覽 — 顯示淨資產總額、各類別卡片（含色條、金額、更新日期），點擊展開子項目明細
- `report-dashboard`: 報表 Dashboard — 圓餅圖（資產配置比例 4 塊：股票/現金/定存/外幣現金）、圓餅圖（股票市場比例 3 塊：台股/美股/英股）、折線圖（資產趨勢，含總資產與各類別線）、明細表
- `auth`: 使用者認證 — Supabase Auth，僅個人使用

### Modified Capabilities

（無既有 capabilities，此為全新專案）

## Impact

- **新增依賴**: SvelteKit 5, Supabase JS SDK, 圖表庫（如 Chart.js 或類似）, frankfurter.app API
- **基礎建設**: 需建立 Supabase 專案（Auth + Postgres DB）
- **資料庫**: 需建立 snapshots 與 snapshot_entries 資料表，設定 Row Level Security
- **外部 API**: 依賴 frankfurter.app 匯率服務（免費、無需 API key）
