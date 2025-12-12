"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ConditionalSidebar() {
  const pathname = usePathname();
  
  // Routes that should show the sidebar
  const sidebarRoutes = [
    "/dashboard",
    "/diary",
    "/calendar",
    "/financials",
    "/goals",
    "/lists",
    "/settings",
    "/affiliate",
    "/admin",
    "/habits",
  ];

  // Check if current path should show sidebar
  const shouldShowSidebar = sidebarRoutes.some((route) => 
    pathname?.startsWith(route)
  );

  // Don't show sidebar on legal, auth, or home pages
  const hideRoutes = ["/sign-in", "/sign-up", "/sign-out", "/legal"];
  const shouldHide = hideRoutes.some((route) => pathname?.startsWith(route)) || pathname === "/";

  if (shouldHide || !shouldShowSidebar) {
    return null;
  }

  return <Sidebar />;
}
