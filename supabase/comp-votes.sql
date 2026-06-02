-- 竞品投票云表（Supabase SQL Editor 中执行）
-- 免费项目：https://supabase.com → 新建项目 → SQL → 粘贴运行

create table if not exists public.comp_votes (
  id text primary key,
  voter_id text not null unique,
  voter_name text not null,
  product text not null,
  reasons jsonb not null default '[]'::jsonb,
  remark text default '',
  client_ip text default '',
  user_agent text default '',
  timestamp bigint not null,
  updated_at timestamptz not null default now()
);

create index if not exists comp_votes_timestamp_idx on public.comp_votes (timestamp desc);

alter table public.comp_votes enable row level security;

drop policy if exists "comp_votes_select" on public.comp_votes;
drop policy if exists "comp_votes_insert" on public.comp_votes;
drop policy if exists "comp_votes_update" on public.comp_votes;
drop policy if exists "comp_votes_delete" on public.comp_votes;

-- 内部投票场景：允许匿名读写（请勿存放敏感信息）
create policy "comp_votes_select" on public.comp_votes for select using (true);
create policy "comp_votes_insert" on public.comp_votes for insert with check (true);
create policy "comp_votes_update" on public.comp_votes for update using (true);
create policy "comp_votes_delete" on public.comp_votes for delete using (true);
