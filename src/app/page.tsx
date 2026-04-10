"use client";

import Link from "next/link";
import "./landing.css";
import {
  GraduationCap, ClipboardCopy, Repeat, Hand, EyeOff,
  Zap, MessageCircle, SlidersHorizontal, ShieldCheck, TrendingUp,
  BarChart3, HelpCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <>
      {/* NAV */}
      <nav>
        <div className="container nav-inner">
          <a href="#top" className="brand">
            <svg width="32" height="32" viewBox="0 0 120 120" aria-hidden="true">
              <path d="M 60 42 L 30 98" fill="none" stroke="#2B2B2B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 60 42 L 90 98" fill="none" stroke="#2B2B2B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M 60 42 C 55 28, 42 18, 32 22" fill="none" stroke="#E8834B" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="brand-text">Lysis</span>
          </a>
          <div className="nav-links">
            <a href="#problem">Why</a>
            <a href="#features">기능</a>
            <a href="#how">작동 방식</a>
            <a href="#instructor">교수자</a>
          </div>
          <Link href="/app" className="nav-cta">체험해보기</Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero" id="top">
        <div className="container">
          <span className="badge"><GraduationCap size={15} style={{display:"inline",verticalAlign:"-2px",marginRight:4}} /> 프로그래밍 수업을 위한 AI 교육 도구</span>
          <h1>답 대신,<br/><em className="accent-ink">질문을 드릴게요.</em></h1>
          <p className="lead">
            복붙해서 넘어가는 대신, 스스로 풀어내는 힘을 기릅니다.<br/>
            Lysis는 프로그래밍 수업에서 교수자와 학생 모두를 위한 소크라테스식 AI 교육 도구입니다.
          </p>
          <div className="hero-ctas">
            <Link href="/app" className="btn btn-primary">지금 막힌 코드, 가져와 보세요 →</Link>
            <a href="#how" className="btn btn-ghost">어떻게 작동하나요?</a>
          </div>
          <div className="chat-preview" aria-label="대화 예시">
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end"}}>
              <p className="who right">학생</p>
              <div className="bubble user">리스트에서 중복을 없애려는데 계속 에러가 나요. 답 좀 알려주세요.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",marginTop:12}}>
              <p className="who">Lysis</p>
              <div className="bubble lysis">
                답을 바로 드리지는 않을게요. 대신 같이 생각해볼까요?<br/>
                지금 적으신 코드에서 <strong>&ldquo;중복&rdquo;이 무엇을 뜻하는지</strong>, 파이썬이 어떻게 판단할 것 같아요? <HelpCircle size={16} style={{display:"inline",verticalAlign:"-2px"}} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* WHY */}
      <section id="problem" className="alt">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Why Lysis</span>
            <h2>AI가 답을 대신 써주는 시대,<br/>우리가 잃어버린 건 &lsquo;사고 과정&rsquo;이에요.</h2>
            <p>프로그래밍 수업에서 반복되는 풍경들. 익숙하지 않으세요?</p>
          </div>
          <div className="problems">
            {[
              {Icon:ClipboardCopy, h:"답 복붙의 함정", p:"AI가 코드를 척척 내놓으니, 과정은 건너뛰고 결과만 가져옵니다. 막상 비슷한 문제가 나오면 다시 물어봐야 해요."},
              {Icon:Repeat, h:"반복되는 같은 질문", p:"교·강사는 기본 질문에 하루를 다 씁니다. 정작 깊은 지도는 뒤로 밀려요."},
              {Icon:Hand, h:"손들기 심리 장벽", p:"\"이런 걸 물어봐도 되나…\" 망설이다 수업이 끝납니다. 다음 주제로 넘어가도 계속 뒤처져요."},
              {Icon:EyeOff, h:"막힌 지점이 안 보여요", p:"교수자는 학생이 어디서 막혔는지 알 길이 없습니다. 시험 결과가 나오고 나서야 드러나죠."},
            ].map(({Icon,h,p}) => (
              <div className="problem-card" key={h}>
                <span className="emoji"><Icon size={22}/></span>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="container">
          <div className="section-head">
            <span className="kicker">What it does</span>
            <h2>답을 주지 않지만,<br/>혼자 두지도 않아요.</h2>
            <p>수업 시간에 바로 도입할 수 있는 6가지 기능. 학생의 사고력과 교수자의 수업 효율, 둘 다 챙깁니다.</p>
          </div>
          <div className="features">
            {[
              {Icon:Zap, h:"브라우저 속 Python 실행", p:"설치 없이 지금 바로 코드를 돌려볼 수 있어요. Pyodide 덕분에 서버 왕복 없이 즉시 실행됩니다."},
              {Icon:MessageCircle, h:"소크라테스식 대화 엔진", p:"정답을 알려주는 대신, \"어디서부터 막혔어요?\"라고 되물으며 사고 과정을 이끌어냅니다."},
              {Icon:SlidersHorizontal, h:"3단계 힌트 시스템", p:"L1 개념 환기 → L2 방향 제시 → L3 의사코드. 너무 많지도, 너무 적지도 않게 필요한 만큼만."},
              {Icon:ShieldCheck, h:"답 복붙 가드레일", p:"\"답만 알려주세요\" 같은 요청은 정중히 거절합니다. 학습 윤리를 기본값으로 내장했어요."},
              {Icon:TrendingUp, h:"나만의 학습 기록", p:"오늘의 \"아!\" 순간이 쌓여 내 성장 지도가 됩니다. 어떤 개념에서 막혔는지 한눈에."},
              {Icon:BarChart3, h:"교수자 대시보드", p:"우리 반 학생들이 이번 주 어디서 많이 막혔는지 시각화해 다음 수업에 바로 반영할 수 있어요."},
            ].map(({Icon,h,p}) => (
              <div className="feature-card" key={h}>
                <div className="feature-icon"><Icon size={22}/></div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="alt">
        <div className="container">
          <div className="section-head">
            <span className="kicker">How it works</span>
            <h2>3단계 에이전트 파이프라인</h2>
            <p>안전하게, 깊이 있게, 그리고 일관되게. 세 개의 AI가 역할을 나눠 맡습니다.</p>
          </div>
          <div className="steps">
            {[
              {n:1, h:"가드레일", p:"빠른 모델이 \"답만 알려줘\" 류의 요청을 먼저 걸러냅니다."},
              {n:2, h:"진단 에이전트", p:"학생의 코드와 오류를 분석해 무엇을 모르는지 구조화된 데이터로 추론합니다."},
              {n:3, h:"소크라테스 질문자", p:"진단을 바탕으로, 학생이 스스로 깨닫도록 이끌 다음 질문 한 줄을 건넵니다."},
            ].map(({n,h,p}) => (
              <div className="step" key={n}>
                <div className="num">{n}</div>
                <h3>{h}</h3>
                <p>{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSTRUCTOR */}
      <section id="instructor">
        <div className="container">
          <div className="two-col">
            <div className="col-text">
              <span className="kicker">For instructors</span>
              <h2>반 전체의<br/>&lsquo;막힌 지점&rsquo;이 보입니다.</h2>
              <p>학생마다 어떤 개념에서 얼마나 망설였는지, 어떤 오류가 가장 자주 나왔는지 — Lysis가 수업 중에 조용히 기록합니다.</p>
              <p>다음 수업에 무엇을 짚어야 할지, 데이터가 알려줍니다. LMS나 과제 시스템 없이도 수업에 바로 도입할 수 있어요.</p>
            </div>
            <div className="col-visual" aria-hidden="true">
              <div style={{fontSize:13,color:"var(--ink-soft)",marginBottom:16,fontWeight:600}}>이번 주 학습 리포트 · 예시</div>
              {[
                ["가장 많이 막힌 개념","List comprehension"],
                ["평균 힌트 사용 레벨","L2 (방향 제시)"],
                ["스스로 해결한 비율","73%"],
                ["가드레일로 걸러진 요청","12건"],
                ["\"아!\" 순간 기록 수","58회"],
              ].map(([label,val]) => (
                <div className="stat-row" key={label}>
                  <span className="label">{label}</span>
                  <span className="val">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta" id="cta">
        <div className="container">
          <div className="card">
            <h2>우리 수업에 도입해볼까요?</h2>
            <p>설치도 셋업도 필요 없어요. URL 하나면 지금 바로 수업에서 쓸 수 있습니다.</p>
            <Link href="/app" className="btn btn-orange">지금 바로 체험하기 →</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="container footer-inner">
          <div className="etymology">
            <strong>Lysis</strong> — 고대 그리스어 λύσις(뤼시스). &lsquo;풀어냄, 해답에 도달하는 과정&rsquo;이라는 뜻입니다. 플라톤의 대화편 이름이기도 해요.
          </div>
          <div>© 2026 Lysis · 2026 KIT 바이브코딩 공모전 출품작</div>
        </div>
      </footer>
    </>
  );
}
