import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { getTopic, taxonomy, topics, connections } from "../../content/index.js";
import { phasesSorted, resourceTotalFor } from "../../content/derived.js";
import { progressStore } from "../../stores/index.js";
import { useStoreTick } from "../../hooks/useStoreSubscription.js";
import { useCompletionPulse } from "../../hooks/useCompletionPulse.js";
import { ProgressMarker } from "../domain/ProgressMarker.js";
import { BrandMark } from "./BrandMark.js";

// First topic with no incoming prerequisite edge — the natural starting
// point for a brand-new user with no progress.
const PREREQ_FREE_FIRST_SLUG = (() => {
  const targets = new Set<string>();
  for (const e of connections) if (e.type === "prerequisite") targets.add(e.to);
  return topics.find(t => !targets.has(t.frontmatter.slug))?.frontmatter.slug
    ?? topics[0]?.frontmatter.slug
    ?? null;
})();

// "Continue" target: spec §2.2 says this should navigate to the
// last-touched topic, or the first prereq-free topic if none. Computed at
// each Sidebar render via useStoreTick subscription on progressStore.
function resumeTarget(): string {
  const last = progressStore.getLastTouchedTopic();
  if (last) return `/topic/${last}`;
  if (PREREQ_FREE_FIRST_SLUG) return `/topic/${PREREQ_FREE_FIRST_SLUG}`;
  return "/";
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  useStoreTick(l => progressStore.subscribe(l));
  const location = useLocation();
  const currentTopicSlug = useMemo(() => {
    const m = location.pathname.match(/^\/topic\/([^/]+)/);
    return m && m[1] ? m[1] : null;
  }, [location.pathname]);
  const currentPhaseFromPath = useMemo(() => {
    const m = location.pathname.match(/^\/phase\/([^/]+)/);
    return m && m[1] ? m[1] : null;
  }, [location.pathname]);
  const currentPhase = useMemo(() => {
    if (currentPhaseFromPath) return currentPhaseFromPath;
    if (currentTopicSlug) {
      const t = getTopic(currentTopicSlug);
      return t?.frontmatter.phase ?? null;
    }
    return null;
  }, [currentPhaseFromPath, currentTopicSlug]);

  const [manualExpanded, setManualExpanded] = useState<Set<string>>(new Set());
  const togglePhase = (slug: string) => setManualExpanded(prev => {
    const next = new Set(prev);
    if (next.has(slug)) next.delete(slug); else next.add(slug);
    return next;
  });

  if (!taxonomy) return null;
  const phases = phasesSorted;

  return (
    <aside className="w-[260px] shrink-0 bg-panel border-r border-border h-[100dvh] sticky top-0 overflow-y-auto scrollbar-thin">
      <div className="h-[52px] flex items-center gap-sm px-lg border-b border-border-soft">
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-sm font-semibold tracking-tight text-text">
          <BrandMark size={22} />
          iceberg
        </NavLink>
      </div>

      <nav className="py-sm" aria-label="Primary">
        <SidebarItem to={resumeTarget()} label="Continue" onNavigate={onNavigate} icon="◐" />
        <SidebarItem to="/bookmarks" label="Bookmarks" onNavigate={onNavigate} icon="★" />
        <SidebarItem to="/paths" label="Paths" onNavigate={onNavigate} icon="⇢" />
        <SidebarItem to="/whats-new" label="What's new" onNavigate={onNavigate} icon="✦" />
        <SidebarItem to="/graph" label="Graph" onNavigate={onNavigate} icon="⟁" />
        <SidebarItem to="/settings" label="Settings" onNavigate={onNavigate} icon="⚙" />
      </nav>

      <div className="px-lg py-sm text-label text-text-dim uppercase">Curriculum</div>

      <ul className="pb-xl">
        {phases.map(phase => {
          const isOpen = manualExpanded.has(phase.slug) || phase.slug === currentPhase;
          const phaseTopics = phase.topics;
          const completed = phaseTopics.filter(s => progressStore.getTopicProgress(s).completed).length;
          const topicsListId = `sidebar-phase-${phase.slug}-topics`;
          return (
            <li key={phase.slug}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={topicsListId}
                onClick={() => togglePhase(phase.slug)}
                className={[
                  "w-full text-left flex items-center gap-sm px-lg py-[7px] text-body hover:bg-panel-2",
                  phase.slug === currentPhase ? "bg-panel-2 text-text" : "text-text-mute"
                ].join(" ")}
              >
                <span aria-hidden className="text-text-dim text-[10px] w-[12px] inline-block">{isOpen ? "▾" : "▸"}</span>
                <span className="flex-1 truncate">{phase.title}</span>
                <span className="text-text-dim text-caption tabular-nums">{completed} / {phaseTopics.length}</span>
              </button>
              {isOpen && (
                <ul id={topicsListId}>
                  {phaseTopics.map(slug => (
                    <SidebarTopicRow
                      key={slug}
                      slug={slug}
                      active={currentTopicSlug === slug}
                      onNavigate={onNavigate}
                    />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function SidebarTopicRow({
  slug, active, onNavigate
}: { slug: string; active: boolean; onNavigate?: () => void }) {
  const t = getTopic(slug)?.frontmatter;
  const pulse = useCompletionPulse(slug);
  if (!t) return null;
  const prog = progressStore.getTopicProgress(slug);
  const total = resourceTotalFor(slug);
  const checked = Object.values(prog.resources).filter(Boolean).length;
  const state: "empty" | "partial" | "done" = prog.completed ? "done" : checked > 0 ? "partial" : "empty";
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
  return (
    <li>
      <NavLink
        to={`/topic/${slug}`}
        onClick={onNavigate}
        className={[
          "block pl-[38px] pr-lg py-[6px] border-l-2",
          active ? "border-accent bg-panel-2 text-text" : "border-transparent text-text-mute hover:text-text hover:bg-panel-2"
        ].join(" ")}
      >
        <div className="flex items-center gap-sm text-caption">
          <ProgressMarker state={state} pulse={pulse} />
          <span className="truncate">{t.title}</span>
        </div>
        <div className="ml-[17px] mt-[5px] h-[2px] bg-border-soft rounded-pill overflow-hidden">
          <div
            className={state === "done" ? "h-full bg-green" : "h-full bg-accent"}
            style={{ width: `${pct}%` }}
          />
        </div>
      </NavLink>
    </li>
  );
}

function SidebarItem({
  to, label, icon, onNavigate, exact
}: { to: string; label: string; icon: string; onNavigate?: () => void; exact?: boolean }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onNavigate}
      className={({ isActive }) => [
        "flex items-center gap-sm px-lg py-[7px] text-body border-l-2",
        isActive ? "border-accent bg-panel-2 text-text" : "border-transparent text-text-mute hover:text-text hover:bg-panel-2"
      ].join(" ")}
    >
      <span className="w-4 inline-flex justify-center text-text-dim" aria-hidden>{icon}</span>
      {label}
    </NavLink>
  );
}
