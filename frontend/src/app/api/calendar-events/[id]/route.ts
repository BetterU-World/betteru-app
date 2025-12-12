import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth/requireUser";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireDbUser();

  const event = await prisma.calendarEvent.findUnique({
    where: { id },
    include: {
      diaryEntry: { select: { id: true, title: true, date: true } },
      userCalendar: { select: { id: true, name: true, color: true } },
    },
  });

  if (!event || event.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ event }, { status: 200 });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireDbUser();

  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    allDay,
    diaryEntryId,
    userCalendarId,
  } = body ?? {};

  const updated = await prisma.calendarEvent.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      description: description ?? existing.description,
      date: date ? new Date(date) : existing.date,
      startTime: startTime ? new Date(startTime) : existing.startTime,
      endTime: endTime ? new Date(endTime) : existing.endTime,
      allDay: typeof allDay === "boolean" ? allDay : existing.allDay,
      diaryEntryId: typeof diaryEntryId === "string" ? diaryEntryId : existing.diaryEntryId,
      userCalendarId: typeof userCalendarId === "string" ? userCalendarId : existing.userCalendarId,
    },
    include: {
      diaryEntry: { select: { id: true, title: true, date: true } },
      userCalendar: { select: { id: true, name: true, color: true } },
    },
  });

  return NextResponse.json({ event: updated }, { status: 200 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireDbUser();

  const existing = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.calendarEvent.delete({ where: { id } });
  return NextResponse.json({ ok: true }, { status: 200 });
}
