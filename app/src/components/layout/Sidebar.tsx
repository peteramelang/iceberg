import { useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { taxonomy, topics } from "../../content/index.js";
import { progressStore } from "../../stores/index.js";
import { useStoreTick } from "../../hooks/useStoreSubscription.js";
import { ProgressMarker } from "../domain/ProgressMarker.js";

function totalResourcesFor(slug: string): number {
  const t = topics.find(x => x.frontmatter.slug === slug);
  if (!t) return 0;
  const fm = t.frontmatter;
  return (fm.resources.videos.short ? 1 : 0)
    + (fm.resources.videos.long ? 1 : 0)
    + fm.resources.articles.length
    + fm.resources.services.length
    + fm.resources.courses.length;
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
      const t = topics.find(x => x.frontmatter.slug === currentTopicSlug);
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
  const phases = [...taxonomy.phases].sort((a, b) => a.order - b.order);

  return (
    <aside className="w-[260px] shrink-0 bg-panel border-r border-border h-[100dvh] sticky top-0 overflow-y-auto scrollbar-thin">
      <div className="h-[52px] flex items-center gap-sm px-lg border-b border-border-soft">
        <NavLink to="/" onClick={onNavigate} className="flex items-center gap-sm font-semibold tracking-tight text-text">
          <span aria-hidden className="inline-block w-[22px] h-[22px] rounded-[6px]" style={{ background: "linear-gradient(135deg, var(--accent), var(--blue))" }} />
          iceberg
        </NavLink>
      </div>

      <nav className="py-sm" aria-label="Primary">
        <SidebarItem to="/" label="Continue" onNavigate={onNavigate} icon="◐" exact />
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
          return (
            <li key={phase.slug}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => togglePhase(phase.slug)}
                className={[
                  "w-full text-left flex items-center gap-sm px-lg py-[7px] text-body hover:bg-panel-2",
                  phase.slug === currentPhase ? "bg-panel-2 text-text" : "text-text-mute"
                ].join(" ")}
              >
                <span className="text-text-dim text-[10px] w-[12px] inline-block">{isOpen ? "▾" : "▸"}</span>
                <span className="flex-1 truncate">{phase.title}</span>
                <span className="text-text-dim text-caption tabular-nums">{completed} / {phaseTopics.length}</span>
              </button>
              {isOpen && (
                <ul>
                  {phaseTopics.map(slug => {
                    const t = topics.find(x => x.frontmatter.slug === slug)?.frontmatter;
                    if (!t) return null;
                    const prog = progressStore.getTopicProgress(slug);
                    const total = totalResourcesFor(slug);
                    const checked = Object.values(prog.resources).filter(Boolean).length;
                    const state: "empty" | "partial" | "done" = prog.completed ? "done" : checked > 0 ? "partial" : "empty";
                    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;
                    const active = currentTopicSlug === slug;
                    return (
                      <li key={slug}>
                        <NavLink
                          to={`/topic/${slug}`}
                          onClick={onNavigate}
                          className={[
                            "block pl-[38px] pr-lg py-[6px] border-l-2",
                            active ? "border-accent bg-panel-2 text-text" : "border-transparent text-text-mute hover:text-text hover:bg-panel-2"
                          ].join(" ")}
                        >
                          <div className="flex items-center gap-sm text-caption">
                            <ProgressMarker state={state} />
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
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
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
