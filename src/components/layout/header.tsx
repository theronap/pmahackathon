"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const isLanding = pathname === "/";
  const themeClass = isLanding ? "theme-landing" : "theme-tool";

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const isActive = (path: string) => pathname === path;

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl ${themeClass}`}
      style={{
        backgroundColor: "var(--header-bg)",
        borderBottom: "1px solid var(--header-border)",
        transition: "background-color 0.3s, border-color 0.3s",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "var(--header-accent-bg)" }}
          >
            <svg
              className="h-4 w-4"
              style={{ color: "var(--header-accent)" }}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>
          <span
            className="font-bold text-lg transition-colors"
            style={{ color: "var(--header-text-hover)" }}
          >
            teachMe
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={
              isActive("/")
                ? { color: "var(--header-accent)", backgroundColor: "var(--header-accent-bg)" }
                : { color: "var(--header-text)" }
            }
          >
            Home
          </Link>
          <Link
            href="/tool"
            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            style={
              isActive("/tool")
                ? { color: "var(--header-accent)", backgroundColor: "var(--header-accent-bg)" }
                : { color: "var(--header-text)" }
            }
          >
            Tool
          </Link>

          {user ? (
            <div
              className="flex items-center gap-2 ml-2 pl-2"
              style={{ borderLeft: "1px solid var(--header-divider)" }}
            >
              <span
                className="text-sm hidden sm:inline truncate max-w-[160px]"
                style={{ color: "var(--header-text)" }}
              >
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{ color: "var(--header-text)" }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ml-2 pl-2"
              style={{
                borderLeft: "1px solid var(--header-divider)",
                ...(isActive("/login")
                  ? { color: "var(--header-accent)", backgroundColor: "var(--header-accent-bg)" }
                  : { color: "var(--header-text)" }),
              }}
            >
              Log In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
