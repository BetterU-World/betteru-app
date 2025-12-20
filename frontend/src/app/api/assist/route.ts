export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const mode: "reflect" | "suggest" = body?.mode === "suggest" ? "suggest" : "reflect";
    const draft = typeof body?.draft === "string" ? body.draft : "";
    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    const rawText = (draft || prompt || "").trim();

    if (!rawText || rawText.length < 20) {
      return NextResponse.json({
        text:
          "Write a couple sentences first — then I can help you reflect or choose your next step.",
      });
    }

    // Simple parsing helpers (deterministic)
    const lower = rawText.toLowerCase();
    const wordCount = rawText.split(/\s+/).filter(Boolean).length;

    const firstSentence = (() => {
      const idx = rawText.search(/[.!?]/);
      if (idx !== -1) {
        return rawText.slice(0, idx + 1);
      }
      return rawText.slice(0, 120);
    })();

    const THEMES: Record<string, string[]> = {
      stress: [
        "stress",
        "stressed",
        "anxious",
        "anxiety",
        "overwhelmed",
        "worry",
        "worried",
        "pressure",
        "tension",
      ],
      gratitude: [
        "grateful",
        "thankful",
        "thanks",
        "appreciate",
        "appreciation",
        "gratitude",
      ],
      progress: [
        "progress",
        "improve",
        "improvement",
        "goal",
        "step",
        "milestone",
        "practice",
        "learning",
        "grow",
        "growth",
      ],
      conflict: [
        "argue",
        "argument",
        "fight",
        "conflict",
        "disagree",
        "boundary",
        "boundaries",
      ],
      work: [
        "work",
        "job",
        "career",
        "boss",
        "deadline",
        "project",
        "meeting",
        "task",
      ],
      health: [
        "health",
        "exercise",
        "workout",
        "diet",
        "sleep",
        "energy",
        "fatigue",
        "pain",
        "doctor",
      ],
      relationships: [
        "relationship",
        "partner",
        "family",
        "friends",
        "friend",
        "parent",
        "child",
        "spouse",
        "love",
        "dating",
      ],
      money: [
        "money",
        "finance",
        "financial",
        "budget",
        "spend",
        "spent",
        "saving",
        "savings",
        "debt",
        "bills",
        "income",
      ],
      confidence: [
        "confidence",
        "self-esteem",
        "doubt",
        "insecure",
        "proud",
        "capable",
        "believe",
        "trust myself",
      ],
    };

    const pickTheme = (): string => {
      let best: { theme: string; score: number } = { theme: "general", score: 0 };
      for (const [theme, keywords] of Object.entries(THEMES)) {
        let score = 0;
        for (const k of keywords) {
          const re = new RegExp(`\\b${k.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "g");
          const matches = lower.match(re);
          if (matches) score += matches.length;
        }
        if (score > best.score) best = { theme, score };
      }
      return best.theme;
    };

    const theme = pickTheme();

    const clarifyQuestionByTheme: Record<string, string> = {
      stress: "What’s the one part of this that’s weighing most on you?",
      gratitude: "What felt supportive or good here?",
      progress: "What small sign of progress can you notice?",
      conflict: "What matters most to you in this conversation?",
      work: "Which outcome is most important today?",
      health: "How is your body asking for care?",
      relationships: "What connection or boundary would help right now?",
      money: "What’s the next best financial step that’s realistic?",
      confidence: "What evidence shows you’re capable here?",
      general: "What feels most important to name clearly?",
    };

    const reframeByTheme: Record<string, string> = {
      stress: "You can influence pace and boundaries; others’ reactions are information.",
      gratitude: "Noticing what works builds momentum; imperfections are part of learning.",
      progress: "Progress is often small and compounding; perfect isn’t required.",
      conflict: "You can clarify needs and boundaries; others choose their part.",
      work: "You can plan and prioritize; uncertainty is normal.",
      health: "You can take one caring step; setbacks are part of recovery.",
      relationships: "You can communicate clearly and kindly; outcomes may take time.",
      money: "You can make one wise move; perfection isn’t needed.",
      confidence: "Confidence grows from action; doubt is a normal signal.",
      general: "Small steps in your control help; everything else can wait.",
    };

    const nextStepByTheme: Record<string, string> = {
      stress: "Take 3 slow breaths and write the one next step.",
      gratitude: "List 3 things that supported you today.",
      progress: "Write the next 10‑minute task and start it.",
      conflict: "Draft one respectful sentence that states your need.",
      work: "Choose the top task and block 25 minutes.",
      health: "Drink water and schedule a 10‑minute walk or stretch.",
      relationships: "Send a kind check‑in or set a gentle boundary.",
      money: "Review one expense and set a tiny limit or transfer $5 to savings.",
      confidence: "Write one skill you’ve used before, then take one action.",
      general: "Write one sentence that clarifies what you want next.",
    };

    if (mode === "reflect") {
      const text = [
        `You’re showing up and putting your thoughts into words. It sounds like: ${firstSentence}`,
        clarifyQuestionByTheme[theme],
        reframeByTheme[theme],
        `Next step: ${nextStepByTheme[theme]}`,
      ].join("\n\n");

      return NextResponse.json({ text });
    } else {
      const suggestByTheme: Record<string, string[]> = {
        stress: [
          "What part of this is in your control today?",
          "What’s one tiny thing that would ease the pressure?",
          "What can wait without consequences right now?",
        ],
        gratitude: [
          "What worked better than expected today?",
          "Who or what quietly supported you?",
          "What small moment felt worth keeping?",
        ],
        progress: [
          "What’s the next 10‑minute step?",
          "What changed (even a little) since last time?",
          "How will you know today was ‘good enough’?",
        ],
        conflict: [
          "What boundary would protect your values here?",
          "What need do you want to state clearly?",
          "What is yours to own, and what isn’t?",
        ],
        work: [
          "What’s the single most important task?",
          "Where can you time‑box 25 minutes today?",
          "Who needs clarity or a quick update?",
        ],
        health: [
          "What would help your energy in the next hour?",
          "How did sleep/food/movement affect today?",
          "What’s one caring action your body would appreciate?",
        ],
        relationships: [
          "What connection do you want to nurture?",
          "How can you be clear and kind at the same time?",
          "Where might a gentle boundary help?",
        ],
        money: [
          "What’s the next best step (bill, budget, or save)?",
          "What expense can you reduce by 5% this week?",
          "What would ‘good enough’ look like for your finances today?",
        ],
        confidence: [
          "What strengths showed up here (even subtly)?",
          "What evidence suggests you can handle this?",
          "What supportive sentence would you tell a friend?",
        ],
        general: [
          "What part of this is in your control today?",
          "What would ‘good enough’ look like right now?",
          "What do you want to remember from this moment?",
        ],
      };

      const bullets = suggestByTheme[theme];
      const text = bullets.map((b) => `- ${b}`).join("\n");
      return NextResponse.json({ text });
    }
  } catch (e) {
    return NextResponse.json(
      { error: "Assist is not available right now." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    text:
      "Coming soon — Assist will help you reflect and choose your next intentional step.",
  });
}
