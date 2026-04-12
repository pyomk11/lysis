# Lysis (λύσις)

**프로그래밍 수업을 위한 소크라테스식 AI 교육 도구**

> 답 대신, 질문을 드릴게요.

Lysis는 프로그래밍 수업에서 학생에게 정답을 건네지 않고, 소크라테스식 질문으로 사고 과정을 이끌어내는 AI 교육 도구입니다. 교수자에게는 학생들의 학습 데이터를 시각화해 수업 개선에 활용할 수 있도록 합니다.

## 핵심 기능

- **브라우저 내 Python 실행** — Pyodide 기반, 설치 없이 즉시 코드 실행
- **소크라테스식 대화 엔진** — 답 대신 질문으로 사고를 이끄는 AI 튜터
- **3단계 힌트 시스템** — L1 개념 환기 → L2 방향 제시 → L3 의사코드
- **답 복붙 가드레일** — "답만 알려줘" 류 요청 차단, 차단 로그 기록
- **개인 학습 기록** — 자주 막힌 개념 TOP 8, 힌트 사용 패턴, 개념 해결 비율 시각화
- **교수자 대시보드** — 반별·기간별 학습 데이터 집계, 주간 개념 통계
- **게스트 모드** — 로그인 없이 체험 가능 (DB 저장 없음)

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 14 (App Router, TypeScript) |
| 스타일링 | Tailwind CSS (다크 모드 지원) |
| 코드 에디터 | Monaco Editor |
| Python 실행 | Pyodide (WebAssembly) |
| AI (런타임) | Google Gemini 2.5 Flash / Flash Lite |
| AI (빌딩) | Claude Code, Claude Cowork, ChatGPT |
| DB & 인증 | Supabase (Auth + Postgres + RLS) |
| 배포 | Vercel |

## 시작하기

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local에 아래 값 입력:
#   GEMINI_API_KEY=...
#   NEXT_PUBLIC_SUPABASE_URL=...
#   NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

## AI 에이전트 파이프라인

```
학생 입력 → [Agent A: 가드레일] → [Agent B: 진단] → [Agent C: 소크라테스] → 응답
              Flash Lite             Flash              Flash
```

1. **Agent A — Guardrail** (Flash Lite): "답만 알려줘" 류 요청을 걸러냄 → JSON `{allowed, reason, suggestion}`
2. **Agent B — Diagnostician** (Flash): 코드·에러·맥락 분석 → `{missingConcept, codeIssue, suggestedHintLevel}` — 학생에게 직접 노출되지 않는 내부 진단
3. **Agent C — Socratic Questioner** (Flash): 진단 기반으로 사고를 이끌 질문 하나를 생성 (정답 코드 제공 금지)

진단 결과의 `missingConcept`는 Supabase의 `insights` 테이블에 저장되어 학습 기록과 대시보드의 데이터 소스로 활용됩니다.

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 랜딩 페이지
│   ├── login/page.tsx        # 로그인/회원가입
│   ├── app/page.tsx          # 메인 학습 페이지 (에디터 + 채팅)
│   ├── dashboard/page.tsx    # 교수용 대시보드
│   ├── progress/page.tsx     # 학생용 학습 기록
│   └── api/
│       ├── chat/route.ts     # 3-에이전트 파이프라인
│       └── dashboard/route.ts
├── components/
│   ├── Editor.tsx            # Monaco 에디터
│   └── Chat.tsx              # 채팅 UI (힌트 레벨 배지)
├── lib/
│   ├── supabase.ts           # DB 클라이언트 + Auth + 쿼리
│   ├── prompts.ts            # 시스템 프롬프트 (v0.1.0)
│   └── pyodide.ts            # Pyodide 초기화 & 실행
├── types/
│   └── index.ts
docs/
└── ai-collaboration-log.md  # AI 협업 개발 일지
```

## 이름의 유래

**Lysis** (λύσις, 뤼시스) — 고대 그리스어로 '풀어냄, 해답에 도달하는 과정'. 플라톤의 대화편 이름이기도 합니다.

---

2026 KIT 바이브코딩 공모전 출품작 · 표민규
