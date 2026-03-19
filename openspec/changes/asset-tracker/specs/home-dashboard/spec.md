## ADDED Requirements

### Requirement: 淨資產總額顯示
系統 SHALL 在首頁頂部顯示最新快照的淨資產總額（所有類別換算台幣後加總）。

#### Scenario: 顯示總額
- **WHEN** 使用者進入首頁且有快照紀錄
- **THEN** 系統顯示最新快照的淨資產總額，格式為「NT$ X,XXX,XXX」

### Requirement: 卡片式資產總覽
系統 SHALL 以卡片形式顯示四大資產類別：股票、現金、定存、外幣現金。每張卡片包含：
- 左側色條（各類別不同顏色）
- 類別名稱
- 子類別摘要（如「台股、美股、英股」）
- 該類別的台幣總額
- 最後更新日期

#### Scenario: 顯示資產卡片
- **WHEN** 使用者進入首頁
- **THEN** 系統顯示 4 張資產卡片，各自顯示該類別的台幣總額與子類別摘要

#### Scenario: 無快照時顯示空狀態
- **WHEN** 無任何快照紀錄
- **THEN** 系統顯示引導訊息，提示建立第一筆快照

### Requirement: 卡片展開明細
使用者 SHALL 能夠點擊卡片展開，查看該類別的子項目明細。

#### Scenario: 展開股票卡片
- **WHEN** 使用者點擊股票卡片
- **THEN** 卡片展開顯示：台股 NT$ XXX / 美股 USD XXX → NT$ XXX / 英股 USD XXX → NT$ XXX

#### Scenario: 展開外幣現金卡片
- **WHEN** 使用者點擊外幣現金卡片
- **THEN** 卡片展開顯示：USD XXX → NT$ XXX / JPY XXX → NT$ XXX

### Requirement: 新增快照入口
系統 SHALL 在首頁右上角提供「+」按鈕，點擊後導航至新增快照頁面。

#### Scenario: 點擊新增按鈕
- **WHEN** 使用者點擊「+」按鈕
- **THEN** 導航至 /snapshot/new 頁面
