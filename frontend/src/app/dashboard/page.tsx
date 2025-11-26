import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-4">Welcome to your protected dashboard. Your user id: {userId}</p>
    </div>
  );
}
