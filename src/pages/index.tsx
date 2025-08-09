// src/pages/index.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";

type DigestItem = { id: string; title: string; source: string; date: string; summary: string; tags?: string[] };

const mockDigest: DigestItem[] = [
  { id: "1", title: "McKinsey on GenAI Ops: From Pilots to Scale", source: "McKinsey", date: "Today", summary: "Playbook to move beyond PoCs: operating model, product factories, guardrails.", tags: ["AI","Ops"] },
  { id: "2", title: "HBR: Psychological Safety, 2025 Update", source: "HBR", date: "Today", summary: "Meta-analysis finds leader behaviors that matter most in distributed teams.", tags: ["Leadership","Culture"] },
  { id: "3", title: "FT: Rates Outlook and Hiring", source: "FT", date: "Today", summary: "Soft-landing odds rise; implications for cash runway & sales comp.", tags: ["Macro","Finance"] },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [queryResp, setQueryResp] = useState<string>("");
  const [tone, setTone] = useState("empathetic");
  const [draftType, setDraftType] = useState<"email"|"memo"|"plan">("email");
  const [draftResp, setDraftResp] = useState("");
  const [sources, setSources] = useState<string[]>([
    "https://hbr.org",
    "https://www.mckinsey.com",
    "https://www.bcg.com/insights",
    "https://www.ft.com",
  ]);
  const [automations, setAutomations] = useState({ morning: true, midday: true, evening: true, friday: true });
  const [uploads, setUploads] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const now = useMemo(() => new Date().toLocaleString(), []);

  useEffect(() => {
    // Try a brief on load
    (async () => {
      try { await fetch("/api/brief"); } catch {}
    })();
  }, []);

  async function runQuery() {
    setQueryResp("Thinking…");
    try {
      const r = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const j = await r.json();
      setQueryResp(j.answer || JSON.stringify(j));
    } catch (e:any) {
      setQueryResp("Error: " + e?.message || "Unknown error");
    }
  }

  async function runDraft() {
    setDraftResp("Drafting…");
    try {
      const r = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: draftType, tone, constraints: { max_length: 250 } }),
      });
      const j = await r.json();
      setDraftResp(j.draft || JSON.stringify(j));
    } catch (e:any) {
      setDraftResp("Error: " + e?.message || "Unknown error");
    }
  }

  async function uploadFile(f: File) {
    const fd = new FormData();
    fd.append("file", f);
    const r = await fetch("/api/ingest", { method: "POST", body: fd });
    const j = await r.json();
    if (r.ok) {
      setUploads((u) => [j.path || f.name, ...u]);
    } else {
      alert("Upload failed: " + (j.error || "Unknown error"));
    }
  }

  function addSourceFromInput(el: HTMLInputElement | null) {
    if (!el || !el.value.trim()) return;
    const val = el.value.trim();
    setSources((prev) => Array.from(new Set([val, ...prev])));
    el.value = "";
  }

  return (
    <>
      <Head>
        <title>Orchestrate</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl p-5 bg-white shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">Orchestrate</div>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">PWA</span>
              </div>
              <div className="mt-2 text-sm text-slate-600">{now}</div>
              <div className="mt-4 flex gap-2">
                <button
                  className="px-3 py-2 rounded-2xl bg-black text-white text-sm"
                  onClick={() => window.location.reload()}
                >
                  New brief
                </button>
                <button
                  className="px-3 py-2 rounded-2xl bg-slate-100 text-sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadFile(f);
                  }}
                />
              </div>
            </div>

            {/* Monitored Sources */}
            <div className="rounded-2xl bg-white border shadow-sm">
              <div className="p-4 border-b font-semibold">Monitored Sources</div>
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    placeholder="Add URL or @handle"
                    className="flex-1 border rounded-xl px-3 py-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSourceFromInput(e.target as HTMLInputElement);
                    }}
                  />
                  <button
                    className="px-3 py-2 rounded-xl bg-slate-100"
                    onClick={() =>
                      addSourceFromInput(document.querySelector('input[placeholder="Add URL or @handle"]') as HTMLInputElement)
                    }
                  >
                    +
                  </button>
                </div>
                <ul className="space-y-2 text-sm">
                  {sources.map((s) => (
                    <li key={s} className="flex items-center justify-between">
                      <a className="truncate text-blue-600" href={s} target="_blank" rel="noreferrer">
                        {s}
                      </a>
                      <button className="text-slate-400" onClick={() => setSources((prev) => prev.filter((x) => x !== s))}>
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Automations */}
            <div className="rounded-2xl bg-white border shadow-sm">
              <div className="p-4 border-b font-semibold">Automations</div>
              <div className="p-4 space-y-3 text-sm">
                {[
                  { k: "morning", label: "07:30 Morning brief" },
                  { k: "midday", label: "13:00 Progress nudge" },
                  { k: "evening", label: "20:30 Reflection" },
                  { k: "friday", label: "Friday Review" },
                ].map((a) => (
                  <label key={a.k} className="flex items-center justify-between cursor-pointer">
                    <span>{a.label}</span>
                    <input
                      type="checkbox"
                      checked={(automations as any)[a.k]}
                      onChange={(e) => setAutomations((p) => ({ ...p, [a.k]: e.target.checked }))}
                    />
                  </label>
                ))}
                <p className="text-xs text-slate-500">Note: toggles are UI-only in MVP.</p>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="lg:col-span-9 space-y-4">
            {/* Ask box */}
            <div className="rounded-2xl bg-white border shadow-sm">
              <div className="p-4 border-b font-semibold">Ask Orchestrate</div>
              <div className="p-4 space-y-3">
                <div className="grid md:grid-cols-6 gap-2">
                  <textarea
                    className="md:col-span-5 border rounded-xl px-3 py-2 min-h-[100px]"
                    placeholder="Ask a question, /brief topic, /draft email, /plan goal …"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <div className="md:col-span-1 space-y-2">
                    <select className="w-full border rounded-xl px-3 py-2" value={tone} onChange={(e) => setTone(e.target.value)}>
                      <option value="empathetic">Empathetic</option>
                      <option value="inclusive">Inclusive</option>
                      <option value="crisp">Crisp</option>
                      <option value="assertive">Assertive</option>
                      <option value="neutral">Neutral</option>
                    </select>
                    <button className="w-full px-3 py-2 rounded-2xl bg-black text-white text-sm" onClick={runQuery}>
                      Run
                    </button>
                  </div>
                </div>
                {queryResp && (
                  <div className="border rounded-xl p-3 text-sm bg-slate-50">{queryResp}</div>
                )}
                <div className="flex flex-wrap gap-2 text-sm">
                  {[
                    "Help me set a compassionate, focused intention for today in 2 lines.",
                    "Draft a 200-word update to the exec team on our Q3 priorities in an empathetic, inclusive tone.",
                    "Run a pre-mortem for the new pricing rollout; list top 5 risks and mitigations.",
                  ].map((p) => (
                    <button key={p} className="px-3 py-1 rounded-xl bg-slate-100" onClick={() => setQuery(p)}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Digest + Coaching */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border shadow-sm md:col-span-2">
                <div className="p-4 border-b font-semibold">Today’s Digest</div>
                <div className="p-4 space-y-3">
                  {mockDigest.map((item) => (
                    <div key={item.id} className="p-4 border rounded-xl hover:shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.source} • {item.date}</div>
                      </div>
                      <p className="text-sm mt-2 text-slate-700">{item.summary}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.tags?.map((t) => (
                          <span key={t} className="px-2 py-1 rounded-xl text-xs bg-slate-100">{t}</span>
                        ))}
                        <button className="text-sm px-2 py-1 rounded-xl hover:bg-slate-100">Action brief</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white border shadow-sm">
                <div className="p-4 border-b font-semibold">Coaching Nudge</div>
                <div className="p-4 text-sm space-y-2">
                  <p><b>Notice:</b> We’re pushing decisions to Friday reviews.</p>
                  <p><b>Name:</b> This creates latency & unclear ownership.</p>
                  <p><b>Nudge:</b> In today’s sync ask, “What would a good-enough decision look like right now?” Assign a DARCI owner.</p>
                  <button className="px-3 py-2 rounded-2xl bg-slate-100 text-sm">Practice script</button>
                </div>
              </div>
            </div>

            {/* Drafting workspace */}
            <div className="rounded-2xl bg-white border shadow-sm">
              <div className="p-4 border-b font-semibold">Drafting Workspace</div>
              <div className="p-4 space-y-3">
                <div className="flex flex-wrap gap-2 text-sm">
                  {(["email","memo","plan"] as const).map((t) => (
                    <button
                      key={t}
                      className={`px-3 py-1 rounded-xl ${draftType===t ? "bg-black text-white":"bg-slate-100"}`}
                      onClick={() => setDraftType(t)}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded-2xl bg-black text-white text-sm" onClick={runDraft}>Suggest edits</button>
                  <button className="px-3 py-2 rounded-2xl bg-slate-100 text-sm" onClick={runDraft}>Create variants</button>
                </div>
                {draftResp && <pre className="p-3 bg-slate-50 border rounded-xl text-sm whitespace-pre-wrap">{draftResp}</pre>}
              </div>
            </div>

            {/* Knowledge base */}
            <div className="rounded-2xl bg-white border shadow-sm">
              <div className="p-4 border-b font-semibold">Knowledge Base</div>
              <div className="p-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="file"
                    className="border rounded-xl px-3 py-2"
                    onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
                  />
                </div>
                <ul className="grid md:grid-cols-2 gap-2 text-sm">
                  {uploads.map((u) => (
                    <li key={u} className="p-3 border rounded-xl flex items-center justify-between">
                      <span className="truncate">{u}</span>
                      <button className="text-slate-400" onClick={() => setUploads((prev) => prev.filter((x) => x !== u))}>✕</button>
                    </li>
                  ))}
                  {uploads.length === 0 && <li className="text-slate-500">No uploads yet — try adding a PDF.</li>}
                </ul>
              </div>
            </div>
          </main>
        </div>

        <footer className="py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Orchestrate — MVP dashboard
        </footer>
      </div>
    </>
  );
}
