"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { isAdminEmail } from "@/lib/isAdmin";

function useIsAdmin() {
  const { user } = useUser();
  if (!user) return false;
  const email = user.emailAddresses?.[0]?.emailAddress || "";
  return isAdminEmail(email);
}

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
  requiresAdmin?: boolean;
};

export default function Sidebar() {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Listen for global open/close events from Header (hamburger)
  useEffect(() => {
    const open = () => setIsMobileOpen(true);
    const close = () => setIsMobileOpen(false);
    window.addEventListener("betteru:openSidebar", open);
    window.addEventListener("betteru:closeSidebar", close);
    return () => {
      window.removeEventListener("betteru:openSidebar", open);
      window.removeEventListener("betteru:closeSidebar", close);
    };
  }, []);

  // Prevent background scroll when drawer is open
  useEffect(() => {
    try {
      document.body.style.overflow = isMobileOpen ? "hidden" : "";
    } catch {}
  }, [isMobileOpen]);

  const navGroups: NavGroup[] = [
    {
      label: "Core",
      items: [
        { href: "/dashboard", label: "Dashboard", icon: "🏠" },
        { href: "/diary", label: "Diary", icon: "📓" },
        { href: "/calendar", label: "Calendar", icon: "📅" },
      ],
    },
    {
      label: "Tools",
      items: [
        { href: "/financials", label: "Finances", icon: "💰" },
        { href: "/goals", label: "Goals", icon: "🎯" },
        { href: "/lists", label: "Lists", icon: "📋" },
      ],
    },
    {
      label: "Account",
      items: [
        { href: "/settings", label: "Settings", icon: "⚙️" },
        { href: "/affiliate", label: "Affiliate", icon: "🤝" },
      ],
    },
    {
      label: "Admin",
      items: [
        { href: "/admin", label: "Admin", icon: "🛠️" },
      ],
      requiresAdmin: true,
    },
  ];

  const filteredNavGroups = navGroups.filter(
    (group) => !group.requiresAdmin || isAdmin
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  const NavContent = () => (
    <nav aria-label="Sidebar" className="flex flex-col h-full">
      {/* Navigation label */}
      <div className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Navigation
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6">
        {filteredNavGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                    {active && (
                      <div className="ml-auto w-1 h-5 bg-white rounded-full" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-200">
        <div className="text-xs text-slate-500">
          <div className="font-semibold text-slate-700 mb-1">BetterU</div>
          <div>Better You, Better World</div>
        </div>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar - Fixed left column */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-slate-200 md:bg-white">
        <NavContent />
      </aside>

      {/* Mobile Sidebar - Overlay drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <aside
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out"
            aria-modal="true"
            role="dialog"
          >
            {/* Close button */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                aria-label="Close sidebar"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <NavContent />
          </aside>
        </div>
      )}

    </>
  );
}
