// Single source of truth for admin allowlist
// Keep this minimal and centralized
export const ADMIN_EMAILS = [
  "zellsworld11@gmail.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(String(email).toLowerCase());
}
