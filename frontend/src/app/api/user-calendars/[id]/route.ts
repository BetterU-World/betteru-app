import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isSystemCalendar } from "@/lib/calendars/defaults";
import { CalendarType } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT /api/user-calendars/[id] - Update calendar name and/or color
export async function PUT(req: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await req.json();
    const { name, color } = body;

    // Verify calendar ownership
    const calendar = await prisma.userCalendar.findUnique({
      where: { id },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    if (calendar.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if this is a system calendar
    const isSystem = isSystemCalendar({ type: calendar.type, slug: calendar.slug });

    // Build update data
    const updateData: { name?: string; color?: string; isVisible?: boolean } = {};
    
    // System calendars can only update color and isVisible
    if (!isSystem && name && typeof name === "string" && name.trim() !== "") {
      updateData.name = name.trim();
    }
    if (color && typeof color === "string") {
      updateData.color = color;
    }
    if (body.isVisible !== undefined && typeof body.isVisible === "boolean") {
      updateData.isVisible = body.isVisible;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedCalendar = await prisma.userCalendar.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedCalendar);
  } catch (error) {
    console.error("Error updating calendar:", error);
    return NextResponse.json(
      { error: "Failed to update calendar" },
      { status: 500 }
    );
  }
}

// DELETE /api/user-calendars/[id] - Delete calendar (sets events to NULL)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    // Verify calendar ownership
    const calendar = await prisma.userCalendar.findUnique({
      where: { id },
    });

    if (!calendar) {
      return NextResponse.json(
        { error: "Calendar not found" },
        { status: 404 }
      );
    }

    if (calendar.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prevent deleting system calendars
    if (isSystemCalendar({ type: calendar.type, slug: calendar.slug })) {
      return NextResponse.json(
        { error: "Cannot delete system calendars" },
        { status: 400 }
      );
    }

    // Delete calendar - events' userCalendarId will be set to NULL due to onDelete: SetNull
    await prisma.userCalendar.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting calendar:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar" },
      { status: 500 }
    );
  }
}
