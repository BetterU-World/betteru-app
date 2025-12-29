export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth/requireUser";

type Payload = {
  dayKey?: string;
  moodInt?: number | null;
  energyInt?: number | null;
  stressInt?: number | null;
  sleepHours?: number | null;
};

function toDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function isValidDayKey(k: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(k);
}

function allNull(p: Payload): boolean {
  return (
    (p.moodInt ?? null) === null &&
    (p.energyInt ?? null) === null &&
    (p.stressInt ?? null) === null &&
    (p.sleepHours ?? null) === null
  );
}

function validatePayload(p: Payload): string | null {
  const intFields: Array<keyof Payload> = ["moodInt", "energyInt", "stressInt"];
  for (const k of intFields) {
    const v = p[k] as number | null | undefined;
    if (v === null || v === undefined) continue;
    if (!Number.isInteger(v) || v < 0 || v > 10) return `${String(k)} must be an integer 0–10`;
  }
  if (p.sleepHours !== null && p.sleepHours !== undefined) {
    const v = p.sleepHours;
    if (v < 0 || v > 12) return "sleepHours must be between 0 and 12";
    if (Math.round(v * 2) !== v * 2) return "sleepHours must be in 0.5 increments";
  }
  return null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireDbUser();
    const { searchParams } = new URL(req.url);
    const day = searchParams.get("day");
    const dayKey = day && isValidDayKey(day) ? day : toDayKey(new Date());

    let rows: { id: string; userId: string; dayKey: string; moodInt: number | null; energyInt: number | null; stressInt: number | null; sleepHours: number | null; createdAt: Date; updatedAt: Date }[] = [];
    try {
      rows = await prisma.$queryRaw<{ id: string; userId: string; dayKey: string; moodInt: number | null; energyInt: number | null; stressInt: number | null; sleepHours: number | null; createdAt: Date; updatedAt: Date }[]>`
        SELECT "id", "userId", "dayKey", "moodInt", "energyInt", "stressInt", "sleepHours", "createdAt", "updatedAt"
        FROM "DailyState"
        WHERE "userId" = ${user.id} AND "dayKey" = ${dayKey}
        LIMIT 1
      `;
    } catch (e: any) {
      // Table may not exist yet; treat as no state
      rows = [];
    }
    return NextResponse.json({ state: rows[0] ?? null }, { status: 200 });
  } catch (error) {
    console.error("DailyState fetch error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireDbUser();
    const body = (await req.json()) as Payload;
    const err = validatePayload(body);
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const dayKey = body.dayKey && isValidDayKey(body.dayKey) ? body.dayKey : toDayKey(new Date());

    const payload: Payload = {
      dayKey,
      moodInt: body.moodInt ?? null,
      energyInt: body.energyInt ?? null,
      stressInt: body.stressInt ?? null,
      sleepHours: body.sleepHours ?? null,
    };

    // Ensure table exists (idempotent)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "DailyState" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "dayKey" TEXT NOT NULL,
        "moodInt" INTEGER,
        "energyInt" INTEGER,
        "stressInt" INTEGER,
        "sleepHours" DOUBLE PRECISION,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT unique_user_day UNIQUE ("userId", "dayKey")
      )
    `;

    if (allNull(payload)) {
      await prisma.$executeRaw`
        DELETE FROM "DailyState" WHERE "userId" = ${user.id} AND "dayKey" = ${dayKey}
      `;
      return NextResponse.json({ deleted: true }, { status: 200 });
    }

    const genId = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
      ? globalThis.crypto.randomUUID()
      : require('crypto').randomUUID();
    const rows = await prisma.$queryRaw<{ id: string; userId: string; dayKey: string; moodInt: number | null; energyInt: number | null; stressInt: number | null; sleepHours: number | null; createdAt: Date; updatedAt: Date }[]>`
      INSERT INTO "DailyState" ("id", "userId", "dayKey", "moodInt", "energyInt", "stressInt", "sleepHours", "createdAt", "updatedAt")
      VALUES (${genId}, ${user.id}, ${dayKey}, ${payload.moodInt}, ${payload.energyInt}, ${payload.stressInt}, ${payload.sleepHours}, now(), now())
      ON CONFLICT ("userId", "dayKey") DO UPDATE SET
        "moodInt" = EXCLUDED."moodInt",
        "energyInt" = EXCLUDED."energyInt",
        "stressInt" = EXCLUDED."stressInt",
        "sleepHours" = EXCLUDED."sleepHours",
        "updatedAt" = now()
      RETURNING "id", "userId", "dayKey", "moodInt", "energyInt", "stressInt", "sleepHours", "createdAt", "updatedAt"
    `;

    return NextResponse.json({ state: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("DailyState upsert error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
