import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

function isAdminEmail(email: string | null | undefined) {
  const env = process.env.ADMIN_EMAILS || "";
  const allow = env.split(",").map((e) => e.trim()).filter(Boolean);
  return email ? allow.includes(email) : false;
}

export default async function AdminSecurityPage() {
  const { userId } = await auth();
  const me = userId ? await prisma.user.findUnique({ where: { clerkId: userId } }) : null;
  if (!me || !isAdminEmail(me.email)) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Admin</h1>
        <p className="text-red-600">Forbidden: Admins only</p>
      </div>
    );
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const flags = await prisma.securityFlag.findMany({
    where: { createdAt: { gte: since } },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Security Flags</h1>
      <p className="text-sm text-slate-600">Recent flags (last 30 days)</p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-3">User</th>
              <th className="p-3">Type</th>
              <th className="p-3">Severity</th>
              <th className="p-3">Reason</th>
              <th className="p-3">Created</th>
              <th className="p-3">Resolved</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flags.map((f) => (
              <tr key={f.id} className="border-b">
                <td className="p-3">
                  <div className="font-mono text-xs">{f.userId}</div>
                  {/* Email lookup could be added via join or separate fetch */}
                </td>
                <td className="p-3">{f.type}</td>
                <td className="p-3">{f.severity}</td>
                <td className="p-3">{f.reason}</td>
                <td className="p-3">{new Date(f.createdAt).toLocaleString()}</td>
                <td className="p-3">{f.resolvedAt ? new Date(f.resolvedAt).toLocaleString() : "—"}</td>
                <td className="p-3">
                  {!f.resolvedAt && (
                    <form action={`/api/security/flags/${f.id}/resolve`} method="post">
                      <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Resolve</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <summary className="cursor-pointer font-medium">Raw metadata</summary>
        <div className="mt-3 space-y-2">
          {flags.map((f) => (
            <div key={f.id} className="text-xs">
              <div className="font-semibold">{f.id}</div>
              <pre className="bg-slate-50 p-2 rounded border border-slate-200 overflow-auto">{JSON.stringify(f.metadata, null, 2)}</pre>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
