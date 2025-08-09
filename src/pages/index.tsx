// src/pages/index.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";

export default function Home() {
  const [query, setQuery] = useState("");
  const [queryResp, setQueryResp] = useState<string>("");
  const [tone, setTone] = useState("empathetic");
  const [uploads, setUploads] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const now = useMemo(() => new Date().toLocaleString(), []);

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
    } catch (e: any) {
      setQueryResp("Error: " + e?.message || "Unknown error");
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

  return (
    <>
      <Head>
        <title>Orchestrate</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 text-slate-900">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-indigo-700">Orchestrate</h1>
            <span className="text-xs bg-slate-200 px-2 py-1 rounded-full">{now}</span>
          </header>

          {/* Hero Section */}
          <section className="rounded-3xl overflow-hidden shadow-lg bg-white border grid md:grid-cols-2">
            <div className="p-6 flex flex-col justify-center">
              <h2 className="text-2xl font-semibold mb-2">Your Executive Assistant & Coach</h2>
              <p className="text-slate-600 mb-4">
                Ask questions, get strategy briefs, and manage your knowledge base — powered by ChatGPT-5 and your uploaded content.
              </p>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload to Knowledge Base
              </button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
              />
            </div>
            <img
              src="https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=900&q=80"
              alt="Leadership"
              className="object-cover w-full h-full"
            />
          </section>

          {/* Ask Orchestrate */}
          <section className="bg-white p-6 rounded-3xl shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Ask Orchestrate</h2>
            <div className="grid md:grid-cols-6 gap-2 mb-4">
              <textarea
                className="md:col-span-5 border rounded-xl px-3 py-2 min-h-[100px]"
                placeholder="Ask me anything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="space-y-2">
                <select
                  className="w-full border rounded-xl px-3 py-2"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="empathetic">Empathetic</option>
                  <option value="inclusive">Inclusive</option>
                  <option value="crisp">Crisp</option>
                  <option value="assertive">Assertive</option>
                  <option value="neutral">Neutral</option>
                </select>
                <button
                  className="w-full px-3 py-2 rounded-2xl bg-indigo-600 text-white text-sm"
                  onClick={runQuery}
                >
                  Run
                </button>
              </div>
            </div>
            {queryResp && (
              <div className="border rounded-xl p-4 bg-indigo-50 text-slate-800">
                {queryResp}
              </div>
            )}
          </section>

          {/* Knowledge Base */}
          <section className="bg-white p-6 rounded-3xl shadow-lg border">
            <h2 className="text-xl font-semibold mb-4">Knowledge Base</h2>
            {uploads.length === 0 && (
              <p className="text-slate-500">No uploads yet — try adding a PDF, DOCX, or TXT file.</p>
            )}
            <ul className="grid md:grid-cols-2 gap-2 text-sm">
              {uploads.map((u) => (
                <li
                  key={u}
                  className="p-3 border rounded-xl flex items-center justify-between bg-slate-50"
                >
                  <span className="truncate">{u}</span>
                  <button
                    className="text-slate-400 hover:text-red-500"
                    onClick={() => setUploads((prev) => prev.filter((x) => x !== u))}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Coaching & Digest */}
          <section className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl overflow-hidden shadow-lg border bg-white">
              <img
                src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51?auto=format&fit=crop&w=900&q=80"
                alt="Coaching"
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Coaching Nudge</h3>
                <p className="text-slate-600 text-sm">
                  Today, focus on making decisions during syncs instead of deferring them to weekly reviews.
                </p>
              </div>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-lg border bg-white">
              <img
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80"
                alt="Digest"
                className="w-full h-40 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2">Today’s Digest</h3>
                <p className="text-slate-600 text-sm">
                  Key updates from leadership & strategy sources appear here once live source monitoring is enabled.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
