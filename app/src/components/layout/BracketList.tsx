import type { ReactNode } from "react";

export function BracketList({ children }: { children: ReactNode }) {
  return <ul className="space-y-0">{children}</ul>;
}

export function BracketItem({ marker = "[+]", label, children }: { marker?: string; label: string; children?: ReactNode }) {
  return (
    <li className="flex gap-md py-sm">
      <span className="text-ink select-none">{marker}</span>
      <div className="flex-1">
        <span className="font-medium">{label}</span>
        {children && <span className="text-body ml-md">{children}</span>}
      </div>
    </li>
  );
}
