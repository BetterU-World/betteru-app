import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getSystemCalendarBySlug } from "@/lib/calendars/defaults";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";
import { encryptDiaryContent, decryptDiaryContent, makePreview } from "@/lib/encryption";

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
    // Decrypt content server-side before returning
    const decrypted = (entries as any[]).map((e: any) => {
      let content = "";
      try {
        if (e.encryptedContent) {
          content = decryptDiaryContent(e.encryptedContent);
        } else {
          content = e.content ?? ""; // legacy fallback
        }
      } catch {
        content = "[unreadable]";
      }
      const { encryptedContent, ...rest } = e;
      return { ...rest, content };
    });

    return NextResponse.json({ entries: decrypted });
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
    const { title, content, date } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const entryDate = date ? new Date(date) : new Date();

    const diaryCalendar = await getSystemCalendarBySlug(userId, "diary");

    let encrypted: string;
    try {
      encrypted = encryptDiaryContent(content);
    } catch (e) {
      return NextResponse.json({ error: "Encryption misconfigured" }, { status: 500 });
    }

    const preview = makePreview(content);

    const [entry] = await prisma.$transaction([
      (prisma as any).diaryEntry.create({
        data: {
          userId,
          title,
          content: "", // do not store plaintext
          encryptedContent: encrypted as any,
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

    // Return with decrypted content shape
    return NextResponse.json({ entry: { ...entry, content } }, { status: 201 });
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
    const { id, title, content, date } = body;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Diary entry ID is required" }, { status: 400 });
    }

    const existing = await prisma.diaryEntry.findFirst({ where: { id, userId } });
    if (!existing) {
      return NextResponse.json({ error: "Diary entry not found" }, { status: 404 });
    }

    const entryDate = date ? new Date(date) : existing.date;
    const newTitle = title ?? existing.title;
    const newContent = content ?? existing.content ?? "";

    const diaryCalendar = await getSystemCalendarBySlug(userId, "diary");

    let encryptedUpdate: string;
    try {
      encryptedUpdate = encryptDiaryContent(newContent);
    } catch (e) {
      return NextResponse.json({ error: "Encryption misconfigured" }, { status: 500 });
    }
    const previewUpdate = makePreview(newContent);

    const [updated] = await prisma.$transaction([
      (prisma as any).diaryEntry.update({
        where: { id },
        data: {
          title: newTitle,
          content: "", // stop storing plaintext
          encryptedContent: encryptedUpdate as any,
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

    return NextResponse.json({ ...updated, content: newContent });
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
