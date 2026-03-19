## ADDED Requirements

### Requirement: 使用者登入
系統 SHALL 支援 Supabase Auth 的 Email/Password 登入方式。

#### Scenario: 成功登入
- **WHEN** 使用者輸入正確的 email 與密碼
- **THEN** 系統驗證通過，導航至首頁

#### Scenario: 登入失敗
- **WHEN** 使用者輸入錯誤的 email 或密碼
- **THEN** 系統顯示錯誤訊息

### Requirement: 未登入保護
系統 SHALL 在使用者未登入時，將所有頁面（除 /login）重導至登入頁。

#### Scenario: 未登入存取首頁
- **WHEN** 未登入的使用者嘗試存取 /
- **THEN** 系統重導至 /login

### Requirement: 登出
系統 SHALL 提供登出功能。

#### Scenario: 成功登出
- **WHEN** 使用者點擊登出
- **THEN** 系統清除 session，導航至 /login

### Requirement: 資料隔離
系統 SHALL 透過 Supabase Row Level Security 確保使用者只能存取自己的快照資料。

#### Scenario: 查詢資料
- **WHEN** 使用者查詢快照
- **THEN** 系統 SHALL 僅回傳該使用者的資料，不得存取其他使用者的快照
