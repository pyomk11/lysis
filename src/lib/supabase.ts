import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── 타입 ───────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  role: "teacher" | "student";
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  instructor: string;
  invite_code: string;
  teacher_id?: string;
  created_at: string;
}

export interface Session {
  id: string;
  student_id: string;
  class_id?: string;
  user_id?: string;
  started_at: string;
  ended_at?: string;
  code_snapshot?: string;
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  hint_level?: string;
  code_context?: string;
  execution_result?: string;
  created_at: string;
}

export interface Insight {
  id: string;
  session_id: string;
  message_id?: string;
  concept: string;
  difficulty?: "low" | "medium" | "high";
  resolved: boolean;
  created_at: string;
}

// ─── 세션 ───────────────────────────────────────────────

/** 새 학습 세션 시작 */
export async function createSession(studentId = "anonymous", classId?: string, userId?: string): Promise<string | null> {
  const row: Record<string, string> = { student_id: studentId };
  if (classId) row.class_id = classId;
  if (userId) row.user_id = userId;

  const { data, error } = await supabase
    .from("sessions")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("세션 생성 실패:", error.message);
    return null;
  }
  return data.id;
}

/** 세션 종료 — 코드 스냅샷 저장 */
export async function endSession(sessionId: string, codeSnapshot?: string) {
  const { error } = await supabase
    .from("sessions")
    .update({ ended_at: new Date().toISOString(), code_snapshot: codeSnapshot })
    .eq("id", sessionId);

  if (error) console.error("세션 종료 실패:", error.message);
}

// ─── 메시지 ─────────────────────────────────────────────

/** 메시지 1개 저장 */
export async function saveMessage(params: {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  hintLevel?: string;
  codeContext?: string;
  executionResult?: string;
}): Promise<string | null> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      session_id: params.sessionId,
      role: params.role,
      content: params.content,
      hint_level: params.hintLevel ?? null,
      code_context: params.codeContext ?? null,
      execution_result: params.executionResult ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("메시지 저장 실패:", error.message);
    return null;
  }
  return data.id;
}

// ─── 인사이트 ────────────────────────────────────────────

/** AI가 진단한 막힌 개념 저장 */
export async function saveInsight(params: {
  sessionId: string;
  messageId?: string;
  concept: string;
  difficulty?: "low" | "medium" | "high";
}) {
  const { error } = await supabase.from("insights").insert({
    session_id: params.sessionId,
    message_id: params.messageId ?? null,
    concept: params.concept,
    difficulty: params.difficulty ?? null,
    resolved: false,
  });

  if (error) console.error("인사이트 저장 실패:", error.message);
}

// ─── 가드레일 로그 ───────────────────────────────────────

/** 차단된 요청 기록 */
export async function saveGuardrailLog(params: {
  sessionId: string;
  blockedMessage: string;
  reason?: string;
}) {
  const { error } = await supabase.from("guardrail_logs").insert({
    session_id: params.sessionId,
    blocked_message: params.blockedMessage,
    reason: params.reason ?? null,
  });

  if (error) console.error("가드레일 로그 저장 실패:", error.message);
}

// ─── 대시보드용 조회 ─────────────────────────────────────

/** 최근 N일 인사이트 집계 (개념별 빈도) */
export async function getTopConcepts(days = 7, limit = 10) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase
    .from("insights")
    .select("concept")
    .gte("created_at", since);

  if (error || !data) return [];

  const freq: Record<string, number> = {};
  data.forEach(({ concept }) => {
    freq[concept] = (freq[concept] ?? 0) + 1;
  });

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([concept, count]) => ({ concept, count }));
}

/** 최근 N일 세션 요약 통계 */
export async function getSessionStats(days = 7) {
  const since = new Date(Date.now() - days * 86400000).toISOString();

  const [{ count: totalSessions }, { count: totalMessages }, { count: guardrailCount }] =
    await Promise.all([
      supabase.from("sessions").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("messages").select("*", { count: "exact", head: true }).gte("created_at", since),
      supabase.from("guardrail_logs").select("*", { count: "exact", head: true }).gte("created_at", since),
    ]);

  return {
    totalSessions: totalSessions ?? 0,
    totalMessages: totalMessages ?? 0,
    guardrailCount: guardrailCount ?? 0,
  };
}

// ─── 강의(클래스) ─────────────────────────────────────────

/** 랜덤 6자리 초대코드 생성 */
function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 혼동 문자 제외 (0/O, 1/I)
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** 새 강의 생성 */
export async function createClass(name: string, instructor: string, teacherId?: string): Promise<Class | null> {
  const invite_code = generateInviteCode();

  const row: Record<string, string> = { name, instructor, invite_code };
  if (teacherId) row.teacher_id = teacherId;

  const { data, error } = await supabase
    .from("classes")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("강의 생성 실패:", error.message);
    return null;
  }
  return data as Class;
}

/** 초대코드로 강의 조회 */
export async function findClassByCode(code: string): Promise<Class | null> {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("invite_code", code.toUpperCase())
    .single();

  if (error || !data) return null;
  return data as Class;
}

/** 강의 목록 조회 (teacherId가 있으면 해당 교수자 강의만) */
export async function listClasses(teacherId?: string): Promise<Class[]> {
  let query = supabase
    .from("classes")
    .select("*")
    .order("created_at", { ascending: false });

  if (teacherId) query = query.eq("teacher_id", teacherId);

  const { data, error } = await query;

  if (error || !data) return [];
  return data as Class[];
}

// ─── 인증 (Auth) ─────────────────────────────────────────

/** 회원가입 */
export async function signUp(email: string, password: string, name: string, role: "teacher" | "student") {
  // 1) Supabase Auth 회원가입
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || "회원가입 실패" };
  }

  // 2) profiles 테이블에 프로필 생성
  const { error: profileError } = await supabase
    .from("profiles")
    .insert({ id: authData.user.id, name, role });

  if (profileError) {
    return { error: profileError.message };
  }

  return { user: authData.user };
}

/** 로그인 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };
  return { user: data.user, session: data.session };
}

/** 로그아웃 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message };
}

/** 현재 로그인한 유저 가져오기 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** 프로필 가져오기 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

/** Auth 상태 변화 구독 */
export function onAuthStateChange(callback: (event: string, session: unknown) => void) {
  return supabase.auth.onAuthStateChange(callback);
}
