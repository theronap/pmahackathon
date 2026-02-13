"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/60 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-7 w-7 rounded-lg bg-teal-500/20 flex items-center justify-center">
            <svg
              className="h-4 w-4 text-teal-400"
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
          <span className="font-bold text-white text-lg group-hover:text-teal-300 transition-colors">
            teachMe
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/"
                ? "text-teal-300 bg-teal-400/10"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            )}
          >
            Home
          </Link>
          <Link
            href="/tool"
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              pathname === "/tool"
                ? "text-teal-300 bg-teal-400/10"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
            )}
          >
            Tool
          </Link>

          {user ? (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-800">
              <span className="text-sm text-gray-400 hidden sm:inline truncate max-w-[160px]">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ml-2 pl-2 border-l border-gray-800",
                pathname === "/login"
                  ? "text-teal-300 bg-teal-400/10"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
              )}
            >
              Log In
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
