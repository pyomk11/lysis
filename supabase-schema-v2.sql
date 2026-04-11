-- ═══════════════════════════════════════════════════
-- Lysis DB Schema v2 — 강의(클래스) 분리
-- ═══════════════════════════════════════════════════

-- 1. 강의 테이블
create table if not exists classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,                              -- 강의명 (예: "파이썬 기초 A반")
  instructor text not null default '교수자',        -- 교수자 이름
  invite_code text not null unique,                -- 학생 입장용 초대코드 (6자리)
  created_at timestamptz not null default now()
);

-- 2. sessions에 class_id 추가
alter table sessions add column if not exists class_id uuid references classes(id) on delete set null;

-- 인덱스
create index if not exists idx_sessions_class on sessions(class_id);
create index if not exists idx_classes_invite on classes(invite_code);

-- RLS 정책 (데모용 — 모두 허용)
alter table classes enable row level security;
create policy "Allow all for anon" on classes for all using (true) with check (true);
