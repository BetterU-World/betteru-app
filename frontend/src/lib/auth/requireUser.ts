import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import type { User } from "@prisma/client";
import { getClerkUserId } from "@/lib/clerk";

export async function requireUserId(): Promise<string> {
  const userId = await getClerkUserId();
  if (!userId) {
    throw NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return userId;
}

export async function requireDbUser(): Promise<User> {
  const clerkId = await requireUserId();
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) {
    throw NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return user;
}
