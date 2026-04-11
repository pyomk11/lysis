import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/dashboard?days=7&classId=xxx
 * 교수자 대시보드용 통합 데이터 조회 (강의별 필터 지원)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId") || null;
  const teacherId = searchParams.get("teacherId") || null;

  // 날짜 범위: from/to (YYYY-MM-DD) 또는 days 폴백
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const since = fromParam
    ? new Date(fromParam).toISOString()
    : new Date(Date.now() - 7 * 86400000).toISOString();
  // to는 하루 끝(23:59:59)까지 포함
  const until = toParam
    ? new Date(toParam + "T23:59:59").toISOString()
    : new Date().toISOString();

  try {
    // ─── 세션 ID 목록 조회 (강의 또는 교수자 기준 필터) ───
    let sessionIds: string[] | null = null;

    if (classId) {
      // 특정 강의의 세션만
      const { data: sessions } = await supabase
        .from("sessions")
        .select("id")
        .eq("class_id", classId)
        .gte("created_at", since)
        .lte("created_at", until);
      sessionIds = (sessions ?? []).map((s) => s.id);
    } else if (teacherId) {
      // 교수자 본인 강의들의 세션만
      const { data: classes } = await supabase
        .from("classes")
        .select("id")
        .eq("teacher_id", teacherId);
      const classIds = (classes ?? []).map((c) => c.id);

      if (classIds.length === 0) {
        sessionIds = [];
      } else {
        const { data: sessions } = await supabase
          .from("sessions")
          .select("id")
          .in("class_id", classIds)
          .gte("created_at", since)
          .lte("created_at", until);
        sessionIds = (sessions ?? []).map((s) => s.id);
      }
    }

    // ─── 헬퍼: 세션 필터 + 날짜 범위 적용 ───
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyFilter = (query: any) => {
      query = query.gte("created_at", since).lte("created_at", until);
      if (sessionIds !== null) {
        query = query.in("session_id", sessionIds.length > 0 ? sessionIds : ["__none__"]);
      }
      return query;
    };

    // ─── 병렬 조회 ───
    // 세션 수
    let sessionsQuery = supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .gte("created_at", since)
      .lte("created_at", until);
    if (sessionIds !== null) {
      sessionsQuery = sessionsQuery.in("id", sessionIds.length > 0 ? sessionIds : ["__none__"]);
    }
    const sessionsRes = await sessionsQuery;

    const [
      messagesRes,
      guardrailRes,
      insightsRes,
      hintLevelsRes,
      resolvedRes,
    ] = await Promise.all([
      applyFilter(supabase.from("messages").select("*", { count: "exact", head: true })),
      applyFilter(supabase.from("guardrail_logs").select("*", { count: "exact", head: true })),
      applyFilter(supabase.from("insights").select("concept, difficulty, resolved")),
      applyFilter(
        supabase.from("messages").select("hint_level")
          .eq("role", "assistant")
          .not("hint_level", "is", null)
      ),
      applyFilter(supabase.from("insights").select("resolved")),
    ]);

    // ─── 개념별 빈도 TOP 5 ───
    const conceptFreq: Record<string, number> = {};
    (insightsRes.data ?? []).forEach(({ concept }: { concept: string }) => {
      conceptFreq[concept] = (conceptFreq[concept] ?? 0) + 1;
    });
    const topConcepts = Object.entries(conceptFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([concept, count]) => ({ concept, count }));

    // ─── 힌트 레벨 분포 ───
    const hintDist: Record<string, number> = { L1: 0, L2: 0, L3: 0 };
    (hintLevelsRes.data ?? []).forEach(({ hint_level }: { hint_level: string }) => {
      if (hint_level && hintDist[hint_level] !== undefined) {
        hintDist[hint_level]++;
      }
    });

    // ─── 스스로 해결 비율 ───
    const allInsights = resolvedRes.data ?? [];
    const resolvedCount = allInsights.filter((i: { resolved: boolean }) => i.resolved).length;
    const resolvedRate =
      allInsights.length > 0
        ? Math.round((resolvedCount / allInsights.length) * 100)
        : 0;

    return NextResponse.json({
      from: since,
      to: until,
      stats: {
        totalSessions: sessionsRes.count ?? 0,
        totalMessages: messagesRes.count ?? 0,
        guardrailBlocks: guardrailRes.count ?? 0,
        resolvedRate,
      },
      topConcepts,
      hintDistribution: hintDist,
    });
  } catch (error) {
    console.error("대시보드 API 오류:", error);
    return NextResponse.json(
      { error: "데이터를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
