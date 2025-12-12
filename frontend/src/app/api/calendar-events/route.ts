import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireDbUser } from "@/lib/auth/requireUser";

export async function GET(request: NextRequest) {
  try {
    const user = await requireDbUser();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const date = searchParams.get("date");
    const includeGoals = searchParams.get("includeGoals") === "true";

    let whereClause: any = { userId: user.id };
    let milestoneWhereClause: any = { userId: user.id };

    if (date) {
      // Filter by specific date
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
      
      milestoneWhereClause.dueDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (month && year) {
      // Filter by month and year
      const startOfMonth = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endOfMonth = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
      whereClause.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
      
      milestoneWhereClause.dueDate = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const events = await prisma.calendarEvent.findMany({
      where: whereClause,
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
      orderBy: {
        date: "asc",
      },
    });

    // Optionally include goal milestones as virtual events
    let goalMilestones: any[] = [];
    if (includeGoals) {
      const milestones = await prisma.goalMilestone.findMany({
        where: milestoneWhereClause,
        include: {
          goal: {
            select: {
              id: true,
              title: true,
              category: true,
              priority: true,
            },
          },
        },
        orderBy: {
          dueDate: "asc",
        },
      });

      // Transform milestones into event-like objects
      goalMilestones = milestones
        .filter(m => m.dueDate)
        .map((m) => ({
          id: `goal-milestone-${m.id}`,
          title: `🎯 ${m.goal.title}: ${m.title}`,
          description: m.description || m.goal.title,
          date: m.dueDate,
          isAllDay: true,
          type: "goal-milestone",
          metadata: {
            goalId: m.goal.id,
            milestoneId: m.id,
            completed: m.completed,
            priority: m.goal.priority,
            category: m.goal.category,
          },
          userCalendar: {
            id: "goals",
            name: "Goals",
            color: "#10b981", // Green color for goals
          },
        }));
    }

    return NextResponse.json({ events: [...events, ...goalMilestones] }, { status: 200 });
  } catch (error) {
    console.error("Calendar events fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireDbUser();

    const body = await request.json();
    const { title, description, date, startTime, endTime, allDay, diaryEntryId, userCalendarId } = body;

    // Validation
    if (!title || !date) {
      return NextResponse.json(
        { error: "Title and date are required" },
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

    const event = await prisma.calendarEvent.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        date: new Date(date),
        startTime: startTime ? new Date(startTime) : null,
        endTime: endTime ? new Date(endTime) : null,
        allDay: allDay || false,
        diaryEntryId: diaryEntryId || null,
        userCalendarId: userCalendarId || null,
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

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Calendar event creation error:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
