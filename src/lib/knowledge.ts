// ============================================================
//  VKM AI knowledge base + retrieval.
//
//  Pools every knowledge source the assistant can draw on —
//  site content (services, FAQs, articles, due dates, downloads)
//  plus the firm's own documents from the /knowledge folder —
//  and picks the chunks most relevant to the visitor's question,
//  so the system prompt stays small while the bot stays smart.
// ============================================================

import {
  faqs,
  serviceCategories,
  dueDates,
  posts,
  downloads,
  industries,
  site,
} from "@/lib/site";
import { firmDocs } from "@/lib/knowledge-data";

export type Chunk = { id: string; title: string; text: string };

// ── Build the chunk pool ─────────────────────────────────────
function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];

  for (const s of serviceCategories) {
    chunks.push({
      id: `service:${s.slug}`,
      title: `Service — ${s.title}`,
      text: `${s.short}\nWe handle: ${s.items.join("; ")}.`,
    });
  }

  for (const p of posts) {
    chunks.push({
      id: `post:${p.slug}`,
      title: `Article — ${p.title} (${p.cat})`,
      text: `${p.body.join("\n")}\nFull article: ${site.url}/blog/${p.slug}`,
    });
  }

  faqs.forEach((f, i) => {
    chunks.push({ id: `faq:${i}`, title: `FAQ — ${f.q}`, text: f.a });
  });

  chunks.push({
    id: "due-dates",
    title: "Statutory due dates calendar",
    text: dueDates.map((d) => `${d.date}: ${d.task} (${d.cat})`).join("\n"),
  });

  chunks.push({
    id: "downloads",
    title: "Free downloadable checklists",
    text:
      downloads
        .map((d) => `${d.title} (${d.cat}): ${d.desc}`)
        .join("\n") + `\nAll free at ${site.url}/downloads`,
  });

  chunks.push({
    id: "industries",
    title: "Industries we serve",
    text: industries.map((i) => `${i.name}: ${i.note}`).join("\n"),
  });

  chunks.push(...firmDocs);

  return chunks;
}

const CHUNKS = buildChunks();

// ── Retrieval ────────────────────────────────────────────────
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "do", "does",
  "did", "will", "would", "can", "could", "shall", "should", "may", "might",
  "i", "we", "you", "he", "she", "it", "they", "my", "our", "your", "me",
  "and", "or", "but", "if", "of", "to", "in", "on", "at", "for", "with",
  "from", "by", "about", "as", "into", "than", "then", "so", "that", "this",
  "these", "those", "what", "which", "who", "when", "where", "how", "why",
  "not", "no", "yes", "have", "has", "had", "get", "got", "want", "need",
  "please", "tell", "know", "hai", "hain", "kya", "ka", "ki", "ke", "ko",
  "mera", "meri", "apna", "aahe", "kay", "mala", "majha",
]);

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9ऀ-ॿ\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

type Indexed = { chunk: Chunk; titleTokens: Set<string>; bodyTokens: Set<string> };
const INDEX: Indexed[] = CHUNKS.map((chunk) => ({
  chunk,
  titleTokens: new Set(tokens(chunk.title)),
  bodyTokens: new Set(tokens(chunk.text)),
}));

// Chunks worth showing when the question matches nothing specific
// (greetings, Hindi/Marathi small talk, very vague queries).
const DEFAULT_IDS = new Set(["downloads", "due-dates", "faq:0", "faq:1"]);

/**
 * Return the knowledge chunks most relevant to `query`, capped by a
 * character budget so the system prompt stays lean.
 */
export function retrieveKnowledge(query: string, budgetChars = 6000): Chunk[] {
  const qTokens = [...new Set(tokens(query))];

  const scored = INDEX.map(({ chunk, titleTokens, bodyTokens }) => {
    let score = 0;
    for (const t of qTokens) {
      if (titleTokens.has(t)) score += 3;
      else if (bodyTokens.has(t)) score += 1;
    }
    return { chunk, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  const picked: Chunk[] = [];
  let used = 0;
  for (const { chunk } of scored) {
    if (used + chunk.text.length > budgetChars) continue;
    picked.push(chunk);
    used += chunk.text.length;
    if (picked.length >= 8) break;
  }

  // Weak or no match (greeting / vague / non-English) → sensible defaults.
  if (picked.length < 2) {
    for (const item of INDEX) {
      if (DEFAULT_IDS.has(item.chunk.id) && !picked.some((c) => c.id === item.chunk.id)) {
        picked.push(item.chunk);
      }
    }
  }

  return picked;
}
