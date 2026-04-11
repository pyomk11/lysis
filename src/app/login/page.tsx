"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, signIn } from "@/lib/supabase";

type Mode = "login" | "signup";
type Role = "teacher" | "student";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) {
          setError("이름을 입력해주세요.");
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, name.trim(), role);
        if (result.error) {
          setError(result.error);
        } else {
          // 이메일 인증 없이 바로 로그인
          const loginResult = await signIn(email, password);
          if (loginResult.error) {
            setError(loginResult.error);
          } else {
            if (role === "teacher") {
              router.push("/dashboard");
            } else {
              router.push("/app");
            }
          }
        }
      } else {
        const result = await signIn(email, password);
        if (result.error) {
          setError(result.error);
        } else {
          const { getProfile } = await import("@/lib/supabase");
          const profile = await getProfile(result.user!.id);
          if (!profile) {
            setError("계정 정보가 없습니다. 다시 회원가입해주세요. (SQL 스키마가 적용되지 않았을 수 있어요)");
          } else if (profile.role === "teacher") {
            router.push("/dashboard");
          } else {
            router.push("/app");
          }
        }
      }
    } catch (err) {
      setError(`오류: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg text-ink">
      {/* 로고 */}
      <Link href="/" className="flex items-center gap-2 mb-8 hover:opacity-75 transition-opacity">
        <svg width="48" height="48" viewBox="0 0 120 120" aria-hidden="true">
          <path d="M 60 42 L 30 98" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 60 42 L 90 98" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M 60 42 C 55 28, 42 18, 32 22" fill="none" stroke="#E8834B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-2xl font-bold">Lysis</span>
      </Link>

      {/* 모드 탭 */}
      <div className="flex gap-1 mb-6 p-1 bg-bg-soft rounded-full">
        <button
          onClick={() => setMode("login")}
          className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
            mode === "login" ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"
          }`}
        >
          로그인
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`px-5 py-1.5 text-sm font-medium rounded-full transition-colors ${
            mode === "signup" ? "bg-ink text-bg" : "text-ink-soft hover:text-ink"
          }`}
        >
          회원가입
        </button>
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-xs">
        {mode === "signup" && (
          <>
            {/* 역할 선택 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl border-2 transition-colors ${
                  role === "student"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line text-ink-soft hover:border-ink-soft"
                }`}
              >
                학생
              </button>
              <button
                type="button"
                onClick={() => setRole("teacher")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-xl border-2 transition-colors ${
                  role === "teacher"
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line text-ink-soft hover:border-ink-soft"
                }`}
              >
                교수자
              </button>
            </div>

            {/* 이름 */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름"
              className="w-full px-4 py-2.5 text-sm border-2 border-line rounded-xl bg-bg-soft text-ink outline-none focus:border-accent transition-colors"
            />
          </>
        )}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
          className="w-full px-4 py-2.5 text-sm border-2 border-line rounded-xl bg-bg-soft text-ink outline-none focus:border-accent transition-colors"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          required
          minLength={6}
          className="w-full px-4 py-2.5 text-sm border-2 border-line rounded-xl bg-bg-soft text-ink outline-none focus:border-accent transition-colors"
        />

        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-ink text-bg font-semibold rounded-full hover:bg-accent transition-colors disabled:opacity-50"
        >
          {loading
            ? "처리 중..."
            : mode === "login"
            ? "로그인"
            : "회원가입"}
        </button>
      </form>

      <p className="text-xs text-ink-soft mt-4">
        {mode === "login" ? (
          <>
            계정이 없으신가요?{" "}
            <button onClick={() => setMode("signup")} className="text-accent hover:underline">
              회원가입
            </button>
          </>
        ) : (
          <>
            이미 계정이 있으신가요?{" "}
            <button onClick={() => setMode("login")} className="text-accent hover:underline">
              로그인
            </button>
          </>
        )}
      </p>
    </div>
  );
}
