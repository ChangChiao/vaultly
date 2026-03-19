## ADDED Requirements

### Requirement: 自動取得匯率
系統 SHALL 在使用者建立或編輯快照時，自動從 frankfurter.app API 取得 USD/TWD 及 JPY/TWD 的匯率。

#### Scenario: 成功取得匯率
- **WHEN** 使用者開啟新增快照表單
- **THEN** 系統自動抓取當日 USD 及 JPY 對 TWD 的匯率，並即時顯示各外幣欄位的台幣換算結果

#### Scenario: API 無法連線
- **WHEN** frankfurter.app API 無法連線或回傳錯誤
- **THEN** 系統 SHALL 允許使用者手動輸入匯率作為 fallback

### Requirement: 即時換算顯示
系統 SHALL 在使用者輸入外幣金額時，即時顯示換算後的台幣金額。

#### Scenario: 輸入美股金額
- **WHEN** 使用者在美股欄位輸入 USD 10,000，當日匯率為 32.5
- **THEN** 系統即時顯示「→ NT$ 325,000」

#### Scenario: 修改金額即時更新
- **WHEN** 使用者修改外幣金額
- **THEN** 換算結果 SHALL 即時更新，無需手動觸發

### Requirement: 儲存歷史匯率
系統 SHALL 將快照建立時使用的匯率儲存於 snapshot_entries.exchange_rate 欄位，作為歷史紀錄。

#### Scenario: 回顧歷史快照
- **WHEN** 使用者查看過去的快照
- **THEN** 顯示的台幣金額 SHALL 基於當時儲存的匯率，而非當前匯率
