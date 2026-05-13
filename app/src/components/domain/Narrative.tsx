export function Narrative({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return (
    <div className="space-y-md">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-body whitespace-pre-line">{p}</p>
      ))}
    </div>
  );
}
