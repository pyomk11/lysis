# Lysis — 프로젝트 컨벤션

## 프로젝트 개요
프로그래밍 수업을 위한 소크라테스식 AI 교육 도구.
답을 직접 주지 않고 질문으로 학생의 사고를 이끌어내는 것이 핵심.
2026 KIT 바이브코딩 공모전 출품작.

## 기술 스택
- **프레임워크**: Next.js 14 (App Router, TypeScript)
- **스타일링**: Tailwind CSS (`darkMode: "class"`) + Pretendard 폰트 + 커스텀 RGB CSS 변수
- **코드 에디터**: Monaco Editor (@monaco-editor/react)
- **Python 실행**: Pyodide (브라우저 내 WebAssembly)
- **AI (런타임)**: Google Gemini API (@google/generative-ai)
  - `gemini-2.5-flash` — 진단 에이전트 + 소크라테스 질문자
  - `gemini-2.5-flash-lite` — 가드레일 에이전트
- **AI (빌딩)**: Claude Code (주 개발), Claude Cowork (문서 작성), ChatGPT (레드팀)
- **DB**: Supabase (@supabase/supabase-js) — Auth + Postgres + RLS
- **배포**: Vercel

## 디렉토리 구조
```
src/
├── app/                  # Next.js App Router 페이지
│   ├── layout.tsx        # 루트 레이아웃
│   ├── page.tsx          # 랜딩 페이지
│   ├── landing.css       # 랜딩 페이지 스타일
│   ├── app/page.tsx      # 메인 학습 페이지 (에디터 + 채팅)
│   ├── login/page.tsx    # 로그인/회원가입
│   ├── dashboard/        # 교수용 대시보드
│   │   ├── page.tsx
│   │   └── dashboard.css
│   ├── progress/page.tsx # 학생용 학습 기록
│   └── api/
│       ├── chat/route.ts       # 3-에이전트 AI 파이프라인
│       └── dashboard/route.ts  # 대시보드 집계 API
├── components/
│   ├── Editor.tsx        # Monaco 에디터 래퍼
│   ├── Chat.tsx          # 채팅 UI (힌트 레벨 배지 포함)
│   └── ui/               # 공통 UI 컴포넌트
├── lib/
│   ├── supabase.ts       # Supabase 클라이언트 + Auth + DB 쿼리
│   ├── pyodide.ts        # Pyodide 초기화 & 실행
│   └── prompts.ts        # 시스템 프롬프트 정의 (PROMPT_VERSION: 0.1.0)
└── types/
    └── index.ts          # TypeScript 타입 정의
```

## 인증 & 권한
- Supabase Auth (이메일+비밀번호, 이메일 인증 비활성화)
- `profiles` 테이블: role = "teacher" | "student"
- RLS 정책: 학생은 자기 데이터만, 교수는 자기 반 데이터만 조회 가능
- 게스트 모드: `/app?guest=true` — DB 저장 없이 체험 가능

## AI 에이전트 파이프라인 (src/app/api/chat/route.ts)
```
학생 입력 → Agent A (가드레일, Flash Lite) → Agent B (진단, Flash) → Agent C (소크라테스, Flash) → 응답
```
1. **Agent A — Guardrail** (gemini-2.5-flash-lite): "답 알려줘" 류 차단, JSON으로 allowed/blocked 반환
2. **Agent B — Diagnostician** (gemini-2.5-flash): 코드·에러·맥락 분석 → `{missingConcept, codeIssue, suggestedHintLevel, studentState}` JSON 반환
3. **Agent C — Socratic Questioner** (gemini-2.5-flash): 진단 기반 유도 질문 생성, 정답 코드 제공 금지

힌트 레벨: L1(개념 환기) → L2(방향 제시) → L3(의사코드)

대화 히스토리: 최근 10턴만 클라이언트에서 전송, API에서는 최근 6턴만 프롬프트에 포함

## DB 테이블 (Supabase)
- `profiles` — 사용자 프로필 (name, role, auth.users 참조)
- `classes` — 수업 (name, instructor, invite_code, teacher_id)
- `sessions` — 학습 세션 (student_id, class_id, user_id, code_snapshot)
- `messages` — 대화 기록 (role, content, hint_level, code_context, execution_result)
- `insights` — 진단 결과 (concept, difficulty, resolved)
- `guardrail_logs` — 차단 기록 (blocked_message, reason)

## 코딩 규칙
- 한국어 주석 사용 (코드/변수명은 영어)
- 컴포넌트: PascalCase, 파일명도 PascalCase.tsx
- 유틸 함수: camelCase
- 타입/인터페이스: PascalCase, 접두사 없음 (I 없이)
- API 라우트: src/app/api/ 아래, route.ts
- 서버 컴포넌트 기본, 클라이언트 필요 시 'use client' 명시
- 인증 리다이렉트: `router.replace()` 사용 (뒤로가기 스택 오염 방지)

## 디자인 토큰
- bg: #FBF9F6 / bg-soft: #F4EFE8
- ink: #2B2B2B / ink-soft: #6B6863
- accent: #E8834B / accent-soft: #FBE4D4
- line: #E8E2D8
- border-radius-lg: 24px / md: 16px

## 주의사항
- .env.local은 절대 커밋하지 않는다 (GEMINI_API_KEY, SUPABASE URL/KEY)
- Pyodide는 클라이언트 사이드에서만 로드 (dynamic import)
- COOP/COEP 헤더 필요 (next.config.mjs에 설정됨)
- `@vercel/postgres`는 package.json에 있으나 사용하지 않음 (Supabase로 전환됨)
- `src/lib/gemini.ts`는 레거시 파일 — 실제 모델 호출은 `route.ts`에서 직접 수행
