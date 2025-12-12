import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSystemCalendarBySlug } from "@/lib/calendars/defaults";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
// Server must not encrypt/decrypt diary body when client-side encryption is enabled
import { makePreview } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse query parameters for date filtering
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    let whereClause: any = { userId };

    if (date) {
      // Filter by specific date
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const entries = await prisma.diaryEntry.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
      include: {
        media: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    // Do NOT decrypt on server. Return metadata + previews only.
    const sanitized = (entries as any[]).map((e: any) => {
      const {
        // redact any body-like fields
        content,
        encryptedContent,
        contentCiphertext,
        contentIv,
        contentSalt,
        contentAlg,
        ...rest
      } = e;
      return {
        ...rest,
        content: "", // client should fetch and decrypt if needed
        contentPreview: e.contentPreview ?? null,
        // include encryption payload presence flags for client
        hasEncryptedPayload: !!(e.contentCiphertext && e.contentIv && e.contentSalt),
      };
    });

    return NextResponse.json({ entries: sanitized });
  } catch (error: any) {
    console.error("Error fetching diary entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch diary entries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { title, content, date, contentCiphertext, contentIv, contentSalt, contentAlg } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const entryDate = date ? new Date(date) : new Date();

    const diaryCalendar = await getSystemCalendarBySlug(userId, "diary");

    // If client-side encrypted payload is provided, store it as-is
    const preview = makePreview(typeof content === "string" ? content : "");

    const [entry] = await prisma.$transaction([
      (prisma as any).diaryEntry.create({
        data: {
          userId,
          title,
          // Prefer client-side encryption payload when provided
          content: typeof content === "string" ? "" : "",
          encryptedContent: null,
          contentCiphertext: contentCiphertext ?? null,
          contentIv: contentIv ?? null,
          contentSalt: contentSalt ?? null,
          contentAlg: contentAlg ?? (contentCiphertext ? "AES-GCM" : null),
          contentPreview: preview as any,
          date: entryDate,
        },
      }) as any,
    ]);

    await prisma.$transaction([
      prisma.calendarEvent.create({
        data: {
          userId,
          title,
          description: "Diary entry",
          date: entryDate,
          allDay: true,
          startTime: null,
          endTime: null,
          userCalendarId: diaryCalendar.id,
          diaryEntryId: entry.id,
        },
      }),
    ]);

    // Return without body; client keeps local plaintext
    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating diary entry:", error);
    return NextResponse.json(
      { error: "Failed to create diary entry" },
      { status: 500 }
    );
  }
}

// PATCH /api/diary - Update a diary entry and keep linked event in sync
export async function PATCH(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { id, title, content, date, contentCiphertext, contentIv, contentSalt, contentAlg } = body;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Diary entry ID is required" }, { status: 400 });
    }

    const existing = await prisma.diaryEntry.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Diary entry not found" }, { status: 404 });
    }

    const entryDate = date ? new Date(date) : existing.date;
    const newTitle = title ?? existing.title;
    const newContent = typeof content === "string" ? content : "";

    const diaryCalendar = await getSystemCalendarBySlug(userId, "diary");

    const previewUpdate = makePreview(newContent);

    const [updated] = await prisma.$transaction([
      (prisma as any).diaryEntry.update({
        where: { id },
        data: {
          title: newTitle,
          content: "", // stop storing plaintext when client encryption present
          encryptedContent: null,
          contentCiphertext: contentCiphertext ?? existing.contentCiphertext ?? null,
          contentIv: contentIv ?? existing.contentIv ?? null,
          contentSalt: contentSalt ?? existing.contentSalt ?? null,
          contentAlg: contentAlg ?? existing.contentAlg ?? (contentCiphertext ? "AES-GCM" : null),
          contentPreview: previewUpdate as any,
          date: entryDate,
        },
      }) as any,
    ]);

    // Update linked calendar event by diaryEntryId
    await prisma.$transaction([
      prisma.calendarEvent.updateMany({
        where: { diaryEntryId: id, userId, userCalendarId: diaryCalendar.id },
        data: {
          title: newTitle,
          date: entryDate,
        },
      }),
    ]);

    // Do not return plaintext body; client owns decryption
    return NextResponse.json({ entry: updated });
  } catch (error: any) {
    console.error("Error updating diary entry:", error);
    return NextResponse.json(
      { error: "Failed to update diary entry" },
      { status: 500 }
    );
  }
}

// DELETE /api/diary - Delete a diary entry and its linked event
export async function DELETE(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Diary entry ID is required" }, { status: 400 });
    }

    const existing = await prisma.diaryEntry.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Diary entry not found" }, { status: 404 });
    }

    const diaryCalendar = await getSystemCalendarBySlug(userId, "diary");

    await prisma.$transaction([
      prisma.calendarEvent.deleteMany({
        where: { diaryEntryId: id, userId, userCalendarId: diaryCalendar.id },
      }),
      prisma.diaryEntry.delete({ where: { id } }),
    ]);

    return NextResponse.json(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting diary entry:", error);
    return NextResponse.json(
      { error: "Failed to delete diary entry" },
      { status: 500 }
    );
  }
}
