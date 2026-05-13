import type { ReactNode } from "react";

export function Section({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <section className="mt-section first:mt-0">
      {label && <h2 className="text-heading-md mb-lg">{label}</h2>}
      {children}
    </section>
  );
}
