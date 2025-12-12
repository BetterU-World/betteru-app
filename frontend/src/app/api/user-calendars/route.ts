import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { ensureDefaultCalendarsForUser } from "@/lib/calendars/defaults";

// GET /api/user-calendars - List all user calendars with event counts
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Ensure system calendars exist and get all calendars
    await ensureDefaultCalendarsForUser(user.id);

    const calendars = await prisma.userCalendar.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { events: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const calendarsWithCount = calendars.map((calendar: any) => ({
      id: calendar.id,
      name: calendar.name,
      color: calendar.color,
      type: calendar.type,
      slug: calendar.slug,
      isVisible: calendar.isVisible,
      createdAt: calendar.createdAt,
      updatedAt: calendar.updatedAt,
      eventCount: calendar._count.events,
    }));

    return NextResponse.json(calendarsWithCount);
  } catch (error) {
    console.error("Error fetching calendars:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendars" },
      { status: 500 }
    );
  }
}

// POST /api/user-calendars - Create a new calendar
export async function POST(req: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, color } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Calendar name is required" },
        { status: 400 }
      );
    }

    // Generate random color if not provided
    const colors = [
      "#6366F1", // indigo
      "#EC4899", // pink
      "#10B981", // green
      "#F59E0B", // amber
      "#8B5CF6", // purple
      "#3B82F6", // blue
      "#EF4444", // red
      "#14B8A6", // teal
      "#F97316", // orange
      "#06B6D4", // cyan
    ];

    const finalColor =
      color && typeof color === "string"
        ? color
        : colors[Math.floor(Math.random() * colors.length)];

    const calendar = await prisma.userCalendar.create({
      data: {
        userId: user.id,
        name: name.trim(),
        color: finalColor,
      },
    });

    return NextResponse.json(calendar, { status: 201 });
  } catch (error) {
    console.error("Error creating calendar:", error);
    return NextResponse.json(
      { error: "Failed to create calendar" },
      { status: 500 }
    );
  }
}
