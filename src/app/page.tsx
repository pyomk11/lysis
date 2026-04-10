import Link from "next/link";

export default function LandingPage() {
  return (
    <>
      <style>{`
        :root {
          --bg: #FBF9F6; --bg-soft: #F4EFE8;
          --ink: #2B2B2B; --ink-soft: #6B6863;
          --accent: #E8834B; --accent-soft: #FBE4D4;
          --line: #E8E2D8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
        body {
          font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
          background: var(--bg); color: var(--ink); line-height: 1.7;
        }
        .container { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

        /* NAV */
        nav {
          position: sticky; top: 0; z-index: 10;
          background: rgba(251,249,246,.85);
          backdrop-filter: saturate(180%) blur(14px);
          border-bottom: 1px solid var(--line);
        }
        .nav-inner { display: flex; align-items: center; justify-content: space-between; height: 68px; }
        .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--ink); }
        .brand-text { font-weight: 700; font-size: 22px; letter-spacing: -.01em; }
        .nav-links { display: flex; gap: 28px; font-size: 15px; color: var(--ink-soft); }
        .nav-links a { text-decoration: none; color: inherit; transition: color .2s; }
        .nav-links a:hover { color: var(--ink); }
        .nav-cta {
          padding: 10px 18px; background: var(--ink); color: var(--bg);
          border-radius: 999px; font-size: 14px; font-weight: 600;
          text-decoration: none; transition: background .2s, transform .2s;
        }
        .nav-cta:hover { background: var(--accent); transform: translateY(-1px); }
        @media (max-width: 720px) { .nav-links { display: none; } }

        /* HERO */
        .hero { padding: 96px 0 80px; text-align: center; }
        .badge {
          display: inline-block; padding: 6px 14px; background: var(--accent-soft);
          color: #A14A1E; border-radius: 999px; font-size: 13px; font-weight: 600;
          margin-bottom: 24px;
        }
        .hero h1 {
          font-size: clamp(36px, 6vw, 64px); line-height: 1.2;
          font-weight: 700; letter-spacing: -.03em; margin-bottom: 20px;
        }
        .accent-ink { color: var(--accent); font-style: normal; }
        .lead {
          font-size: clamp(16px, 2vw, 19px); color: var(--ink-soft);
          max-width: 620px; margin: 0 auto 36px;
        }
        .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn {
          padding: 14px 26px; border-radius: 999px; font-weight: 600; font-size: 15px;
          text-decoration: none; display: inline-flex; align-items: center; gap: 8px;
          transition: transform .2s, box-shadow .2s, background .2s; border: none; cursor: pointer;
        }
        .btn-primary { background: var(--ink); color: var(--bg); }
        .btn-primary:hover { background: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(43,43,43,.1); }
        .btn-ghost { background: transparent; color: var(--ink); border: 1.5px solid var(--line); }
        .btn-ghost:hover { border-color: var(--ink); }

        /* CHAT PREVIEW */
        .chat-preview {
          max-width: 560px; margin: 56px auto 0; background: white;
          border: 1px solid var(--line); border-radius: 24px; padding: 28px;
          box-shadow: 0 1px 2px rgba(43,43,43,.04), 0 8px 24px rgba(43,43,43,.06);
          text-align: left;
        }
        .bubble { padding: 14px 18px; border-radius: 18px; margin-bottom: 4px; max-width: 82%; font-size: 15px; line-height: 1.6; }
        .bubble.user { background: var(--bg-soft); margin-left: auto; border-bottom-right-radius: 6px; }
        .bubble.lysis { background: var(--accent-soft); color: #5C2A0A; border-bottom-left-radius: 6px; }
        .who { font-size: 12px; color: var(--ink-soft); margin: 0 4px 4px; }
        .who.right { text-align: right; }

        /* SECTION */
        section { padding: 88px 0; }
        section.alt { background: var(--bg-soft); }
        .section-head { max-width: 680px; margin: 0 auto 56px; text-align: center; }
        .kicker { display: inline-block; font-size: 13px; font-weight: 600; color: var(--accent); letter-spacing: .02em; text-transform: uppercase; margin-bottom: 12px; }
        .section-head h2 { font-size: clamp(28px, 4vw, 40px); font-weight: 700; letter-spacing: -.025em; margin-bottom: 16px; line-height: 1.25; }
        .section-head p { font-size: 17px; color: var(--ink-soft); }

        /* PROBLEMS */
        .problems { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
        .problem-card { background: white; border: 1px solid var(--line); border-radius: 16px; padding: 28px; }
        .problem-card .emoji { font-size: 28px; margin-bottom: 12px; display: block; }
        .problem-card h3 { font-size: 18px; margin-bottom: 8px; font-weight: 700; }
        .problem-card p { color: var(--ink-soft); font-size: 15px; }
        @media (max-width: 720px) { .problems { grid-template-columns: 1fr; } }

        /* FEATURES */
        .features { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .feature-card { background: var(--bg); border: 1px solid var(--line); border-radius: 16px; padding: 28px; transition: transform .2s, box-shadow .2s; }
        .feature-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(43,43,43,.08); }
        .feature-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--accent-soft); display: flex; align-items: center; justify-content: center; margin-bottom: 18px; font-size: 22px; }
        .feature-card h3 { font-size: 17px; margin-bottom: 8px; font-weight: 700; }
        .feature-card p { color: var(--ink-soft); font-size: 14.5px; line-height: 1.65; }
        @media (max-width: 900px) { .features { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px) { .features { grid-template-columns: 1fr; } }

        /* HOW */
        .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .step { background: white; border: 1px solid var(--line); border-radius: 16px; padding: 32px 26px; text-align: center; }
        .step .num { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--ink); color: var(--bg); font-weight: 700; font-size: 15px; margin-bottom: 16px; }
        .step h3 { font-size: 17px; margin-bottom: 10px; font-weight: 700; }
        .step p { color: var(--ink-soft); font-size: 14.5px; }
        @media (max-width: 720px) { .steps { grid-template-columns: 1fr; } }

        /* INSTRUCTOR */
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .col-text h2 { font-size: clamp(26px, 3.6vw, 36px); letter-spacing: -.025em; margin-bottom: 16px; line-height: 1.3; }
        .col-text p { color: var(--ink-soft); font-size: 16px; margin-bottom: 14px; }
        .col-visual { background: white; border: 1px solid var(--line); border-radius: 24px; padding: 28px; box-shadow: 0 8px 24px rgba(43,43,43,.06); }
        .stat-row { display: flex; justify-content: space-between; padding: 14px 0; border-bottom: 1px dashed var(--line); font-size: 14.5px; }
        .stat-row:last-child { border-bottom: none; }
        .stat-row .label { color: var(--ink-soft); }
        .stat-row .val { font-weight: 700; color: var(--accent); }
        @media (max-width: 820px) { .two-col { grid-template-columns: 1fr; gap: 32px; } }

        /* CTA */
        .final-cta { text-align: center; padding: 96px 0; }
        .final-cta .card { background: var(--ink); color: var(--bg); border-radius: 24px; padding: 64px 32px; }
        .final-cta h2 { font-size: clamp(26px, 3.6vw, 38px); margin-bottom: 12px; letter-spacing: -.02em; }
        .final-cta p { color: #D9D4CC; font-size: 17px; margin-bottom: 28px; }
        .btn-orange { background: var(--accent); color: white; }
        .btn-orange:hover { background: #d0733f; }

        /* FOOTER */
        footer { padding: 40px 0 56px; border-top: 1px solid var(--line); color: var(--ink-soft); font-size: 13px; }
        .footer-inner { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .etymology { max-width: 480px; line-height: 1.7; }
        .etymology strong { color: var(--ink); }
      `}</style>

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
          <span className="badge">🪢 프로그래밍 수업을 위한 AI 교육 도구</span>
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
                지금 적으신 코드에서 <strong>&ldquo;중복&rdquo;이 무엇을 뜻하는지</strong>, 파이썬이 어떻게 판단할 것 같아요? 🤔
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
              {emoji:"📋", h:"답 복붙의 함정", p:"AI가 코드를 척척 내놓으니, 과정은 건너뛰고 결과만 가져옵니다. 막상 비슷한 문제가 나오면 다시 물어봐야 해요."},
              {emoji:"🔁", h:"반복되는 같은 질문", p:"교·강사는 기본 질문에 하루를 다 씁니다. 정작 깊은 지도는 뒤로 밀려요."},
              {emoji:"🙋", h:"손들기 심리 장벽", p:"\"이런 걸 물어봐도 되나…\" 망설이다 수업이 끝납니다. 다음 주제로 넘어가도 계속 뒤처져요."},
              {emoji:"🕳️", h:"막힌 지점이 안 보여요", p:"교수자는 학생이 어디서 막혔는지 알 길이 없습니다. 시험 결과가 나오고 나서야 드러나죠."},
            ].map(({emoji,h,p}) => (
              <div className="problem-card" key={h}>
                <span className="emoji">{emoji}</span>
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
              {icon:"⚡", h:"브라우저 속 Python 실행", p:"설치 없이 지금 바로 코드를 돌려볼 수 있어요. Pyodide 덕분에 서버 왕복 없이 즉시 실행됩니다."},
              {icon:"💬", h:"소크라테스식 대화 엔진", p:"정답을 알려주는 대신, \"어디서부터 막혔어요?\"라고 되물으며 사고 과정을 이끌어냅니다."},
              {icon:"🎚️", h:"3단계 힌트 시스템", p:"L1 개념 환기 → L2 방향 제시 → L3 의사코드. 너무 많지도, 너무 적지도 않게 필요한 만큼만."},
              {icon:"🛡️", h:"답 복붙 가드레일", p:"\"답만 알려주세요\" 같은 요청은 정중히 거절합니다. 학습 윤리를 기본값으로 내장했어요."},
              {icon:"📈", h:"나만의 학습 기록", p:"오늘의 \"아!\" 순간이 쌓여 내 성장 지도가 됩니다. 어떤 개념에서 막혔는지 한눈에."},
              {icon:"📊", h:"교수자 대시보드", p:"우리 반 학생들이 이번 주 어디서 많이 막혔는지 시각화해 다음 수업에 바로 반영할 수 있어요."},
            ].map(({icon,h,p}) => (
              <div className="feature-card" key={h}>
                <div className="feature-icon">{icon}</div>
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
