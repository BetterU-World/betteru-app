import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = params;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: This event does not belong to you" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, date, startTime, endTime, allDay, diaryEntryId, userCalendarId } = body;

    // Validation
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // If diaryEntryId is provided, verify it belongs to the user
    if (diaryEntryId) {
      const diaryEntry = await prisma.diaryEntry.findUnique({
        where: { id: diaryEntryId },
      });

      if (!diaryEntry || diaryEntry.userId !== user.id) {
        return NextResponse.json(
          { error: "Invalid diary entry" },
          { status: 403 }
        );
      }
    }

    const event = await prisma.calendarEvent.update({
      where: { id },
      data: {
        title,
        description: description !== undefined ? description : existingEvent.description,
        date: date ? new Date(date) : existingEvent.date,
        startTime: startTime !== undefined ? (startTime ? new Date(startTime) : null) : existingEvent.startTime,
        endTime: endTime !== undefined ? (endTime ? new Date(endTime) : null) : existingEvent.endTime,
        allDay: allDay !== undefined ? allDay : existingEvent.allDay,
        diaryEntryId: diaryEntryId !== undefined ? diaryEntryId : existingEvent.diaryEntryId,
        userCalendarId: userCalendarId !== undefined ? userCalendarId : existingEvent.userCalendarId,
      },
      include: {
        diaryEntry: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
        userCalendar: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error("Calendar event update error:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id } = params;

    // Check if event exists and belongs to user
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (existingEvent.userId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: This event does not belong to you" },
        { status: 403 }
      );
    }

    await prisma.calendarEvent.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Calendar event deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}
