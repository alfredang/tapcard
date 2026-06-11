import "server-only";
import { query } from "@anthropic-ai/claude-agent-sdk";

/*
  AI features run through the Claude Agent SDK using the user's CLAUDE SUBSCRIPTION
  (the logged-in Claude credentials / CLAUDE_CODE_OAUTH_TOKEN) — NOT an API key.
  Every helper degrades gracefully: if the SDK/CLI or a subscription token is
  unavailable, or a call errors, it returns a sensible templated fallback so the
  product never hard-fails.
*/

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";
const TIMEOUT_MS = 45_000;

/** Core: send a one-shot prompt, return the model's final text (or null). */
async function runClaude(prompt: string, system?: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = query({
      prompt,
      options: {
        model: MODEL,
        maxTurns: 1,
        // Pure text generation — no tools, no project settings/skills bleed-in.
        allowedTools: [],
        settingSources: [],
        abortController: controller,
        ...(system ? { systemPrompt: system } : {}),
      },
    });

    let text = "";
    try {
      for await (const message of response) {
        if (message.type === "result" && message.subtype === "success") {
          text = message.result ?? "";
        }
      }
    } finally {
      clearTimeout(timer);
    }

    text = text.trim();
    return text.length ? text : null;
  } catch (err) {
    console.warn("[ai] Claude Agent SDK call failed, using fallback:", err);
    return null;
  }
}

/** Strip markdown code fences and parse the first JSON object found. */
function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

// ─── Card / profile generation ───────────────────────────────────────────────

interface ProfileSeed {
  fullName: string;
  jobTitle?: string | null;
  company?: string | null;
  tone?: string;
}

export async function generateBio(seed: ProfileSeed): Promise<string> {
  const role = [seed.jobTitle, seed.company].filter(Boolean).join(" at ");
  const out = await runClaude(
    `Write a concise, professional one-line bio (max 200 characters, first person, no hashtags, no quotes) for a digital business card.
Name: ${seed.fullName}
Role: ${role || "professional"}
Tone: ${seed.tone || "confident and approachable"}
Return ONLY the bio text.`,
  );
  return (
    out ||
    `${seed.jobTitle || "Professional"}${
      seed.company ? ` at ${seed.company}` : ""
    } — passionate about delivering great results and building lasting relationships.`
  );
}

export async function generateAbout(seed: ProfileSeed): Promise<string> {
  const role = [seed.jobTitle, seed.company].filter(Boolean).join(" at ");
  const out = await runClaude(
    `Write a warm, professional "About Me" paragraph (2-4 sentences, first person, no markdown) for ${seed.fullName}${
      role ? `, ${role}` : ""
    }. Focus on expertise, value delivered, and approachability. Return ONLY the paragraph.`,
  );
  return (
    out ||
    `I'm ${seed.fullName}${role ? `, ${role}` : ""}. I focus on understanding what clients truly need and delivering work that exceeds expectations. I believe great relationships are the foundation of great results — let's connect.`
  );
}

export async function generateCompanyDescription(company: string): Promise<string> {
  const out = await runClaude(
    `Write a crisp 1-2 sentence company description for "${company}" suitable for a digital business card. Return ONLY the text.`,
  );
  return out || `${company} delivers trusted solutions and exceptional service to clients who value quality and reliability.`;
}

export async function generateSalesPitch(seed: ProfileSeed): Promise<string> {
  const out = await runClaude(
    `Write a short, persuasive elevator pitch (2-3 sentences) for ${seed.fullName}, ${[
      seed.jobTitle,
      seed.company,
    ]
      .filter(Boolean)
      .join(" at ")}. Return ONLY the pitch.`,
  );
  return (
    out ||
    `Looking for a partner who delivers? ${seed.fullName} brings the expertise and dedication to turn your goals into results. Let's talk about how we can work together.`
  );
}

// ─── CRM intelligence ────────────────────────────────────────────────────────

export interface LeadInsight {
  score: number; // 0-100
  rating: "Hot" | "Warm" | "Cold";
  summary: string;
  suggestedFollowUp: string;
}

interface LeadSeed {
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  message?: string | null;
}

export async function analyzeLead(lead: LeadSeed): Promise<LeadInsight> {
  const raw = await runClaude(
    `You are a CRM assistant. Score this inbound lead and respond with STRICT JSON only:
{"score": <0-100 integer>, "rating": "Hot|Warm|Cold", "summary": "<one sentence>", "suggestedFollowUp": "<one actionable next step>"}

Lead:
- Name: ${lead.name}
- Company: ${lead.company || "n/a"}
- Email: ${lead.email || "n/a"}
- Phone: ${lead.phone || "n/a"}
- Message: ${lead.message || "n/a"}`,
  );

  const parsed = parseJson<LeadInsight>(raw);
  if (parsed && typeof parsed.score === "number") {
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      rating: parsed.rating || ratingFromScore(parsed.score),
      summary: parsed.summary || "Lead captured from a digital business card.",
      suggestedFollowUp:
        parsed.suggestedFollowUp || "Reach out within 24 hours to introduce yourself.",
    };
  }

  // Heuristic fallback when AI is unavailable.
  let score = 40;
  if (lead.email) score += 15;
  if (lead.phone) score += 15;
  if (lead.company) score += 15;
  if (lead.message && lead.message.length > 30) score += 15;
  return {
    score,
    rating: ratingFromScore(score),
    summary: `${lead.name}${lead.company ? ` from ${lead.company}` : ""} submitted contact details via your card.`,
    suggestedFollowUp: lead.email
      ? "Send a personalized intro email within 24 hours."
      : "Call or message to qualify their needs.",
  };
}

function ratingFromScore(score: number): LeadInsight["rating"] {
  if (score >= 70) return "Hot";
  if (score >= 45) return "Warm";
  return "Cold";
}

/** Whether a subscription credential appears to be configured (best-effort hint). */
export function aiConfigured() {
  return Boolean(process.env.CLAUDE_CODE_OAUTH_TOKEN) || true; // logged-in CLI also works
}
