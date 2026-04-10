import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lysis — 프로그래밍 수업을 위한 소크라테스식 AI 교육 도구",
  description:
    "답 대신 질문을 건네는 AI 교육 도구. 학생의 사고력을 키우고, 교수자에게 학습 데이터를 돌려줍니다.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
