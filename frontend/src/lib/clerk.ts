import { auth, clerkClient } from "@clerk/nextjs/server";
import type { ClerkClient } from "@clerk/backend";

export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId ?? null;
}

export async function getClerkClient(): Promise<ClerkClient> {
  const client = await clerkClient();
  return client;
}
