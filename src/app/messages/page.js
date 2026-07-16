"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

const AVATAR_COLORS = [
  "bg-[#1E88E5]", "bg-[#1565C0]", "bg-[#0D47A1]",
  "bg-[#5E35B1]", "bg-[#00897B]", "bg-[#546E7A]",
];

function colorForId(id) {
  let hash = 0;
  for (let i = 0; i < (id || "").length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase();
}

function relativeTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dateLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
}

function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login/student");
        return;
      }
      setUser(user);

      const targetUserId = searchParams.get("to");
      const hostelId = searchParams.get("hostel");
      if (targetUserId) {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("id", targetUserId)
          .single();
        if (error) console.error("Failed to load target profile:", error.message);
        if (profile) {
          setActiveConvo({ userId: profile.id, name: profile.full_name, avatarUrl: profile.avatar_url, hostelId });
        }
      }

      setLoading(false);
    }
    init();
  }, [router, searchParams]);

  useEffect(() => {
    async function loadConversations() {
      if (!user) return;
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      const otherUserIds = new Set();
      (data || []).forEach((msg) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        otherUserIds.add(otherId);
      });

      let profilesById = {};
      if (otherUserIds.size > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", Array.from(otherUserIds));
        (profilesData || []).forEach((p) => { profilesById[p.id] = p; });
      }

      const convoMap = new Map();
      (data || []).forEach((msg) => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const otherProfile = profilesById[otherId];
        if (!otherProfile) return;
        if (!convoMap.has(otherId)) {
          convoMap.set(otherId, {
            userId: otherId,
            name: otherProfile.full_name,
            avatarUrl: otherProfile.avatar_url,
            lastMessage: msg.content,
            lastTime: msg.created_at,
            unread: !msg.read && msg.receiver_id === user.id,
          });
        }
      });
      setConversations(Array.from(convoMap.values()));
    }
    loadConversations();
  }, [user, messages]);

 useEffect(() => {
    async function loadThread() {
      if (!user || !activeConvo) return;
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeConvo.userId}),and(sender_id.eq.${activeConvo.userId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true });
      setMessages(data || []);

     await supabase
        .from("messages")
        .update({ read: true })
        .eq("sender_id", activeConvo.userId)
        .eq("receiver_id", user.id)
        .eq("read", false);

      window.dispatchEvent(new Event("roomlink:messages-read"));
    }
    loadThread();
  }, [user, activeConvo]);

  useEffect(() => {
    if (!user || !activeConvo) return;

    const channel = supabase
      .channel(`messages-${user.id}-${activeConvo.userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new;
          const isRelevant =
            (msg.sender_id === user.id && msg.receiver_id === activeConvo.userId) ||
            (msg.sender_id === activeConvo.userId && msg.receiver_id === user.id);
          if (isRelevant) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo || sending) return;
    setSending(true);

    const { error } = await supabase.from("messages").insert([{
      sender_id: user.id,
      receiver_id: activeConvo.userId,
      hostel_id: activeConvo.hostelId || null,
      content: newMessage.trim(),
    }]);

    setSending(false);
    if (error) {
      console.error("Failed to send message:", error.message);
    } else {
      setNewMessage("");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row max-w-5xl mx-auto animate-pulse">
        <aside className="md:w-72 border-r border-gray-200 bg-white p-4 space-y-4">
          <div className="h-6 w-28 bg-gray-200 rounded" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 bg-gray-200 rounded" />
                <div className="h-2.5 w-1/2 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </aside>
        <main className="flex-1" />
      </div>
    );
  }

  // Build grouped message list with date separators
  const groups = [];
  messages.forEach((msg) => {
    const label = dateLabel(msg.created_at);
    let group = groups[groups.length - 1];
    if (!group || group.label !== label) {
      group = { label, items: [] };
      groups.push(group);
    }
    group.items.push(msg);
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row max-w-5xl mx-auto">
      <aside className={`md:w-72 border-r border-gray-200 bg-white flex flex-col ${activeConvo ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>

        {conversations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium text-sm mb-1">No conversations yet</p>
            <p className="text-gray-400 text-xs">Messages you start from a hostel page will show up here.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {conversations.map((convo) => (
              <button
                key={convo.userId}
                onClick={() => setActiveConvo(convo)}
                className={`w-full text-left p-4 flex items-center gap-3 border-l-4 transition-colors ${
                  activeConvo?.userId === convo.userId
                    ? "border-[#1E88E5] bg-blue-50/60"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <div className={`w-10 h-10 shrink-0 rounded-full ${colorForId(convo.userId)} text-white flex items-center justify-center text-sm font-semibold overflow-hidden`}>
                  {convo.avatarUrl ? (
                    <img src={convo.avatarUrl} alt={convo.name} className="w-full h-full object-cover" />
                  ) : (
                    initials(convo.name)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{convo.name}</p>
                    <span className="text-[11px] text-gray-400 shrink-0">{relativeTime(convo.lastTime)}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{convo.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col">
        {!activeConvo ? (
          <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1E88E5" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium mb-1">Select a conversation</p>
            <p className="text-gray-400 text-sm">Choose someone from the list to view your chat.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3">
              <button onClick={() => setActiveConvo(null)} className="md:hidden text-[#1E88E5] text-xl leading-none">‹</button>
              <div className={`w-9 h-9 shrink-0 rounded-full ${colorForId(activeConvo.userId)} text-white flex items-center justify-center text-xs font-semibold overflow-hidden`}>
                {activeConvo.avatarUrl ? (
                  <img src={activeConvo.avatarUrl} alt={activeConvo.name} className="w-full h-full object-cover" />
                ) : (
                  initials(activeConvo.name)
                )}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{activeConvo.name}</p>
                {activeConvo.hostelId && (
                  <span className="inline-block text-[11px] text-[#1E88E5] bg-blue-50 rounded-full px-2 py-0.5 mt-0.5">
                    About this listing
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50">
              {groups.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-6">
                  <p className="text-gray-500 text-sm font-medium mb-1">Say hello to {activeConvo.name.split(" ")[0]}</p>
                  <p className="text-gray-400 text-xs">Your conversation will appear here.</p>
                </div>
              ) : (
                groups.map((group, gi) => (
                  <div key={gi}>
                    <div className="flex justify-center my-4">
                      <span className="text-[11px] text-gray-400 bg-gray-100 rounded-full px-3 py-1">{group.label}</span>
                    </div>
                    {group.items.map((msg, i) => {
                      const isMine = msg.sender_id === user.id;
                      const prev = group.items[i - 1];
                      const showTime = !prev || (new Date(msg.created_at) - new Date(prev.created_at)) > 5 * 60 * 1000;
                      return (
                        <div key={msg.id} className={`flex flex-col mb-1 ${isMine ? "items-end" : "items-start"}`}>
                          {showTime && (
                            <span className="text-[10px] text-gray-400 mb-1 px-1">{timeLabel(msg.created_at)}</span>
                          )}
                          <div
                            className={`max-w-xs px-4 py-2 text-sm shadow-sm ${
                              isMine
                                ? "bg-[#1E88E5] text-white rounded-2xl rounded-br-sm"
                                : "bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-bl-sm"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 border-t border-gray-200 bg-white flex items-center gap-2">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#1E88E5]"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="shrink-0 w-10 h-10 rounded-full bg-[#1E88E5] text-white flex items-center justify-center hover:bg-[#1565C0] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}