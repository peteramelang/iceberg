export function DifficultyBadge({ difficulty, hours }: { difficulty: "beginner" | "intermediate" | "advanced"; hours: number }) {
  const map = {
    beginner: { label: "Beginner", className: "border-success text-success" },
    intermediate: { label: "Intermediate", className: "border-warning text-warning" },
    advanced: { label: "Advanced", className: "border-danger text-danger" }
  } as const;
  const m = map[difficulty];
  return (
    <span className={`inline-flex items-baseline gap-md px-md py-xxs border rounded-sm text-caption-md ${m.className}`}>
      <span>[{m.label}]</span>
      <span className="text-mute">~{hours}h</span>
    </span>
  );
}
