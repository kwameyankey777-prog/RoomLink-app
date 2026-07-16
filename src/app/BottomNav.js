"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

const tabs = [
  { href: "/", label: "Explore", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1E88E5" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ) },
  { href: "/map", label: "Map", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#1E88E5" : "none"} stroke={active ? "#1E88E5" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.5-7-11a7 7 0 0 1 14 0c0 4.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" fill={active ? "white" : "none"} />
    </svg>
  ) },
  { href: "/dashboard?tab=bookings", label: "Bookings", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1E88E5" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" fill={active ? "#1E88E5" : "none"} fillOpacity={active ? 0.12 : 0} />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  ) },
  { href: "/messages", label: "Messages", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#1E88E5" : "none"} stroke={active ? "#1E88E5" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ) },
  { href: "/dashboard", label: "Profile", icon: (active) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#1E88E5" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" fill={active ? "#1E88E5" : "none"} fillOpacity={active ? 0.12 : 0} />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ) },
];

export default function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      refreshUnreadCount(user.id);
    }
    init();
  }, []);

  async function refreshUnreadCount(uid) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", uid)
      .eq("read", false);
    setUnreadCount(count || 0);
  }

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`unread-messages-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => refreshUnreadCount(userId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

 useEffect(() => {
    if (pathname === "/messages" && userId) {
      const timeout = setTimeout(() => refreshUnreadCount(userId), 800);
      return () => clearTimeout(timeout);
    }
  }, [pathname, userId]);

  useEffect(() => {
    if (!userId) return;
    function handleRead() {
      refreshUnreadCount(userId);
    }
    window.addEventListener("roomlink:messages-read", handleRead);
    return () => window.removeEventListener("roomlink:messages-read", handleRead);
  }, [userId]);

  const hiddenRoutes = ["/login/student", "/login/owner", "/signup/student", "/signup/owner"];
  if (hiddenRoutes.includes(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      {tabs.map((tab) => {
        const [tabPath, tabQuery] = tab.href.split("?");
        const tabParam = tabQuery ? new URLSearchParams(tabQuery).get("tab") : null;
        const isActive = pathname === tabPath && currentTab === tabParam;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className="flex flex-col items-center justify-center gap-1 w-16 h-full relative"
          >
            <div
              className={`relative flex items-center justify-center w-10 h-8 rounded-full transition-all duration-200 ${
                isActive ? "bg-blue-50 scale-105" : "scale-100"
              }`}
            >
              {tab.icon(isActive)}
              {tab.label === "Messages" && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] leading-none transition-colors ${
                isActive ? "text-[#1E88E5] font-semibold" : "text-gray-400"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}