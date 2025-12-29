import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Please sign in" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const { message: rawMessage, category: rawCategory, pageUrl: rawPageUrl } = body as {
      message?: unknown;
      category?: unknown;
      pageUrl?: unknown;
    };

    if (typeof rawMessage !== "string") {
      return NextResponse.json({ ok: false, error: "message is required" }, { status: 400 });
    }
    const message = rawMessage.trim();
    if (message.length < 10 || message.length > 2000) {
      return NextResponse.json(
        { ok: false, error: "message must be between 10 and 2000 characters" },
        { status: 400 }
      );
    }

    let category: string | null = null;
    if (rawCategory !== undefined) {
      if (typeof rawCategory !== "string") {
        return NextResponse.json({ ok: false, error: "category must be a string" }, { status: 400 });
      }
      const c = rawCategory.trim();
      if (c.length > 30) {
        return NextResponse.json(
          { ok: false, error: "category must be at most 30 characters" },
          { status: 400 }
        );
      }
      category = c.length > 0 ? c : null;
    }

    let pageUrl: string | null = null;
    if (rawPageUrl !== undefined) {
      if (typeof rawPageUrl !== "string") {
        return NextResponse.json({ ok: false, error: "pageUrl must be a string" }, { status: 400 });
      }
      const p = rawPageUrl.trim();
      if (p.length > 300) {
        return NextResponse.json(
          { ok: false, error: "pageUrl must be at most 300 characters" },
          { status: 400 }
        );
      }
      pageUrl = p.length > 0 ? p : null;
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.feedback.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
      },
    });
    if (recentCount >= 5) {
      return NextResponse.json(
        { ok: false, error: "Too many feedback submissions. Please try again later." },
        { status: 429 }
      );
    }

    await prisma.feedback.create({
      data: {
        userId,
        message,
        category,
        pageUrl,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
