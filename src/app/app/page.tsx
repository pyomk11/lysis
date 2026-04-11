"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ChatMessage, ExecutionResult } from "@/types";
import Editor from "@/components/Editor";
import Chat from "@/components/Chat";
import { Play, RotateCcw, Moon, Sun } from "lucide-react";
import { createSession, findClassByCode, getCurrentUser, getProfile, signOut } from "@/lib/supabase";
import type { Class, Profile } from "@/lib/supabase";

const DEFAULT_CODE = `# 여기에 Python 코드를 작성하세요
# 예: 리스트에서 중복을 제거하는 함수를 만들어보세요

def remove_duplicates(lst):
    # TODO: 구현해보세요
    pass

print(remove_duplicates([1, 2, 2, 3, 3, 4]))
`;

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [joinStep, setJoinStep] = useState<"joining" | "ready">("joining");
  const [inviteInput, setInviteInput] = useState("");
  const [joinError, setJoinError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pyodideRef = useRef<any>(null);

  // 인증 확인
  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const p = await getProfile(user.id);
      if (!p) {
        router.replace("/login");
        return;
      }
      // 교수자가 /app에 오면 대시보드로
      if (p.role === "teacher") {
        router.replace("/dashboard");
        return;
      }
      setProfile(p);
      setAuthChecked(true);
    })();
  }, [router]);

  // 다크모드 초기값: 시스템 설정 따름
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

  // 초대코드로 강의 입장
  const handleJoinClass = async () => {
    setJoinError("");
    const code = inviteInput.trim().toUpperCase();
    if (!code) {
      setJoinError("초대코드를 입력해주세요.");
      return;
    }
    const found = await findClassByCode(code);
    if (!found) {
      setJoinError("존재하지 않는 초대코드예요.");
      return;
    }
    setClassInfo(found);
    const sid = await createSession(profile?.name ?? "anonymous", found.id, profile?.id);
    if (sid) setSessionId(sid);
    setJoinStep("ready");
  };

  // 연습 모드 (강의 없이 시작)
  const handleSkip = async () => {
    const sid = await createSession(profile?.name ?? "anonymous", undefined, profile?.id);
    if (sid) setSessionId(sid);
    setJoinStep("ready");
  };

  // 다크모드 토글 시 <html>에 class 적용
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Pyodide 사전 로드
  useEffect(() => {
    (async () => {
      try {
        const { getPyodide } = await import("@/lib/pyodide");
        pyodideRef.current = await getPyodide();
      } catch (e) {
        console.warn("Pyodide 사전 로드 실패 (첫 실행 시 로드됩니다):", e);
      }
    })();
  }, []);

  // Python 코드 실행
  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setOutput("실행 중...");
    try {
      const { runPython } = await import("@/lib/pyodide");
      const result: ExecutionResult = await runPython(code);
      setOutput(
        result.success
          ? result.stdout || "(출력 없음)"
          : `오류:\n${result.stderr}`
      );
    } catch (error) {
      setOutput(`실행 오류: ${error instanceof Error ? error.message : error}`);
    } finally {
      setIsRunning(false);
    }
  }, [code]);

  // AI 채팅 전송
  const handleSendMessage = useCallback(
    async (userMessage: string) => {
      const newUserMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, newUserMsg]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            code,
            executionResult: output || undefined,
            history: messages.slice(-10),
            sessionId: sessionId ?? undefined,
          }),
        });

        const data = await res.json();

        if (data.error) {
          throw new Error(data.error);
        }

        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
          hintLevel: data.hintLevel,
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        const errorMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `오류가 발생했어요. 다시 시도해주세요.\n${error instanceof Error ? error.message : ""}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [code, output, messages]
  );

  // 코드 초기화
  const handleReset = useCallback(() => {
    setCode(DEFAULT_CODE);
    setOutput("");
  }, []);

  // ─── 인증 확인 중 ───
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg text-ink">
        <p className="text-ink-soft">로딩 중...</p>
      </div>
    );
  }

  // ─── 초대코드 입력 화면 ───
  if (joinStep === "joining") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg text-ink">
        <div className="flex items-center gap-2 mb-6">
          <svg width="48" height="48" viewBox="0 0 120 120" aria-hidden="true">
            <path d="M 60 42 L 30 98" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 60 42 L 90 98" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M 60 42 C 55 28, 42 18, 32 22" fill="none" stroke="#E8834B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-2xl font-bold">Lysis</span>
        </div>
        <p className="text-ink-soft mb-6">수업 초대코드를 입력하세요</p>

        <div className="flex flex-col items-center gap-3 w-full max-w-xs">
          <input
            type="text"
            value={inviteInput}
            onChange={(e) => setInviteInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleJoinClass()}
            placeholder="예: ABC123"
            maxLength={6}
            className="w-full text-center text-base tracking-[0.3em] font-mono font-bold px-4 py-2 border-2 border-line rounded-xl bg-bg-soft text-ink outline-none focus:border-accent transition-colors"
          />
          {joinError && (
            <p className="text-xs text-red-500">{joinError}</p>
          )}
          <button
            onClick={handleJoinClass}
            className="w-full py-3 bg-ink text-bg font-semibold rounded-full hover:bg-accent transition-colors"
          >
            입장하기
          </button>
          <button
            onClick={handleSkip}
            className="text-xs text-ink-soft hover:text-ink transition-colors"
          >
            초대코드 없이 연습하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg text-ink">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-line bg-bg shrink-0">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-75 transition-opacity">
            {/* λ 로고 */}
            <svg width="24" height="24" viewBox="0 0 120 120" aria-hidden="true">
              <path
                d="M 60 42 L 30 98"
                fill="none"
                stroke={`rgb(${isDark ? "240 237 232" : "43 43 43"})`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 60 42 L 90 98"
                fill="none"
                stroke={`rgb(${isDark ? "240 237 232" : "43 43 43"})`}
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 60 42 C 55 28, 42 18, 32 22"
                fill="none"
                stroke="#E8834B"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-bold text-lg tracking-tight">Lysis</span>
            <span className="text-xs text-ink-soft ml-1 hidden sm:inline">
              답 대신, 질문을.
            </span>
          </Link>
          {classInfo && (
            <span className="text-xs font-semibold text-accent bg-accent-soft px-2.5 py-1 rounded-full">
              {classInfo.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {profile && (
            <span className="text-xs font-semibold text-ink">{profile.name}</span>
          )}
          {/* 다크모드 토글 */}
          <button
            onClick={() => setIsDark((d) => !d)}
            className="p-2 rounded-full text-ink-soft hover:text-ink hover:bg-bg-soft transition-colors"
            title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            aria-label={isDark ? "라이트 모드" : "다크 모드"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={async () => { await signOut(); router.push("/login"); }}
            className="text-xs text-ink-soft hover:text-ink px-2 py-1 border border-line rounded-full transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 — 에디터(좌) + 채팅(우) */}
      <main className="flex flex-1 overflow-hidden">
        {/* 왼쪽 패널: 에디터 + 출력 */}
        <div className="flex flex-col w-1/2 border-r border-line overflow-hidden">
          {/* 에디터 툴바 */}
          <div className="flex items-center gap-2 px-4 h-10 border-b border-line bg-bg-soft shrink-0">
            <span className="text-xs text-ink-soft font-medium">main.py</span>
            <div className="flex-1" />
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-ink-soft hover:text-ink rounded-md transition-colors"
              title="초기화"
            >
              <RotateCcw size={13} />
              초기화
            </button>
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-ink text-bg rounded-full hover:bg-accent transition-colors disabled:opacity-50"
            >
              <Play size={13} />
              {isRunning ? "실행 중..." : "실행"}
            </button>
          </div>

          {/* Monaco 에디터 */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <Editor value={code} onChange={setCode} isDark={isDark} />
          </div>

          {/* 출력 패널 */}
          <div className="h-[180px] border-t border-line shrink-0">
            <div className="px-4 py-2 text-xs font-medium text-ink-soft bg-bg-soft border-b border-line">
              출력
            </div>
            <pre className="p-4 text-sm font-mono text-ink overflow-auto h-[calc(100%-32px)] whitespace-pre-wrap bg-bg">
              {output || "코드를 실행하면 여기에 결과가 표시됩니다."}
            </pre>
          </div>
        </div>

        {/* 오른쪽 패널: 채팅 */}
        <div className="w-1/2 bg-bg">
          <Chat
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        </div>
      </main>
    </div>
  );
}
