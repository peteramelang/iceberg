export function Pitfalls({ items }: { items: { title: string; explanation: string }[] }) {
  return (
    <ul className="space-y-md">
      {items.map((p, i) => (
        <li key={i} className="border-l-2 border-danger pl-md py-xs">
          <div className="text-body-strong">[!] {p.title}</div>
          <div className="text-body text-mute mt-xs">{p.explanation}</div>
        </li>
      ))}
    </ul>
  );
}
