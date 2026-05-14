export function Narrative({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return (
    <div className="flex flex-col gap-md max-w-[720px]">
      {paragraphs.map((p, i) => (
        <p key={i} className="text-body text-text leading-[1.65] whitespace-pre-line">{p}</p>
      ))}
    </div>
  );
}
