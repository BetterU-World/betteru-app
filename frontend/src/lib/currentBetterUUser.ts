import { currentUser } from "@clerk/nextjs/server";

export async function getCurrentBetterUUser() {
  const user = await currentUser();
  if (!user) return null;

  const isPro = user.publicMetadata?.isPro === true;
  const affiliateCode =
    (user.publicMetadata?.affiliateCode as string | undefined) ??
    `betteru-${user.id.slice(0, 6)}`;
  const referredBy = user.unsafeMetadata?.referredBy ?? null;
  const stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;
  const stripeSubscriptionStatus = user.privateMetadata?.stripeSubscriptionStatus as string | undefined;

  return {
    id: user.id,
    clerkId: user.id,
    email: user.emailAddresses[0]?.emailAddress ?? null,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    isPro,
    affiliateCode,
    referredBy,
    stripeCustomerId,
    stripeSubscriptionStatus,
  };
}

export type BetterUUser = NonNullable<Awaited<ReturnType<typeof getCurrentBetterUUser>>>;
