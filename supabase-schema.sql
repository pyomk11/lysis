-- ═══════════════════════════════════════════════════
-- Lysis DB Schema for Supabase
-- ═══════════════════════════════════════════════════

-- 1. 학습 세션 — 학생 한 명이 Lysis를 열 때마다 생성
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  student_id text not null default 'anonymous',   -- 추후 인증 연동 시 사용
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  code_snapshot text,                               -- 마지막 코드 상태
  created_at timestamptz not null default now()
);

-- 2. 메시지 로그 — 대화 한 턴(학생/AI)마다 기록
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  hint_level text,                                  -- L1, L2, L3 또는 null
  code_context text,                                -- 해당 시점의 학생 코드
  execution_result text,                            -- 실행 결과 (있을 경우)
  created_at timestamptz not null default now()
);

-- 3. 학습 인사이트 — AI가 진단한 "막힌 지점" 요약
create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  message_id uuid references messages(id) on delete set null,
  concept text not null,                            -- 막힌 개념 (예: "list comprehension")
  difficulty text check (difficulty in ('low', 'medium', 'high')),
  resolved boolean not null default false,          -- 학생이 스스로 해결했는지
  created_at timestamptz not null default now()
);

-- 4. 가드레일 로그 — 답 요청이 차단된 기록
create table if not exists guardrail_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  blocked_message text not null,                    -- 차단된 학생 메시지
  reason text,                                      -- 차단 사유
  created_at timestamptz not null default now()
);

-- ─── 인덱스 ───
create index if not exists idx_messages_session on messages(session_id);
create index if not exists idx_insights_session on insights(session_id);
create index if not exists idx_insights_concept on insights(concept);
create index if not exists idx_guardrail_session on guardrail_logs(session_id);
create index if not exists idx_sessions_student on sessions(student_id);

-- ─── RLS (Row Level Security) — 일단 비활성화, 추후 인증 추가 시 활성화 ───
alter table sessions enable row level security;
alter table messages enable row level security;
alter table insights enable row level security;
alter table guardrail_logs enable row level security;

-- 임시: anon 키로 모든 작업 허용 (공모전 데모용)
create policy "Allow all for anon" on sessions for all using (true) with check (true);
create policy "Allow all for anon" on messages for all using (true) with check (true);
create policy "Allow all for anon" on insights for all using (true) with check (true);
create policy "Allow all for anon" on guardrail_logs for all using (true) with check (true);
