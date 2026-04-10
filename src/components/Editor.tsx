"use client";

import dynamic from "next/dynamic";

// Monaco 에디터는 SSR 불가 — dynamic import로 클라이언트에서만 로드
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-bg-soft text-ink-soft text-sm">
      에디터 로딩 중...
    </div>
  ),
});

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  isDark?: boolean;
}

export default function Editor({ value, onChange, isDark = false }: EditorProps) {
  return (
    <MonacoEditor
      height="100%"
      defaultLanguage="python"
      value={value}
      onChange={(val) => onChange(val || "")}
      theme={isDark ? "vs-dark" : "vs-light"}
      onMount={(editor) => {
        // flex 컨테이너 높이가 확정된 뒤 레이아웃 재계산
        const container = editor.getContainerDomNode().parentElement;
        if (container) {
          const observer = new ResizeObserver(() => editor.layout());
          observer.observe(container);
        }
        setTimeout(() => editor.layout(), 50);
      }}
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        padding: { top: 16 },
        lineNumbersMinChars: 3,
        renderLineHighlight: "gutter",
        tabSize: 4,
        automaticLayout: true,
      }}
    />
  );
}
