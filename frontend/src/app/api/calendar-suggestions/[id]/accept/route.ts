import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { getPrismaUserIdFromClerk } from "@/lib/user-helpers";

/**
 * POST /api/calendar-suggestions/[id]/accept
 * Convert suggestion to a real CalendarEvent and dismiss the suggestion
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getPrismaUserIdFromClerk(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = await params;

    // Find and verify ownership of the suggestion
    const suggestion = await prisma.calendarSuggestion.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found" },
        { status: 404 }
      );
    }

    // Create the calendar event from the suggestion
    const calendarEvent = await prisma.calendarEvent.create({
      data: {
        userId,
        title: suggestion.title,
        description: suggestion.description || "",
        date: suggestion.suggestedDate,
        startTime: suggestion.suggestedDate,
        endTime: new Date(
          suggestion.suggestedDate.getTime() + 60 * 60 * 1000
        ), // 1 hour duration
        allDay: false,
      },
    });

    // Mark suggestion as dismissed (or delete it)
    await prisma.calendarSuggestion.update({
      where: { id },
      data: { dismissed: true },
    });

    return NextResponse.json(
      {
        message: "Suggestion accepted and event created",
        event: calendarEvent,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error accepting suggestion:", error);
    return NextResponse.json(
      { error: "Failed to accept suggestion" },
      { status: 500 }
    );
  }
}
