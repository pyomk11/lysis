// 외부 모듈 타입 선언

declare module "lucide-react" {
  import { FC, SVGProps } from "react";
  interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
  }
  export const Play: FC<IconProps>;
  export const RotateCcw: FC<IconProps>;
  export const Send: FC<IconProps>;
  export const Moon: FC<IconProps>;
  export const Sun: FC<IconProps>;
  export const GraduationCap: FC<IconProps>;
  export const ClipboardCopy: FC<IconProps>;
  export const Repeat: FC<IconProps>;
  export const Hand: FC<IconProps>;
  export const EyeOff: FC<IconProps>;
  export const Zap: FC<IconProps>;
  export const MessageCircle: FC<IconProps>;
  export const SlidersHorizontal: FC<IconProps>;
  export const ShieldCheck: FC<IconProps>;
  export const TrendingUp: FC<IconProps>;
  export const BarChart3: FC<IconProps>;
}

// Pyodide는 <script> 태그로 로드되어 window.loadPyodide에 할당됨
// pyodide.ts에서 (window as any).loadPyodide로 접근
