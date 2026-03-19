-- 建立 snapshots 資料表
create table snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- 建立 snapshot_entries 資料表
create table snapshot_entries (
  id uuid primary key default gen_random_uuid(),
  snapshot_id uuid not null references snapshots(id) on delete cascade,
  category text not null check (category in ('stock_tw', 'stock_us', 'stock_uk', 'cash', 'deposit', 'forex_usd', 'forex_jpy')),
  original_amount numeric not null default 0,
  original_currency text not null check (original_currency in ('TWD', 'USD', 'JPY')),
  exchange_rate numeric not null default 1,
  twd_amount numeric not null default 0,
  created_at timestamptz not null default now()
);

-- 啟用 Row Level Security
alter table snapshots enable row level security;
alter table snapshot_entries enable row level security;

-- RLS policies: 使用者僅能存取自己的 snapshots
create policy "Users can view own snapshots"
  on snapshots for select
  using (auth.uid() = user_id);

create policy "Users can insert own snapshots"
  on snapshots for insert
  with check (auth.uid() = user_id);

create policy "Users can update own snapshots"
  on snapshots for update
  using (auth.uid() = user_id);

create policy "Users can delete own snapshots"
  on snapshots for delete
  using (auth.uid() = user_id);

-- RLS policies: 透過 snapshot 關聯限制 entries 存取
create policy "Users can view own entries"
  on snapshot_entries for select
  using (snapshot_id in (select id from snapshots where user_id = auth.uid()));

create policy "Users can insert own entries"
  on snapshot_entries for insert
  with check (snapshot_id in (select id from snapshots where user_id = auth.uid()));

create policy "Users can update own entries"
  on snapshot_entries for update
  using (snapshot_id in (select id from snapshots where user_id = auth.uid()));

create policy "Users can delete own entries"
  on snapshot_entries for delete
  using (snapshot_id in (select id from snapshots where user_id = auth.uid()));

-- 自動更新 updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger snapshots_updated_at
  before update on snapshots
  for each row execute function update_updated_at();
