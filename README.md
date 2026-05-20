# Granola Web

A web-based AI meeting notes app — a personal Granola clone. No apps, no team collaboration. Just you, your microphone, and AI-enhanced notes.

## Stack

- **Next.js 16** (App Router, Server Actions)
- **Clerk** — Authentication
- **Drizzle ORM** — Type-safe PostgreSQL queries
- **OpenRouter** — Free NVIDIA models
  - Primary: `nvidia/nemotron-3-super-120b-a12b:free` (120B MoE, 1M context)
  - Fallback: `nvidia/nemotron-nano-2-vl:free` (12B multimodal)
  - Auto: `openrouter/router` (rotates free models)
- **Web Speech API** — Browser-native transcription
- **Tailwind CSS** — Granola-inspired warm neutral palette

## Features

| Feature | Description |
|---------|-------------|
| Invisible Transcription | Browser Web Speech API — no bot joins your call |
| Live Recording | Record, pause, resume with timer |
| Raw Notes Editor | Jot thoughts during/after meetings |
| AI Enhancement | One-click structured summary with action items, decisions, follow-ups |
| Meeting Chat | Ask questions about any meeting |
| Cross-Meeting Search | AI-powered search across your entire note history |
| Suggestion Engine | "What should I ask next?" suggestions |
| Fully Private | Text-only storage, user-scoped queries, no audio kept |

## Setup

```bash
npm install
cp .env.example .env.local
# Fill in Clerk, DATABASE_URL, OpenRouter keys
npm run db:push   # Push Drizzle schema to Postgres
npm run dev
```

## Drizzle ORM

All database operations are type-safe:

```typescript
// Select
const userMeetings = await db.select().from(meetings).where(eq(meetings.userId, userId));

// Insert
const [newMeeting] = await db.insert(meetings).values({ userId, title, rawNotes }).returning();

// Update
await db.update(meetings).set({ enhancedNotes: aiSummary }).where(eq(meetings.id, id));

// Delete
await db.delete(meetings).where(and(eq(meetings.id, id), eq(meetings.userId, userId)));
```

## Database Schema

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Meeting',
  raw_notes TEXT NOT NULL DEFAULT '',
  enhanced_notes TEXT,
  transcript TEXT NOT NULL DEFAULT '',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  folder TEXT,
  is_enhanced BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Browser Support

- **Chrome/Edge**: Full support
- **Safari**: Limited
- **Firefox**: Not supported (no Web Speech API)
