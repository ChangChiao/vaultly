## ADDED Requirements

### Requirement: 建立資產快照
系統 SHALL 提供快照建立表單，包含以下固定欄位：
- 日期（預設今天）
- 台股金額（TWD）
- 美股金額（USD）
- 英股金額（USD）
- 現金（TWD）
- 定存（TWD）
- 外幣現金 USD
- 外幣現金 JPY

所有金額欄位以原幣輸入。金額為 0 時亦 SHALL 儲存該筆 entry。

#### Scenario: 成功建立快照
- **WHEN** 使用者填寫所有欄位並點擊「儲存快照」
- **THEN** 系統建立一筆 snapshot 及 7 筆 snapshot_entries，所有外幣金額自動換算為台幣並儲存

#### Scenario: 日期重複
- **WHEN** 使用者嘗試建立已存在相同日期的快照
- **THEN** 系統 SHALL 顯示錯誤訊息，提示該日期已有快照紀錄

#### Scenario: 金額欄位為空
- **WHEN** 使用者未填寫某個金額欄位
- **THEN** 系統 SHALL 將該欄位視為 0

### Requirement: 讀取快照列表
系統 SHALL 提供快照列表，按日期降序排列，顯示每筆快照的日期與總資產金額（TWD）。

#### Scenario: 有快照紀錄
- **WHEN** 使用者進入首頁
- **THEN** 系統顯示最新一筆快照的資產總覽

#### Scenario: 無快照紀錄
- **WHEN** 使用者首次使用，無任何快照
- **THEN** 系統顯示空狀態提示，引導使用者建立第一筆快照

### Requirement: 更新快照
系統 SHALL 允許使用者編輯已存在的快照，修改任意金額欄位。

#### Scenario: 成功更新快照
- **WHEN** 使用者修改某筆快照的金額並儲存
- **THEN** 系統更新對應的 snapshot_entries，重新換算台幣金額

### Requirement: 刪除快照
系統 SHALL 允許使用者刪除快照，連同所有 snapshot_entries 一併刪除。

#### Scenario: 確認刪除
- **WHEN** 使用者點擊刪除並確認
- **THEN** 系統刪除該 snapshot 及所有關聯的 snapshot_entries
