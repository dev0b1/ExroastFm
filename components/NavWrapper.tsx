"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { trackPageView } from "@/lib/analytics";

export default function NavWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClientComponentClient();
  const pathname = usePathname();

  // Track page views for Google Analytics
  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    let mountedFlag = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = (data as any)?.session;
        if (mountedFlag) setUser(session?.user || null);
      } catch (e) {
        if (mountedFlag) setUser(null);
      }
      setMounted(true);
    })();
    return () => { mountedFlag = false; };
  }, [supabase]);

  // Hide header/footer on these special pages
  const hideForPaths = ['/checkout', '/success'];
  const hideForPath = hideForPaths.some(p => pathname?.startsWith(p));

  // If user is logged in, hide header/footer as requested
  const hideForUser = !!user;

  const hideNav = hideForPath || hideForUser;

  return (
    <>
      {!hideNav && <Header />}
      <div className="min-h-screen">{children}</div>
      {!hideNav && <Footer />}
    </>
  );
}
