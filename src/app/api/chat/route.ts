import { NextRequest, NextResponse } from "next/server";
import { guardrailModel, mainModel } from "@/lib/gemini";
import {
  GUARDRAIL_PROMPT,
  DIAGNOSTICIAN_PROMPT,
  SOCRATIC_PROMPT,
} from "@/lib/prompts";
import type { GuardrailResult, Diagnosis, ChatMessage } from "@/types";

export const runtime = "edge";

/**
 * POST /api/chat
 * 3-에이전트 파이프라인: 가드레일 → 진단 → 소크라테스 질문
 */
export async function POST(request: NextRequest) {
  try {
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
    const guardrailChat = guardrailModel.startChat({
      history: [{ role: "user", parts: [{ text: GUARDRAIL_PROMPT }] }],
    });

    const guardrailResponse = await guardrailChat.sendMessage(message);
    const guardrailText = guardrailResponse.response.text();

    let guardrailResult: GuardrailResult;
    try {
      // JSON 블록 추출 (```json ... ``` 또는 순수 JSON)
      const jsonMatch = guardrailText.match(/\{[\s\S]*\}/);
      guardrailResult = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { allowed: true };
    } catch {
      // 파싱 실패 시 허용 (false positive보다 false negative가 나음)
      guardrailResult = { allowed: true };
    }

    if (!guardrailResult.allowed) {
      return NextResponse.json({
        role: "assistant",
        content: `${guardrailResult.reason}\n\n💡 ${guardrailResult.suggestion}`,
        blocked: true,
      });
    }

    // ─── 2단계: 진단 에이전트 ───
    const contextParts = [
      `학생 메시지: ${message}`,
      code ? `학생 코드:\n\`\`\`python\n${code}\n\`\`\`` : "",
      executionResult ? `실행 결과:\n${executionResult}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const diagChat = mainModel.startChat({
      history: [{ role: "user", parts: [{ text: DIAGNOSTICIAN_PROMPT }] }],
    });

    const diagResponse = await diagChat.sendMessage(contextParts);
    const diagText = diagResponse.response.text();

    let diagnosis: Diagnosis;
    try {
      const jsonMatch = diagText.match(/\{[\s\S]*\}/);
      diagnosis = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : {
            missingConcept: "불명",
            codeIssue: "분석 불가",
            suggestedHintLevel: "L2",
            studentState: "추가 정보 필요",
          };
    } catch {
      diagnosis = {
        missingConcept: "불명",
        codeIssue: "분석 불가",
        suggestedHintLevel: "L2",
        studentState: "추가 정보 필요",
      };
    }

    // ─── 3단계: 소크라테스 질문자 ───
    const socraticContext = `${SOCRATIC_PROMPT}

[진단 정보]
- 부족한 개념: ${diagnosis.missingConcept}
- 코드 이슈: ${diagnosis.codeIssue}
- 힌트 레벨: ${diagnosis.suggestedHintLevel}
- 학생 상태: ${diagnosis.studentState}`;

    // 이전 대화 히스토리를 Gemini 형식으로 변환
    const geminiHistory = (history || [])
      .filter((m: ChatMessage) => m.role !== "system")
      .map((m: ChatMessage) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

    const socraticChat = mainModel.startChat({
      history: [
        { role: "user", parts: [{ text: socraticContext }] },
        {
          role: "model",
          parts: [
            {
              text: "네, 소크라테스식 질문자로서 학생을 도울 준비가 됐어요. 절대 정답 코드를 제공하지 않겠습니다.",
            },
          ],
        },
        ...geminiHistory,
      ],
    });

    const socraticResponse = await socraticChat.sendMessage(contextParts);
    const responseText = socraticResponse.response.text();

    return NextResponse.json({
      role: "assistant",
      content: responseText,
      hintLevel: diagnosis.suggestedHintLevel,
      blocked: false,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
