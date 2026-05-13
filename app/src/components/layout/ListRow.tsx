import type { ReactNode } from "react";

export function ListRow({ marker, children }: { marker?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex gap-md py-sm items-baseline">
      {marker && <span className="select-none">{marker}</span>}
      <div className="flex-1">{children}</div>
    </div>
  );
}
