import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  GUARDRAIL_PROMPT,
  DIAGNOSTICIAN_PROMPT,
  SOCRATIC_PROMPT,
} from "@/lib/prompts";
import type { GuardrailResult, Diagnosis, ChatMessage } from "@/types";

// Edge Runtime 제거 — Node.js Runtime 사용 (Gemini SDK 호환)

/**
 * POST /api/chat
 * 3-에이전트 파이프라인: 가드레일 → 진단 → 소크라테스 질문
 */
export async function POST(request: NextRequest) {
  try {
    // API 키 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY가 설정되지 않았습니다.");
      return NextResponse.json(
        { error: "API 키가 설정되지 않았습니다. .env.local을 확인하세요." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const mainModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const guardrailModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const body = await request.json();
    const { message, code, executionResult, history } = body as {
      message: string;
      code?: string;
      executionResult?: string;
      history?: ChatMessage[];
    };

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "메시지를 입력해주세요." },
        { status: 400 }
      );
    }

    // ─── 1단계: 가드레일 ───
    console.log("[1/3] 가드레일 시작...");

    const guardrailResult = await runGuardrail(guardrailModel, message);

    if (!guardrailResult.allowed) {
      return NextResponse.json({
        role: "assistant",
        content: `${guardrailResult.reason}\n\n💡 ${guardrailResult.suggestion}`,
        blocked: true,
      });
    }

    // ─── 2단계: 진단 에이전트 ───
    console.log("[2/3] 진단 시작...");

    const contextParts = [
      `학생 메시지: ${message}`,
      code ? `학생 코드:\n\`\`\`python\n${code}\n\`\`\`` : "",
      executionResult ? `실행 결과:\n${executionResult}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const diagnosis = await runDiagnosis(mainModel, contextParts);

    // ─── 3단계: 소크라테스 질문자 ───
    console.log("[3/3] 소크라테스 질문 생성...");

    const responseText = await runSocratic(
      mainModel,
      contextParts,
      diagnosis,
      history || []
    );

    console.log("✅ 응답 완료");

    return NextResponse.json({
      role: "assistant",
      content: responseText,
      hintLevel: diagnosis.suggestedHintLevel,
      blocked: false,
    });
  } catch (error) {
    // 상세 에러 로깅
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : "";
    console.error("❌ Chat API error:", errMsg);
    console.error("Stack:", errStack);

    return NextResponse.json(
      { error: `서버 오류: ${errMsg}` },
      { status: 500 }
    );
  }
}

// ─── 헬퍼 함수들 ───

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runGuardrail(model: any, message: string): Promise<GuardrailResult> {
  try {
    const result = await model.generateContent(
      `${GUARDRAIL_PROMPT}\n\n학생 메시지: ${message}`
    );
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { allowed: true };
  } catch (err) {
    console.warn("가드레일 에러 (허용으로 처리):", err);
    return { allowed: true };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runDiagnosis(model: any, context: string): Promise<Diagnosis> {
  const fallback: Diagnosis = {
    missingConcept: "불명",
    codeIssue: "분석 불가",
    suggestedHintLevel: "L2",
    studentState: "추가 정보 필요",
  };

  try {
    const result = await model.generateContent(
      `${DIAGNOSTICIAN_PROMPT}\n\n${context}`
    );
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return fallback;
  } catch (err) {
    console.warn("진단 에러 (기본값 사용):", err);
    return fallback;
  }
}

async function runSocratic(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  context: string,
  diagnosis: Diagnosis,
  history: ChatMessage[]
): Promise<string> {
  const systemContext = `${SOCRATIC_PROMPT}

[진단 정보]
- 부족한 개념: ${diagnosis.missingConcept}
- 코드 이슈: ${diagnosis.codeIssue}
- 힌트 레벨: ${diagnosis.suggestedHintLevel}
- 학생 상태: ${diagnosis.studentState}`;

  // 이전 대화를 하나의 맥락 문자열로 조합 (startChat 대신 단일 호출)
  const historyText = history
    .slice(-6) // 최근 6개만
    .map((m) => `${m.role === "user" ? "학생" : "Lysis"}: ${m.content}`)
    .join("\n\n");

  const fullPrompt = [
    systemContext,
    historyText ? `\n[이전 대화]\n${historyText}` : "",
    `\n[현재 입력]\n${context}`,
    "\n위 정보를 바탕으로 소크라테스식 질문 하나를 한국어로 해주세요.",
  ].join("");

  const result = await model.generateContent(fullPrompt);
  return result.response.text();
}
