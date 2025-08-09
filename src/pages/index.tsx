import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Upload selected files to the ingest API
  const uploadFiles = async () => {
    if (files.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', files[0]);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResponse(JSON.stringify(data));
    } catch (error) {
      console.error(error);
      setResponse('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Submit a query to the query API
  const submitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setResponse(data.answer || JSON.stringify(data));
    } catch (error) {
      console.error(error);
      setResponse('Query failed');
    }
  };

  return (
    <>
      <Head>
        <title>Orchestrate</title>
        <meta name="description" content="Your executive coach and knowledge assistant" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <main className="min-h-screen p-4 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-4">Orchestrate</h1>
        <section className="w-full max-w-xl mb-8 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Knowledge Base</h2>
          <input
            type="file"
            onChange={handleFileChange}
            className="mb-2"
          />
          <button
            onClick={uploadFiles}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </section>

        <section className="w-full max-w-xl mb-8 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Ask Orchestrate</h2>
          <form onSubmit={submitQuery} className="flex flex-col space-y-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border p-2 rounded"
              placeholder="Ask a question..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Ask
            </button>
          </form>
        </section>

        {response && (
          <section className="w-full max-w-xl p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-2">Response</h2>
            <pre className="whitespace-pre-wrap">{response}</pre>
          </section>
        )}
      </main>
    </>
  );
}
