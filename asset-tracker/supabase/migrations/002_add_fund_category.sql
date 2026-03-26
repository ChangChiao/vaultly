-- 新增基金類別到 snapshot_entries 的 category CHECK constraint
alter table snapshot_entries drop constraint snapshot_entries_category_check;
alter table snapshot_entries add constraint snapshot_entries_category_check
  check (category in ('stock_tw', 'stock_us', 'stock_uk', 'cash', 'deposit', 'fund', 'forex_usd', 'forex_jpy'));
