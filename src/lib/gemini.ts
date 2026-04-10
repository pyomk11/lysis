import { GoogleGenerativeAI } from "@google/generative-ai";

// 서버 사이드에서만 실행 — API 키 노출 방지
if (typeof window !== "undefined") {
  throw new Error("gemini.ts는 서버에서만 import 가능합니다.");
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
}

const genAI = new GoogleGenerativeAI(apiKey);

/**
 * 메인 모델 — 진단 + 소크라테스 질문 생성
 * Gemini 2.0 Flash 또는 Pro 중 비용/성능에 맞게 선택
 */
export const mainModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

/**
 * 빠른 모델 — 가드레일 분류용
 * Flash Lite 등 경량 모델
 */
export const guardrailModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

export { genAI };
