import { shouldTrack } from "@/lib/privacy";

type Ctx = { user?: { id?: string; zeroTrackingMode?: boolean | null } };

export async function track(eventName: string, props?: Record<string, any>, ctx?: Ctx) {
  const user = ctx?.user;
  if (!shouldTrack(user as any)) return;
  // No-op placeholder: integrate provider here, gated by shouldTrack
  return;
}

export async function identify(userId: string, traits?: Record<string, any>, ctx?: Ctx) {
  const user = ctx?.user;
  if (!shouldTrack(user as any)) return;
  // No-op placeholder
  return;
}
