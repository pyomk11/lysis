/**
 * Pyodide (브라우저 내 Python 실행) 래퍼
 * 클라이언트 사이드에서만 사용 가능
 *
 * Next.js는 외부 URL dynamic import를 지원하지 않으므로,
 * <script> 태그로 Pyodide를 로드하고 window.loadPyodide를 사용한다.
 */

import type { ExecutionResult } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pyodideInstance: any = null;
let loadingPromise: Promise<void> | null = null;

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full";

/**
 * <script> 태그로 Pyodide CDN 스크립트를 로드한다.
 */
function loadPyodideScript(): Promise<void> {
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    // 이미 로드된 경우
    if ((window as any).loadPyodide) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `${PYODIDE_CDN}/pyodide.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Pyodide 스크립트 로드 실패"));
    document.head.appendChild(script);
  });

  return loadingPromise;
}

/**
 * Pyodide 인스턴스를 초기화하고 반환한다.
 * 최초 1회만 로드하고 이후는 캐시된 인스턴스를 반환.
 */
export async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;

  await loadPyodideScript();

  const loadPyodide = (window as any).loadPyodide;
  if (!loadPyodide) {
    throw new Error("Pyodide가 로드되지 않았습니다.");
  }

  pyodideInstance = await loadPyodide({
    indexURL: `${PYODIDE_CDN}/`,
  });

  return pyodideInstance;
}

/**
 * Python 코드를 실행하고 결과를 반환한다.
 * stdout/stderr를 캡처하며, 타임아웃(기본 10초)을 적용한다.
 */
export async function runPython(
  code: string,
  timeoutMs = 10_000
): Promise<ExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = await getPyodide();

    // stdout/stderr 캡처 설정
    pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
    `);

    // 타임아웃 적용 실행
    const result = await Promise.race([
      pyodide.runPythonAsync(code),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`실행 시간 초과 (${timeoutMs / 1000}초)`)),
          timeoutMs
        )
      ),
    ]);

    const stdout = pyodide.runPython("sys.stdout.getvalue()") || "";
    const stderr = pyodide.runPython("sys.stderr.getvalue()") || "";

    return {
      success: true,
      stdout: stdout + (result !== undefined ? String(result) : ""),
      stderr,
      executionTime: performance.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
      executionTime: performance.now() - startTime,
    };
  }
}
