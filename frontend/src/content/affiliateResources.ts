export type QuickCopyItem = {
  id: string;
  title: string;
  text: string;
};

export type AffiliateResources = {
  quickCopyBank: QuickCopyItem[];
  philosophy: string[];
  sharingDos: string[];
  sharingDonts: string[];
};

export const affiliateResources: AffiliateResources = {
  quickCopyBank: [
    {
      id: "pitch-30",
      title: "30-second pitch",
      text:
        "BetterU helps you plan your days, track habits, reflect privately, and reach your goals — without ads or data selling. It’s built privacy-first and designed to feel supportive, not shaming. Try it and keep your progress yours.",
    },
    {
      id: "pitch-long",
      title: "Long-form pitch",
      text:
        "I’m using BetterU to simplify life: one calendar for plans, a gentle habits tracker, a private diary for reflection, and clear goals with milestones. There are no creepy trackers, no selling your data, and no pressure tactics — just tools that help you stay consistent. If you want a calmer, more intentional way to organize your days, BetterU is a great fit.",
    },
    {
      id: "sms-script",
      title: "Text message script",
      text:
        "Hey! I found a privacy-first app that helps with planning, habits, and a private diary — it’s called BetterU. It’s simple, supportive, and doesn’t sell your data. If you’re curious, I can share my link."
    },
    {
      id: "ig-caption",
      title: "IG caption",
      text:
        "Feeling more calm and consistent lately. BetterU’s privacy-first planner + habits + diary combo is helping me focus without pressure. If you want a supportive way to organize your days, check out BetterU. #intentionalliving #privacyfirst #habits #goals",
    },
    {
      id: "tiktok-talking-points",
      title: "TikTok talking points",
      text:
        "• One place for planning, habits, diary, and goals\n• Privacy-first: your progress is yours\n• Supportive tone — no shaming, no pressure\n• Lightweight and calming UX\n• Great for building small, consistent wins",
    },
    {
      id: "privacy-objection-reply",
      title: "Privacy/Trust objection reply",
      text:
        "Totally fair question. BetterU is privacy-first — no ad tech, no selling your data, and you control what you share. The diary and finances are encrypted, and the product is designed to support, not track or shame. Your progress stays yours.",
    },
  ],
  philosophy: [
    "Privacy-first: your data belongs to you.",
    "Supportive, non-shaming guidance that respects real life.",
    "Small, consistent wins compound into meaningful change.",
    "Clarity over complexity: simple tools, fewer distractions.",
    "Own your progress: no ads, no data selling.",
  ],
  sharingDos: [
    "Share authentic experiences and practical tips.",
    "Invite, don’t pressure — give people space to choose.",
    "Highlight privacy-first and supportive design.",
    "Use simple, clear language over hype.",
  ],
  sharingDonts: [
    "Don’t make medical, financial, or guaranteed outcome claims.",
    "Don’t shame people or imply surveillance.",
    "Don’t overpromise; focus on consistency and calm.",
    "Don’t imply data is tracked or sold (it isn’t).",
  ],
};
