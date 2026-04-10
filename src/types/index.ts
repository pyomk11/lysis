// === 채팅 관련 ===

export type MessageRole = "user" | "assistant" | "system";

export type HintLevel = "L1" | "L2" | "L3";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  hintLevel?: HintLevel;
}

// === 가드레일 ===

export type GuardrailResult =
  | { allowed: true }
  | { allowed: false; reason: string; suggestion: string };

// === 진단 에이전트 ===

export interface Diagnosis {
  /** 학생이 모르는 것으로 추정되는 개념 */
  missingConcept: string;
  /** 코드에서 발견된 구체적 오류 또는 오해 */
  codeIssue: string;
  /** 현재 추정 힌트 레벨 */
  suggestedHintLevel: HintLevel;
  /** 학생의 현재 이해 수준 요약 */
  studentState: string;
}

// === 코드 실행 ===

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  executionTime: number;
}

// === 학습 기록 ===

export interface LearningRecord {
  id: string;
  sessionId: string;
  concept: string;
  hintLevelUsed: HintLevel;
  solvedIndependently: boolean;
  timestamp: number;
}
