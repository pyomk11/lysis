"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listClasses, createClass, getCurrentUser, getProfile, signOut } from "@/lib/supabase";
import type { Class, Profile } from "@/lib/supabase";
import "./dashboard.css";

interface DashboardData {
  from: string;
  to: string;
  stats: {
    totalSessions: number;
    totalMessages: number;
    guardrailBlocks: number;
    resolvedRate: number;
  };
  topConcepts: { concept: string; count: number }[];
  hintDistribution: { L1: number; L2: number; L3: number };
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // 날짜 범위: 기본값 최근 7일
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(sevenDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  // 강의 관련
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [creating, setCreating] = useState(false);

  // 인증 확인
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const p = await getProfile(user.id);
      if (!p || p.role !== "teacher") {
        router.replace("/app");
        return;
      }
      setProfile(p);
      setAuthChecked(true);
      // 교수자 본인 강의만 불러오기
      const cls = await listClasses(user.id);
      setClasses(cls);
    })();
  }, [router]);

  // 대시보드 데이터 불러오기 (인증 완료 후에만)
  useEffect(() => {
    if (!authChecked || !profile) return;
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ from: dateFrom, to: dateTo });
    if (selectedClassId) params.set("classId", selectedClassId);
    params.set("teacherId", profile.id);

    fetch(`/api/dashboard?${params}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo, selectedClassId, authChecked, profile]);

  // 강의 생성
  const handleCreateClass = async () => {
    if (!newClassName.trim() || !profile) return;
    setCreating(true);
    const created = await createClass(newClassName.trim(), profile.name, profile.id);
    if (created) {
      setClasses((prev) => [created, ...prev]);
      setSelectedClassId(created.id);
      setNewClassName("");
      setShowCreate(false);
    }
    setCreating(false);
  };

  // 로그아웃
  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const totalHints =
    data
      ? data.hintDistribution.L1 +
        data.hintDistribution.L2 +
        data.hintDistribution.L3
      : 0;

  const hintPercent = (level: "L1" | "L2" | "L3") =>
    totalHints > 0
      ? Math.round((data!.hintDistribution[level] / totalHints) * 100)
      : 0;

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg text-ink">
        <p className="text-ink-soft">인증 확인 중...</p>
      </div>
    );
  }

  return (
    <div className="dash">
      {/* 헤더 */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <Link href="/" className="dash-brand">
            <svg width="24" height="24" viewBox="0 0 120 120" aria-hidden="true">
              <path d="M 60 42 L 30 98" fill="none" stroke="#2B2B2B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 60 42 L 90 98" fill="none" stroke="#2B2B2B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 60 42 C 55 28, 42 18, 32 22" fill="none" stroke="#E8834B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="dash-brand-text">Lysis</span>
            <span className="dash-brand-sub">교수자 대시보드</span>
          </Link>

          {/* 날짜 범위 + 유저 정보 */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="dash-daterange">
              <input
                type="date"
                value={dateFrom}
                max={dateTo}
                onChange={(e) => setDateFrom(e.target.value)}
                className="dash-date-input"
              />
              <span className="dash-date-sep">–</span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom}
                max={today}
                onChange={(e) => setDateTo(e.target.value)}
                className="dash-date-input"
              />
            </div>
            <span style={{ fontSize: "13px", color: "#2B2B2B", fontWeight: 600 }}>{profile?.name}</span>
            <button
              onClick={handleLogout}
              style={{
                fontSize: "12px",
                color: "#888",
                background: "none",
                border: "1px solid #ddd",
                borderRadius: "999px",
                padding: "4px 12px",
                cursor: "pointer",
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="dash-main">
        {/* ─── 강의 선택 영역 ─── */}
        <section className="class-selector">
          <div className="class-selector-row">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="class-select"
            >
              <option value="">전체 강의</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.instructor})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowCreate(!showCreate)}
              className="class-create-btn"
            >
              + 새 강의 만들기
            </button>
          </div>

          {/* 선택된 강의 초대코드 표시 */}
          {selectedClass && (
            <div className="class-invite-info">
              초대코드: <span className="invite-code-display">{selectedClass.invite_code}</span>
              <span className="invite-hint">학생에게 이 코드를 공유하세요</span>
            </div>
          )}

          {/* 강의 생성 폼 */}
          {showCreate && (
            <div className="class-create-form">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="강의명 (예: 파이썬 기초 A반)"
                className="class-input"
              />
              <button
                onClick={handleCreateClass}
                disabled={creating || !newClassName.trim()}
                className="class-submit-btn"
              >
                {creating ? "생성 중..." : "강의 생성"}
              </button>
            </div>
          )}
        </section>

        {loading && (
          <div className="dash-loading">데이터를 불러오는 중...</div>
        )}

        {error && (
          <div className="dash-error">오류: {error}</div>
        )}

        {data && !loading && (
          <>
            {/* ─── 통계 카드 ─── */}
            <section className="stat-cards">
              <div className="stat-card">
                <span className="stat-label">총 학습 세션</span>
                <span className="stat-value">{data.stats.totalSessions}</span>
                <span className="stat-sub">{dateFrom} ~ {dateTo}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">총 대화 수</span>
                <span className="stat-value">{data.stats.totalMessages}</span>
                <span className="stat-sub">질문 + 응답</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">가드레일 차단</span>
                <span className="stat-value">{data.stats.guardrailBlocks}</span>
                <span className="stat-sub">답 요청 차단 건수</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">스스로 해결 비율</span>
                <span className="stat-value">{data.stats.resolvedRate}%</span>
                <span className="stat-sub">인사이트 기준</span>
              </div>
            </section>

            {/* ─── 막힌 개념 TOP 5 + 힌트 분포 ─── */}
            <section className="dash-grid">
              {/* 막힌 개념 TOP 5 */}
              <div className="dash-panel">
                <h2 className="panel-title">가장 많이 막힌 개념</h2>
                {data.topConcepts.length === 0 ? (
                  <p className="panel-empty">아직 데이터가 없습니다.</p>
                ) : (
                  <div className="concept-list">
                    {data.topConcepts.map(({ concept, count }, i) => {
                      const max = data.topConcepts[0].count;
                      const pct = Math.round((count / max) * 100);
                      return (
                        <div key={concept} className="concept-row">
                          <span className="concept-rank">#{i + 1}</span>
                          <div className="concept-info">
                            <div className="concept-header">
                              <span className="concept-name">{concept}</span>
                              <span className="concept-count">{count}회</span>
                            </div>
                            <div className="concept-bar-bg">
                              <div
                                className="concept-bar"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 힌트 레벨 분포 */}
              <div className="dash-panel">
                <h2 className="panel-title">힌트 레벨 분포</h2>
                {totalHints === 0 ? (
                  <p className="panel-empty">아직 데이터가 없습니다.</p>
                ) : (
                  <div className="hint-section">
                    <div className="hint-bar-container">
                      {data.hintDistribution.L1 > 0 && (
                        <div
                          className="hint-bar hint-l1"
                          style={{ flex: data.hintDistribution.L1 }}
                        />
                      )}
                      {data.hintDistribution.L2 > 0 && (
                        <div
                          className="hint-bar hint-l2"
                          style={{ flex: data.hintDistribution.L2 }}
                        />
                      )}
                      {data.hintDistribution.L3 > 0 && (
                        <div
                          className="hint-bar hint-l3"
                          style={{ flex: data.hintDistribution.L3 }}
                        />
                      )}
                    </div>

                    <div className="hint-legend">
                      <div className="hint-legend-item">
                        <span className="hint-dot hint-l1-dot" />
                        <span>L1 개념 환기</span>
                        <span className="hint-pct">{hintPercent("L1")}% ({data.hintDistribution.L1})</span>
                      </div>
                      <div className="hint-legend-item">
                        <span className="hint-dot hint-l2-dot" />
                        <span>L2 방향 제시</span>
                        <span className="hint-pct">{hintPercent("L2")}% ({data.hintDistribution.L2})</span>
                      </div>
                      <div className="hint-legend-item">
                        <span className="hint-dot hint-l3-dot" />
                        <span>L3 의사코드</span>
                        <span className="hint-pct">{hintPercent("L3")}% ({data.hintDistribution.L3})</span>
                      </div>
                    </div>

                    <div className="hint-insight">
                      {hintPercent("L1") >= 50 && (
                        <p>대부분 L1 수준에서 해결하고 있어요. 학생들이 개념은 알지만 적용에서 막히는 경우가 많습니다.</p>
                      )}
                      {hintPercent("L3") >= 40 && (
                        <p>L3 힌트가 많습니다. 기초 개념 설명을 보강하면 L1~L2에서 더 많이 해결할 수 있을 거예요.</p>
                      )}
                      {hintPercent("L2") >= 50 && (
                        <p>L2 방향 제시가 가장 많이 활용되고 있어요. 균형 잡힌 학습이 이뤄지고 있습니다.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
