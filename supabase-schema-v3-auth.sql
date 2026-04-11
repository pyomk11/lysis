-- =============================================
-- Lysis v3: 인증(Auth) + profiles 테이블
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 1) profiles 테이블 (auth.users와 1:1 연결)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 프로필: 본인 것만 읽기/수정, 누구나 생성 가능(회원가입 시)
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 교수자는 자기 강의 학생들의 프로필도 볼 수 있음
CREATE POLICY "teachers_see_students" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles AS p
      WHERE p.id = auth.uid() AND p.role = 'teacher'
    )
  );

-- 3) classes 테이블에 teacher_id 컬럼 추가
ALTER TABLE classes ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles(id);

-- 기존 classes RLS (없으면 추가)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

-- 누구나 초대코드로 조회 가능
CREATE POLICY "classes_select_all" ON classes
  FOR SELECT USING (true);

-- 교수자만 강의 생성
CREATE POLICY "classes_insert_teacher" ON classes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'teacher'
    )
  );

-- 교수자 본인 강의만 수정
CREATE POLICY "classes_update_own" ON classes
  FOR UPDATE USING (teacher_id = auth.uid());

-- 4) sessions 테이블에 student_id를 UUID로 활용할 수 있도록
--    (기존 student_id는 TEXT이므로, 새 컬럼 추가)
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);

-- sessions RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_insert_any" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "sessions_select_own" ON sessions
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM classes
      WHERE classes.id = sessions.class_id
        AND classes.teacher_id = auth.uid()
    )
  );

CREATE POLICY "sessions_update_own" ON sessions
  FOR UPDATE USING (user_id = auth.uid());

-- 5) messages / insights / guardrail_logs — 기존 테이블에 RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_insert_any" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_select_via_session" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = messages.session_id
      AND (
        s.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM classes c
          WHERE c.id = s.class_id AND c.teacher_id = auth.uid()
        )
      )
  )
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insights_insert_any" ON insights FOR INSERT WITH CHECK (true);
CREATE POLICY "insights_select_via_session" ON insights FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = insights.session_id
      AND (
        s.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM classes c
          WHERE c.id = s.class_id AND c.teacher_id = auth.uid()
        )
      )
  )
);

ALTER TABLE guardrail_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guardrail_logs_insert_any" ON guardrail_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "guardrail_logs_select_via_session" ON guardrail_logs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM sessions s
    WHERE s.id = guardrail_logs.session_id
      AND (
        s.user_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM classes c
          WHERE c.id = s.class_id AND c.teacher_id = auth.uid()
        )
      )
  )
);
