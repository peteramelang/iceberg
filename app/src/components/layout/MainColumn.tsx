import type { ReactNode } from "react";

export function MainColumn({ children, maxWidth = "max-w-[720px]" }: { children: ReactNode; maxWidth?: string }) {
  return <div className={`min-w-0 ${maxWidth} w-full`}>{children}</div>;
}
