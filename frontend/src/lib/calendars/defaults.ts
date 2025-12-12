import prisma from "@/lib/prisma";
import { CalendarType } from "@prisma/client";

export type SystemCalendarSlug =
  | "personal"
  | "diary"
  | "financial"
  | "goals"
  | "tasks"
  | "fitness";

export const SYSTEM_CALENDARS: {
  slug: SystemCalendarSlug;
  name: string;
  defaultColor: string;
}[] = [
  { slug: "personal", name: "Personal", defaultColor: "#3b82f6" },
  { slug: "diary", name: "Diary", defaultColor: "#ec4899" },
  { slug: "financial", name: "Financial", defaultColor: "#22c55e" },
  { slug: "goals", name: "Goals", defaultColor: "#f59e0b" },
  { slug: "tasks", name: "Tasks", defaultColor: "#6366f1" },
  { slug: "fitness", name: "Fitness", defaultColor: "#ef4444" },
];

/**
 * Ensures all system calendars exist for a user.
 * Creates missing system calendars and returns all calendars for the user.
 */
export async function ensureDefaultCalendarsForUser(userId: string) {
  // Create system calendars if they don't exist
  for (const systemCal of SYSTEM_CALENDARS) {
    await prisma.userCalendar.upsert({
      where: {
        userId_slug: {
          userId,
          slug: systemCal.slug,
        },
      },
      create: {
        userId,
        name: systemCal.name,
        slug: systemCal.slug,
        type: CalendarType.SYSTEM,
        color: systemCal.defaultColor,
        isVisible: true,
      },
      update: {}, // Keep existing name, color, visibility on update
    });
  }

  // Return all calendars for the user
  return prisma.userCalendar.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

/**
 * Gets a specific system calendar by slug for a user.
 * Throws if the calendar doesn't exist.
 */
export async function getSystemCalendarBySlug(
  userId: string,
  slug: SystemCalendarSlug
) {
  return prisma.userCalendar.findFirstOrThrow({
    where: {
      userId,
      slug,
    },
  });
}

/**
 * Gets a specific system calendar by slug, or creates it if it doesn't exist.
 */
export async function getOrCreateSystemCalendar(
  userId: string,
  slug: SystemCalendarSlug
) {
  const systemCal = SYSTEM_CALENDARS.find((c) => c.slug === slug);
  if (!systemCal) {
    throw new Error(`Invalid system calendar slug: ${slug}`);
  }

  // Try to find existing calendar
  const existing = await prisma.userCalendar.findFirst({
    where: { userId, slug },
  });

  if (existing) {
    return existing;
  }

  // Create if not exists
  return prisma.userCalendar.create({
    data: {
      userId,
      name: systemCal.name,
      slug: systemCal.slug,
      type: CalendarType.SYSTEM,
      color: systemCal.defaultColor,
      isVisible: true,
    },
  });
}

/**
 * Checks if a calendar is a system calendar.
 */
export function isSystemCalendar(calendar: {
  type: CalendarType | string;
  slug: string | null;
}): boolean {
  return (
    calendar.type === CalendarType.SYSTEM || calendar.type === "SYSTEM" ||
    (calendar.slug !== null &&
      SYSTEM_CALENDARS.some((c) => c.slug === calendar.slug))
  );
}
