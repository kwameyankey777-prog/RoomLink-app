"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../lib/AuthContext";

const PUBLIC_ROUTES = [
  "/welcome",
  "/login/student",
  "/login/owner",
  "/signup/student",
  "/signup/owner",
  "/forgot-password",
  "/reset-password",
];

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublicRoute) {
      router.push("/welcome");
    }
  }, [loading, user, isPublicRoute, router]);

  if (isPublicRoute) {
    return children;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return children;
}