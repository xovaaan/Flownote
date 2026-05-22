"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Mic, Home, Plus, Search, Trash2, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Meetings", icon: Home },
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/dashboard/trash", label: "Trash", icon: Trash2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <aside className="w-64 bg-white border-r border-granola-200 flex flex-col h-full">
      <div className="p-5 flex items-center gap-2.5">
        <img src="/note.png" alt="Flownote" className="w-6 h-6 object-contain" />
        <span className="font-bold text-2xl tracking-tighter text-ink-950">Flownote</span>
      </div>
      <div className="px-4 pb-4">
        <Link href="/dashboard/meetings/new" className="flex items-center gap-2 bg-granola-800 text-granola-50 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-granola-900 transition-colors w-full">
          <Plus className="w-4 h-4" />New Meeting
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-granola-100 text-granola-900" : "text-ink-500 hover:bg-granola-50 hover:text-ink-800")}>
              <Icon className="w-4 h-4" />{item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-granola-200">
        <div className="flex items-center gap-3">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8 rounded-full" } }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-800 truncate">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</p>
            <p className="text-xs text-ink-400 truncate">Personal</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
