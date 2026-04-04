
# WriteFlow

A web-based writing tool that transforms scattered thoughts into structured, polished writing. WriteFlow provides a three-stage pipeline — Dump, Structure, Write — with an optional AI thinking partner that analyzes your logic without ever writing for you.

**Live:** [writeflow.vercel.app](https://writeflow.vercel.app)

---

## The Problem

Writers face a gap between "ideas in my head" and "finished piece of writing." Current tools either give a blank page, use AI to write generic text, or overwhelm with features.

## The Solution

WriteFlow breaks writing into three natural stages:

### 1. 💭 Brain Dump
Capture every thought as individual cards. No organizing, no pressure. Just get it out.

### 2. 🧩 Structure
Drag and drop thoughts into named clusters to form your outline. AI can suggest groupings automatically.

### 3. ✍️ Write
Expand clusters into full prose in a distraction-free editor with your outline always visible. AI checks your logic — never writes a word for you.

---

## Features

- **Three-stage writing pipeline** — Dump → Structure → Write
- **Drag & drop organization** — Powered by @dnd-kit
- **Rich text editor** — Tiptap with formatting toolbar, word count, auto-save
- **AI Thinking Partner** — Suggest clusters, logic check, reverse outline, coherence analysis
- **BYOAK model** — Bring Your Own API Key (Groq). Keys stay in localStorage, never on servers
- **Dark mode** — Soft, eye-friendly dark theme designed for long writing sessions
- **Writer preferences** — Customizable font size, line spacing, editor width
- **Export** — Markdown export
- **Optimistic UI** — Instant feedback on every action
- **Auto-save** — 3-second debounce, visual save indicator

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Auth | Supabase Auth (Google OAuth + Magic Links) |
| Editor | Tiptap v2 (ProseMirror) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| AI | Groq API (Llama 3.1) |
| Styling | Tailwind CSS 3 + custom design system |
| State | Zustand |
| Deployment | Vercel |

---

## Architecture Decisions

**Server Components for auth & data fetching** — Project layout checks auth and loads data server-side. Zero JavaScript shipped for these operations.

**Client Components for interactivity** — Drag-and-drop, editor, and forms use `"use client"` with the smallest possible component boundary.

**Optimistic updates** — Every mutation updates the UI instantly, then syncs with the database. Rollback on failure.

**Three security layers** — Middleware redirects, API route auth checks, and Supabase Row Level Security.

**Debounced auto-save** — Editor saves after 3 seconds of inactivity. Drag-and-drop saves after 1 second. No data loss.

**BYOAK (Bring Your Own API Key)** — Groq API key stored in browser localStorage only. Never sent to our database. API routes proxy to Groq and never log keys.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- (Optional) Groq API key for AI features

### Setup

```bash
git clone https://github.com/arxel2468/WriteFlow.git
cd WriteFlow
npm install
```

Create `.env` (for Prisma):
```env
DATABASE_URL="your_supabase_pooled_connection_string"
DIRECT_URL="your_supabase_direct_connection_string"
```

Create `.env.local` (for Next.js):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Push database schema:
```bash
npx prisma db push
npx prisma generate
```

Run:
```bash
npm run dev
```

---

## Database Schema

Six tables with Row Level Security:

- **profiles** — Extends Supabase auth with display name and preferences
- **projects** — User's writing projects
- **atoms** — Individual thought cards (max 500 chars)
- **clusters** — Named groups that form the outline
- **drafts** — Tiptap JSON content with word count
- **snapshots** — Version history (future)

All tables enforce user-level isolation via RLS policies.

---

## Project Structure

```
writeflow/
├── app/
│   ├── api/projects/...     API routes (CRUD, export, AI)
│   ├── auth/callback/       OAuth callback handler
│   ├── dashboard/           Project list
│   ├── login/               Auth page
│   ├── project/[id]/        Workspace (dump, structure, write)
│   └── page.tsx             Landing page
├── components/
│   ├── ai/                  AI panel, API key setup
│   ├── auth/                Login form
│   ├── dashboard/           Project grid, dialogs
│   ├── dump/                Atom input, atom cards
│   ├── editor/              Tiptap, toolbar, reference panel
│   ├── settings/            Theme switcher, writer settings
│   ├── structure/           DnD zones, cluster columns
│   ├── ui/                  Base components (button, dialog, etc.)
│   └── workspace/           Navigation tabs
├── hooks/                   Custom hooks
├── lib/                     Supabase, Prisma, utils, exports
├── stores/                  Zustand stores
└── types/                   TypeScript types
```

---

## License

MIT

