"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { usePathname } from "next/navigation";

export function ThemeLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={!isAuthPage}
      disableTransitionOnChange
      forcedTheme={isAuthPage ? "dark" : undefined}
    >
      {children}
    </ThemeProvider>
  );
}