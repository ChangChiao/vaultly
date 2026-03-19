## 1. 專案初始化

- [ ] 1.1 建立 SvelteKit 5 專案，設定 TypeScript、Tailwind CSS
- [ ] 1.2 安裝依賴：@supabase/supabase-js、chart.js、svelte-chartjs
- [ ] 1.3 設定 Supabase 環境變數（.env）與 client 初始化

## 2. 資料庫設定

- [ ] 2.1 建立 Supabase 專案，取得 URL 與 anon key
- [ ] 2.2 建立 snapshots 資料表（id, user_id, date, created_at, updated_at）
- [ ] 2.3 建立 snapshot_entries 資料表（id, snapshot_id, category, original_amount, original_currency, exchange_rate, twd_amount, created_at）
- [ ] 2.4 設定 Row Level Security policies（使用者僅能存取自己的資料）
- [ ] 2.5 建立 snapshots.date + user_id 的 unique constraint

## 3. 認證功能

- [ ] 3.1 建立 /login 頁面（Email/Password 登入表單）
- [ ] 3.2 實作 Supabase Auth 登入/登出邏輯
- [ ] 3.3 實作 auth guard — 未登入時重導至 /login
- [ ] 3.4 在 layout 中管理 session 狀態

## 4. 匯率服務

- [ ] 4.1 建立匯率 API 呼叫模組（frankfurter.app，取得 USD/TWD、JPY/TWD）
- [ ] 4.2 實作匯率抓取失敗時的手動輸入 fallback UI

## 5. 快照管理

- [ ] 5.1 建立 /snapshot/new 頁面 — 新增快照表單（7 個固定欄位 + 日期選擇器）
- [ ] 5.2 整合匯率即時換算顯示（輸入外幣金額時即時顯示台幣換算）
- [ ] 5.3 實作快照儲存邏輯（建立 snapshot + 7 筆 entries，含匯率紀錄）
- [ ] 5.4 實作日期重複檢查
- [ ] 5.5 實作快照編輯功能
- [ ] 5.6 實作快照刪除功能（含確認對話框）

## 6. 首頁

- [ ] 6.1 建立首頁 layout — 頂部淨資產總額 + 右上角「+」按鈕
- [ ] 6.2 建立資產卡片元件（色條、類別名稱、子類別摘要、金額、更新日期）
- [ ] 6.3 實作卡片展開/收合 — 顯示子項目明細（原幣 + 台幣換算）
- [ ] 6.4 實作無快照時的空狀態畫面

## 7. 報表 Dashboard

- [ ] 7.1 建立 /reports 頁面 layout
- [ ] 7.2 實作資產配置圓餅圖（股票/現金/定存/外幣現金，4 塊）
- [ ] 7.3 實作股票市場比例圓餅圖（台股/美股/英股，3 塊）
- [ ] 7.4 實作資產趨勢折線圖（總資產 + 各類別線，X 軸為快照日期）
- [ ] 7.5 實作明細表（類別、金額、比例、與上次快照的變動）
- [ ] 7.6 處理邊界情況（無資料、僅一筆快照）

## 8. 導航與 Layout

- [ ] 8.1 建立底部 Tab 導航元件（首頁 / 報表）
- [ ] 8.2 整合至全域 layout，當前 Tab 高亮顯示
