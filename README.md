# Orchestrate – Executive Coach and Knowledge Assistant

Welcome to **Orchestrate**, a personal assistant application designed to act as your executive coach, consultant, and personal knowledge base. This repository contains a Next.js PWA skeleton that you can deploy on a free hosting platform (e.g. Vercel) and connect to a free Supabase backend.

## Features

* **Knowledge Base:** Upload PDFs, documents or notes into a Supabase storage bucket. The ingest API uploads your file and leaves placeholders for text extraction, chunking, and embedding using vector embeddings (via OpenAI). You’ll need to implement this logic yourself.
* **Ask Orchestrate:** Ask questions and receive answers based on your knowledge base (vector search coming soon). The current implementation simply echoes your query.
* **Daily Brief:** A stub API endpoint is provided to generate daily summaries and reminders.
* **Drafting:** Draft emails, memos, or strategy plans with a desired tone. The sample endpoint returns a placeholder.
* **PWA:** Installable on mobile devices, with manifest and service worker included.

## How to Use

### 1. Set up Supabase (free)

1. Create a free project at [supabase.com](https://supabase.com).  
2. In the dashboard, create a storage bucket named `knowledge-base`.  
3. Enable the `vector` extension in your database and create a table to store embeddings:

   ```sql
   create extension if not exists vector;
   create table kb_chunks (
     id bigserial primary key,
     file_name text,
     chunk text,
     embedding vector(1536),
     created_at timestamp default now()
   );
   ```
4. Copy your **Project URL** and **Anon key**. Also generate a **Service Role key** for server-side uploads.

### 2. Configure Environment Variables

Create a `.env.local` file in the project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-key # optional for embeddings and drafting
```

### 3. Install Dependencies

Run the following commands (requires Node.js 18+):

```bash
npm install
```

### 4. Run Locally

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

### 5. Deploy

The project can be deployed for free to **Vercel**:

1. Push this repository to GitHub or GitLab.  
2. Go to [vercel.com/import](https://vercel.com/import) and import the repository.  
3. Set the environment variables in the Vercel dashboard (see step 2).  
4. Deploy your project and obtain a free subdomain (`https://orchestrate.vercel.app`).

### 6. Extend and Customize

* **File Parsing:** Use libraries like `pdf-parse` or `mammoth` to extract text from uploaded files.  
* **Embeddings:** Call the OpenAI embeddings API to convert text chunks into embeddings and store them in the `kb_chunks` table using [pgvector](https://github.com/pgvector/pgvector).  
* **Vector Search:** Implement a query function that performs cosine similarity search on the embeddings to find relevant chunks.  
* **Drafting:** Use OpenAI or other LLMs to generate emails, memos, or plans based on prompts and your knowledge base.

## Disclaimer

This repository provides a scaffold. Many of the advanced features described in the concept (such as full-text search, vector embeddings, and real-time notifications) require additional implementation and API usage that will incur costs. Use at your own discretion and feel free to adapt the code.

—

© 2025 Orchestrate.