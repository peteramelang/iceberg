export function HairlineRule({ strong = false }: { strong?: boolean }) {
  return <div className={`h-px w-full ${strong ? "bg-hairline-strong" : "bg-hairline"}`} />;
}
