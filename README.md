
# WriteFlow

A focused writing tool that transforms scattered thoughts into structured, 
polished writing. WriteFlow provides a three-stage pipeline — Dump, Structure, 
Write — with an AI thinking partner that analyzes your logic without ever 
writing for you.

**Live:** [writeflowapp.vercel.app](https://writeflowapp.vercel.app)

---

## The Problem

Writers face a gap between "ideas in my head" and "finished piece of writing." 
Current tools either present a blank page, use AI to generate generic text, 
or overwhelm with features. WriteFlow solves this by breaking writing into 
natural stages and keeping AI in an advisory role.

## The Pipeline

### 1. 💭 Brain Dump
Capture every thought as individual cards. No organizing, no pressure. 
Optimistic UI means every card appears instantly — just keep writing.

### 2. 🧩 Structure
Drag and drop thoughts into named clusters to form your outline. AI suggests 
groupings based on your content. Reorder freely until your structure feels right.

### 3. ✍️ Write
Expand clusters into full prose in a distraction-free editor. Your outline 
stays visible on the left. Click any thought to insert it. Focus Mode hides 
everything but the editor. AI checks your logic — never writes a word for you.

---

## Features

- **Three-stage writing pipeline** — Dump → Structure → Write
- **Drag & drop organization** — Powered by @dnd-kit with full keyboard and touch support
- **Rich text editor** — Tiptap with formatting toolbar, word count, word goal progress, auto-save
- **AI Thinking Partner** — Suggest clusters, logic check, reverse outline, coherence analysis
- **BYOAK model** — Bring Your Own API Key (Groq). Keys stay in localStorage, never on servers
- **Focus Mode** — Full-screen editor, hides all UI, Esc to exit
- **Version history** — Manual and auto snapshots (every 30 min), one-click restore
- **Word goal** — Set a target, track progress with a live bar per project
- **Keyboard shortcuts** — Full shortcut set with in-app overlay (press `?`)
- **Dark / light mode** — Soft, eye-friendly themes designed for long writing sessions
- **Writer preferences** — Customizable font size, line spacing, editor width
- **Export** — Markdown export with one click
- **Optimistic UI** — Every action feels instant, rolls back cleanly on failure
- **Auto-save** — 3-second debounce on editor, 1-second on drag-and-drop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 5 |
| Auth | Supabase Auth (Google OAuth + Magic Links) |
| Editor | Tiptap v3 (ProseMirror) |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| AI | Groq API (Llama 3.1 8B) |
| Styling | Tailwind CSS 3 + custom design system |
| State | Zustand |
| Notifications | Sonner |
| Deployment | Vercel |

---

## Architecture Decisions

**Server Components for auth & data fetching** — Project layout checks auth 
and loads data server-side. Zero JavaScript shipped for these operations.

**Client Components for interactivity** — Drag-and-drop, editor, and forms 
use `"use client"` with the smallest possible component boundary.

**Optimistic updates** — Every mutation updates the UI instantly, then syncs 
with the database. Rolls back on failure with no user intervention needed.

**Three security layers** — Middleware redirects, API route auth checks, and 
Supabase Row Level Security. No route is protected by only one layer.

**Debounced auto-save** — Editor saves after 3 seconds of inactivity. 
Drag-and-drop saves after 1 second. No data loss between sessions.

**BYOAK (Bring Your Own API Key)** — Groq API key stored in browser 
localStorage only. Never sent to our database. API routes proxy to Groq 
and never log keys. Users own their AI access entirely.

**Version history** — Snapshots store full Tiptap JSON at a point in time. 
Capped at 50 per draft with automatic oldest-first pruning.

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

Create `.env`:
```env
DATABASE_URL="your_supabase_pooled_connection_string"
DIRECT_URL="your_supabase_direct_connection_string"
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npx prisma db push
npx prisma generate
npm run dev
```

---

## Database Schema

Six tables with Row Level Security:

- **profiles** — Extends Supabase auth with display name and preferences
- **projects** — User's writing projects with archive support
- **atoms** — Individual thought cards (max 500 chars), soft-deleted via `isArchived`
- **clusters** — Named groups that form the outline, ordered by position
- **drafts** — Tiptap JSON content with word count, one per project
- **snapshots** — Full point-in-time version history, capped at 50 per draft

---

## License

MIT
