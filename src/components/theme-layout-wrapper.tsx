"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { usePathname } from "next/navigation";

export function ThemeLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/';
  const isLiveFormPage = pathname && pathname.startsWith('/live-form/');

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={!isAuthPage && !isLiveFormPage}
      disableTransitionOnChange
      forcedTheme={isAuthPage ? "dark" : isLiveFormPage ? "light" : undefined}
    >
      {children}
    </ThemeProvider>
  );
}
