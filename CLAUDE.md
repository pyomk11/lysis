# Lysis — 프로젝트 컨벤션

## 프로젝트 개요
프로그래밍 수업을 위한 소크라테스식 AI 교육 도구.
답을 직접 주지 않고 질문으로 학생의 사고를 이끌어내는 것이 핵심.

## 기술 스택
- **프레임워크**: Next.js 14 (App Router, TypeScript)
- **스타일링**: Tailwind CSS + Pretendard 폰트
- **코드 에디터**: Monaco Editor (@monaco-editor/react)
- **Python 실행**: Pyodide (브라우저 내 WebAssembly)
- **AI**: Google Gemini API (@google/generative-ai)
- **DB**: Vercel Postgres (@vercel/postgres)
- **배포**: Vercel

## 디렉토리 구조
```
src/
├── app/              # Next.js App Router 페이지
│   ├── layout.tsx    # 루트 레이아웃
│   ├── page.tsx      # 메인 페이지 (코드 에디터 + 채팅)
│   └── api/          # API 라우트
│       └── chat/     # Gemini 대화 엔드포인트
├── components/       # React 컴포넌트
│   ├── Editor.tsx    # Monaco 에디터 래퍼
│   ├── Chat.tsx      # 채팅 UI
│   └── ui/           # 공통 UI 컴포넌트
├── lib/              # 유틸리티 & 핵심 로직
│   ├── gemini.ts     # Gemini API 클라이언트
│   ├── pyodide.ts    # Pyodide 초기화 & 실행
│   ├── prompts.ts    # 시스템 프롬프트 정의
│   └── db.ts         # Vercel Postgres 쿼리
└── types/            # TypeScript 타입 정의
```

## 코딩 규칙
- 한국어 주석 사용 (코드/변수명은 영어)
- 컴포넌트: PascalCase, 파일명도 PascalCase.tsx
- 유틸 함수: camelCase
- 타입/인터페이스: PascalCase, 접두사 없음 (I 없이)
- API 라우트: src/app/api/ 아래, route.ts
- 서버 컴포넌트 기본, 클라이언트 필요 시 'use client' 명시

## AI 에이전트 파이프라인
1. **가드레일** (빠른 모델): "답만 알려줘" 류 차단
2. **진단 에이전트**: 학생 코드/오류 분석 → 구조화된 진단
3. **소크라테스 질문자**: 진단 기반 → 질문으로 응답 (절대 정답 제공 금지)

힌트 레벨: L1(개념 환기) → L2(방향 제시) → L3(의사코드)

## 디자인 토큰
- bg: #FBF9F6 / bg-soft: #F4EFE8
- ink: #2B2B2B / ink-soft: #6B6863
- accent: #E8834B / accent-soft: #FBE4D4
- line: #E8E2D8
- border-radius-lg: 24px / md: 16px

## 주의사항
- .env.local은 절대 커밋하지 않는다
- Pyodide는 클라이언트 사이드에서만 로드 (dynamic import)
- COOP/COEP 헤더 필요 (next.config.mjs에 설정됨)
