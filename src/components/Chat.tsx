"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import type { ChatMessage } from "@/types";
import { Send } from "lucide-react";

interface ChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
}

export default function Chat({ messages, isLoading, onSendMessage }: ChatProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 오면 스크롤 하단으로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* 채팅 헤더 */}
      <div className="px-4 h-10 flex items-center border-b border-line bg-bg-soft shrink-0">
        <span className="text-xs font-medium text-ink-soft">
          Lysis와 대화
        </span>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">
            <div className="text-4xl mb-4">🪢</div>
            <p className="text-ink font-semibold text-lg mb-2">
              안녕하세요! Lysis예요.
            </p>
            <p className="text-ink-soft text-sm leading-relaxed max-w-sm">
              코드를 작성하고 실행해본 뒤, 막히는 부분이 있으면 편하게
              물어보세요. 답을 바로 드리진 않지만, 같이 생각해볼게요.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {/* 레이블 */}
            <span className="text-[11px] text-ink-soft mb-1 px-1">
              {msg.role === "user" ? "나" : "Lysis"}
              {msg.hintLevel && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-accent-soft text-accent rounded text-[10px] font-medium">
                  {msg.hintLevel}
                </span>
              )}
            </span>

            {/* 말풍선 */}
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-bg-soft text-ink rounded-br-md"
                  : "bg-accent-soft text-ink rounded-bl-md"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="flex items-start">
            <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-accent-soft">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력 영역 */}
      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-line bg-bg shrink-0"
      >
        <div className="flex items-end gap-2 bg-bg-soft rounded-2xl px-4 py-2.5 border border-line focus-within:border-accent transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="막히는 부분을 물어보세요..."
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed text-ink placeholder:text-ink-soft/50 max-h-32"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 rounded-full bg-ink text-bg hover:bg-accent transition-colors disabled:opacity-30"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-[11px] text-ink-soft/50 text-center mt-2">
          Lysis는 답을 알려주지 않아요. 함께 생각하는 도구예요.
        </p>
      </form>
    </div>
  );
}
