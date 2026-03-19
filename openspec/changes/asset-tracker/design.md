## Context

全新專案，目標是建立個人資產記錄網頁。使用者（僅一人）定期以快照方式記錄各類資產（台股、美股、英股、現金、定存、外幣現金），並透過 Dashboard 視覺化追蹤資產配置與趨勢。

目前沒有既有程式碼或資料庫，從零開始。

## Goals / Non-Goals

**Goals:**
- 建立可運作的 SvelteKit 5 應用，支援快照式資產記錄
- 整合 Supabase 作為認證與資料儲存
- 自動抓取匯率換算外幣為台幣
- 提供直覺的首頁（卡片式總覽）與報表頁（圓餅圖、折線圖）

**Non-Goals:**
- 不做交易紀錄或即時股價追蹤
- 不做多使用者或分享功能
- 不做手機原生 App（純網頁）
- 不做自動匯入（如券商 API 串接）

## Decisions

### 1. 前端框架：SvelteKit 5

使用 SvelteKit 5 搭配 Svelte 5 的 runes 語法。SvelteKit 提供 SSR、路由、API routes 等完整功能。

**Alternatives considered:**
- Next.js (React) — 生態系更大，但使用者偏好 Svelte
- Nuxt (Vue) — 同上

### 2. 後端：Supabase

使用 Supabase Cloud 作為 BaaS，提供 Auth + Postgres + Row Level Security。

**Alternatives considered:**
- 自建後端 (Express/Fastify + Postgres) — 完全控制但開發維護成本高，對個人專案過重
- Firebase — NoSQL 不適合結構化的資產數據，且資料可攜性較差

### 3. 資料模型

```
snapshots
├── id (uuid, PK)
├── user_id (uuid, FK → auth.users)
├── date (date, unique per user)
├── created_at (timestamptz)
└── updated_at (timestamptz)

snapshot_entries
├── id (uuid, PK)
├── snapshot_id (uuid, FK → snapshots)
├── category (text) — 'stock_tw' | 'stock_us' | 'stock_uk' | 'cash' | 'deposit' | 'forex_usd' | 'forex_jpy'
├── original_amount (numeric) — 原幣金額
├── original_currency (text) — 'TWD' | 'USD' | 'JPY'
├── exchange_rate (numeric) — 當時匯率（TWD 為 1）
├── twd_amount (numeric) — 換算後台幣金額
└── created_at (timestamptz)
```

每次快照固定 7 筆 entries（台股、美股、英股、現金、定存、外幣USD、外幣JPY）。金額為 0 的項目也儲存，確保資料完整性。

**Rationale:** 將 exchange_rate 存入 DB 是為了保留歷史匯率紀錄，即使未來匯率變動也能回溯當時的換算依據。

### 4. 匯率 API：frankfurter.app

免費、無需 API key、資料來源為歐洲央行（ECB）每日更新。

**Alternatives considered:**
- ExchangeRate-API — 需註冊，有月額度限制
- 台灣央行 — 資料格式難處理，無標準 REST API

**Limitation:** ECB 匯率與台灣銀行牌告有微小差異，對快照式記錄可接受。

### 5. 圖表庫：Chart.js + svelte-chartjs

Chart.js 輕量、支援圓餅圖與折線圖，svelte-chartjs 提供 Svelte wrapper。

**Alternatives considered:**
- D3.js — 功能強大但對簡單圖表過於複雜
- Apache ECharts — 功能豐富但包較大

### 6. 頁面結構

```
/              → 首頁（卡片式資產總覽）
/reports       → 報表 Dashboard（圓餅圖 + 折線圖 + 明細表）
/snapshot/new  → 新增快照
/login         → 登入頁
```

底部 Tab 導航切換首頁與報表。

### 7. 樣式方案：Tailwind CSS v4

使用 Tailwind CSS v4 進行樣式設計。v4 改用 CSS-first 設定方式（透過 `@import "tailwindcss"` 取代舊版的 tailwind.config.js），與 SvelteKit 5 搭配使用。

## Risks / Trade-offs

- **[frankfurter.app 服務中斷]** → 匯率抓取失敗時，允許使用者手動輸入匯率作為 fallback
- **[ECB 匯率精度]** → 與台灣銀行牌告有差異，但快照式記錄可接受此誤差
- **[Supabase 免費額度]** → 500MB DB、50K MAU，個人使用完全足夠，短期無風險
- **[資料遺失]** → Supabase 提供自動備份（Pro plan），免費方案可定期手動匯出
