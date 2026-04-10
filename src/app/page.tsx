"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { ChatMessage, ExecutionResult } from "@/types";
import Editor from "@/components/Editor";
import Chat from "@/components/Chat";
import { Play, RotateCcw, Moon, Sun } from "lucide-react";

const DEFAULT_CODE = `# 여기에 Python 코드를 작성하세요
# 예: 리스트에서 중복을 제거하는 함수를 만들어보세요

def remove_duplicates(lst):
    # TODO: 구현해보세요
    pass

print(remove_duplicates([1, 2, 2, 3, 3, 4]))
`;

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pyodideRef = useRef<any>(null);

  // 다크모드 초기값: 시스템 설정 따름
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(prefersDark);
  }, []);

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

  return (
    <div className="flex flex-col h-screen bg-bg text-ink">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 h-14 border-b border-line bg-bg shrink-0">
        <div className="flex items-center gap-2.5">
          {/* λ 로고 */}
          <svg width="24" height="24" viewBox="0 0 120 120" aria-hidden="true">
            <path
              d="M 60 42 L 30 98"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 60 42 L 90 98"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 60 42 C 55 28, 42 18, 32 22"
              fill="none"
              stroke="#E8834B"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-bold text-lg tracking-tight">Lysis</span>
          <span className="text-xs text-ink-soft ml-1 hidden sm:inline">
            답 대신, 질문을.
          </span>
        </div>

        {/* 다크모드 토글 */}
        <button
          onClick={() => setIsDark((d) => !d)}
          className="p-2 rounded-full text-ink-soft hover:text-ink hover:bg-bg-soft transition-colors"
          title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
          aria-label={isDark ? "라이트 모드" : "다크 모드"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* 메인 콘텐츠 — 에디터(좌) + 채팅(우) */}
      <main className="flex flex-1 overflow-hidden">
        {/* 왼쪽 패널: 에디터 + 출력 */}
        <div className="flex flex-col w-1/2 border-r border-line">
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
          <div className="flex-1 min-h-0">
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
