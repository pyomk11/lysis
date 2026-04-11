import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── 타입 ───────────────────────────────────────────────
export interface Session {
  id: string;
  student_id: string;
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
export async function createSession(studentId = "anonymous"): Promise<string | null> {
  const { data, error } = await supabase
    .from("sessions")
    .insert({ student_id: studentId })
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
