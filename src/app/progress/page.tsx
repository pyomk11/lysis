"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getProfile,
  getStudentSessions,
  getStudentTopConcepts,
  signOut,
} from "@/lib/supabase";
import type { Profile, SessionSummary } from "@/lib/supabase";

interface TopConcept {
  concept: string;
  count: number;
  resolved: number;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(start: string, end?: string) {
  if (!end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "1분 미만";
  if (min < 60) return `${min}분`;
  return `${Math.floor(min / 60)}시간 ${min % 60}분`;
}

export default function ProgressPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [topConcepts, setTopConcepts] = useState<TopConcept[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) { router.replace("/login"); return; }
      const p = await getProfile(user.id);
      if (!p || p.role !== "student") { router.replace("/app"); return; }
      setProfile(p);

      const [sess, concepts] = await Promise.all([
        getStudentSessions(user.id),
        getStudentTopConcepts(user.id),
      ]);
      setSessions(sess);
      setTopConcepts(concepts);
      setLoading(false);
    })();
  }, [router]);

  // 전체 통계
  const totalMessages = sessions.reduce((s, sess) => s + sess.message_count, 0);
  const totalConcepts = sessions.reduce((s, sess) => s + sess.concepts.length, 0);
  const resolvedConcepts = sessions.reduce(
    (s, sess) => s + sess.concepts.filter((c) => c.resolved).length, 0
  );
  const resolveRate = totalConcepts > 0
    ? Math.round((resolvedConcepts / totalConcepts) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#FBF9F6" }}>
        <p style={{ color: "#6B6863" }}>학습 기록을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Pretendard Variable', Pretendard, system-ui, sans-serif", background: "#FBF9F6", minHeight: "100vh", color: "#2B2B2B" }}>

      {/* 헤더 */}
      <header style={{
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(251,249,246,.9)", backdropFilter: "blur(14px)",
        borderBottom: "1px solid #E8E2D8",
      }}>
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/app" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#2B2B2B", opacity: 0.75 }}>
              <svg width="22" height="22" viewBox="0 0 120 120" aria-hidden="true">
                <path d="M 60 42 L 30 98" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M 60 42 L 90 98" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M 60 42 C 55 28, 42 18, 32 22" fill="none" stroke="#E8834B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontWeight: 700, fontSize: 18 }}>Lysis</span>
            </Link>
            <span style={{ color: "#E8E2D8" }}>·</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>내 학습 기록</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "#2B2B2B", fontWeight: 600 }}>{profile?.name}</span>
            <button
              onClick={async () => { await signOut(); router.replace("/login"); }}
              style={{ fontSize: 12, color: "#888", background: "none", border: "1px solid #E8E2D8", borderRadius: 999, padding: "4px 12px", cursor: "pointer" }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}>

        {/* 요약 통계 */}
        <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
          {[
            { label: "총 학습 세션", value: sessions.length, sub: "번의 학습" },
            { label: "총 질문 수", value: totalMessages, sub: "개의 질문" },
            { label: "막힌 개념", value: totalConcepts, sub: "개 기록됨" },
            { label: "스스로 해결", value: `${resolveRate}%`, sub: `${resolvedConcepts}/${totalConcepts}개` },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ background: "white", border: "1px solid #E8E2D8", borderRadius: 16, padding: "20px 22px" }}>
              <p style={{ fontSize: 12, color: "#6B6863", marginBottom: 6, fontWeight: 500 }}>{label}</p>
              <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.02em", marginBottom: 2 }}>{value}</p>
              <p style={{ fontSize: 12, color: "#A09B94" }}>{sub}</p>
            </div>
          ))}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>

          {/* 자주 막힌 개념 TOP 8 */}
          <div style={{ background: "white", border: "1px solid #E8E2D8", borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>자주 막혔던 개념</h2>
            {topConcepts.length === 0 ? (
              <p style={{ color: "#A09B94", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
                아직 기록이 없어요
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {topConcepts.map(({ concept, count, resolved }, i) => {
                  const max = topConcepts[0].count;
                  const pct = Math.round((count / max) * 100);
                  const resolvePct = count > 0 ? Math.round((resolved / count) * 100) : 0;
                  return (
                    <div key={concept} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#E8834B", minWidth: 24, paddingTop: 2 }}>#{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{concept}</span>
                          <span style={{ fontSize: 12, color: resolvePct >= 50 ? "#22a361" : "#6B6863" }}>
                            해결 {resolvePct}%
                          </span>
                        </div>
                        <div style={{ height: 6, background: "#F4EFE8", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: "#E8834B", borderRadius: 3 }} />
                        </div>
                        <p style={{ fontSize: 11, color: "#A09B94", marginTop: 3 }}>{count}회 등장</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 힌트 사용 패턴 */}
          <div style={{ background: "white", border: "1px solid #E8E2D8", borderRadius: 16, padding: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>힌트 사용 패턴</h2>
            {(() => {
              const total = { L1: 0, L2: 0, L3: 0 };
              sessions.forEach((s) => {
                total.L1 += s.hint_levels.L1 ?? 0;
                total.L2 += s.hint_levels.L2 ?? 0;
                total.L3 += s.hint_levels.L3 ?? 0;
              });
              const sum = total.L1 + total.L2 + total.L3;
              if (sum === 0) return (
                <p style={{ color: "#A09B94", fontSize: 14, textAlign: "center", padding: "24px 0" }}>아직 기록이 없어요</p>
              );
              const pct = (n: number) => Math.round((n / sum) * 100);
              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* 스택 바 */}
                  <div style={{ display: "flex", height: 24, borderRadius: 12, overflow: "hidden", gap: 2 }}>
                    {total.L1 > 0 && <div style={{ flex: total.L1, background: "#FBE4D4", borderRadius: 12 }} />}
                    {total.L2 > 0 && <div style={{ flex: total.L2, background: "#E8834B", borderRadius: 12 }} />}
                    {total.L3 > 0 && <div style={{ flex: total.L3, background: "#2B2B2B", borderRadius: 12 }} />}
                  </div>
                  {/* 범례 */}
                  {[
                    { label: "L1 개념 환기", color: "#FBE4D4", border: "1px solid #E8E2D8", count: total.L1, p: pct(total.L1) },
                    { label: "L2 방향 제시", color: "#E8834B", border: "none", count: total.L2, p: pct(total.L2) },
                    { label: "L3 의사코드", color: "#2B2B2B", border: "none", count: total.L3, p: pct(total.L3) },
                  ].map(({ label, color, border, count, p }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, border, flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{label}</span>
                      <span style={{ color: "#6B6863", fontWeight: 600 }}>{p}% ({count})</span>
                    </div>
                  ))}
                  {/* 인사이트 */}
                  <div style={{ background: "#F4EFE8", borderRadius: 12, padding: "14px 16px", fontSize: 13, color: "#6B6863", lineHeight: 1.6 }}>
                    {pct(total.L1) >= 50 && <p>개념을 살짝 환기하는 것만으로 대부분 해결하고 있어요. 기초가 탄탄해지고 있는 신호예요.</p>}
                    {pct(total.L3) >= 40 && <p>L3 힌트를 자주 사용하고 있어요. 기초 개념을 한 번 더 복습하면 도움이 될 거예요.</p>}
                    {pct(total.L2) >= 50 && <p>방향 제시 수준에서 잘 해결하고 있어요. 균형 잡힌 학습 패턴이에요.</p>}
                    {sum > 0 && pct(total.L1) < 50 && pct(total.L2) < 50 && pct(total.L3) < 40 && (
                      <p>다양한 수준의 힌트를 고르게 활용하고 있어요.</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* 세션 목록 */}
        <div style={{ background: "white", border: "1px solid #E8E2D8", borderRadius: 16, padding: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>세션 기록</h2>
          {sessions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#A09B94" }}>
              <p style={{ marginBottom: 12 }}>아직 학습 기록이 없어요.</p>
              <Link href="/app" style={{ fontSize: 13, color: "#E8834B", textDecoration: "none", fontWeight: 600 }}>
                지금 학습 시작하기 →
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {sessions.map((sess) => {
                const duration = formatDuration(sess.started_at, sess.ended_at);
                const hintsTotal = (sess.hint_levels.L1 ?? 0) + (sess.hint_levels.L2 ?? 0) + (sess.hint_levels.L3 ?? 0);
                return (
                  <div
                    key={sess.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 16,
                      padding: "14px 0", borderBottom: "1px solid #F4EFE8",
                    }}
                  >
                    {/* 날짜 */}
                    <div style={{ minWidth: 90 }}>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{formatDate(sess.started_at)}</p>
                      <p style={{ fontSize: 12, color: "#A09B94" }}>{formatTime(sess.started_at)}</p>
                    </div>

                    {/* 강의명 */}
                    <div style={{ minWidth: 100 }}>
                      {sess.class_name ? (
                        <span style={{ fontSize: 12, fontWeight: 600, color: "#E8834B", background: "#FBE4D4", padding: "2px 8px", borderRadius: 999 }}>
                          {sess.class_name}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "#A09B94" }}>자유 연습</span>
                      )}
                    </div>

                    {/* 질문 수 */}
                    <div style={{ fontSize: 13, color: "#6B6863", minWidth: 60 }}>
                      질문 <strong style={{ color: "#2B2B2B" }}>{sess.message_count}</strong>개
                    </div>

                    {/* 힌트 */}
                    <div style={{ fontSize: 13, color: "#6B6863", minWidth: 60 }}>
                      힌트 <strong style={{ color: "#2B2B2B" }}>{hintsTotal}</strong>회
                    </div>

                    {/* 막힌 개념 */}
                    <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {sess.concepts.slice(0, 4).map(({ concept, resolved }) => (
                        <span
                          key={concept}
                          style={{
                            fontSize: 11, padding: "2px 8px", borderRadius: 999,
                            background: resolved ? "#d4f5e2" : "#F4EFE8",
                            color: resolved ? "#22a361" : "#6B6863",
                            fontWeight: 500,
                          }}
                        >
                          {concept}
                        </span>
                      ))}
                      {sess.concepts.length > 4 && (
                        <span style={{ fontSize: 11, color: "#A09B94" }}>+{sess.concepts.length - 4}</span>
                      )}
                    </div>

                    {/* 소요 시간 */}
                    {duration && (
                      <div style={{ fontSize: 12, color: "#A09B94", minWidth: 50, textAlign: "right" }}>
                        {duration}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
