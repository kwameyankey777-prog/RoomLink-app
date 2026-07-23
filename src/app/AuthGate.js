"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../lib/AuthContext";
import SplashScreen from "./SplashScreen";

const PUBLIC_ROUTES = [
  "/welcome",
  "/login/student",
  "/login/owner",
  "/signup/student",
  "/signup/owner",
  "/forgot-password",
  "/reset-password",
];

const SPLASH_DURATION = 2200;

export default function AuthGate({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [splashDone, setSplashDone] = useState(false);
  const [splashChecked, setSplashChecked] = useState(false);

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  useEffect(() => {
    const alreadyPlayed = sessionStorage.getItem("hnalink_splash_played");
    if (alreadyPlayed) {
      setSplashDone(true);
      setSplashChecked(true);
    } else {
      const timer = setTimeout(() => {
        sessionStorage.setItem("hnalink_splash_played", "1");
        setSplashDone(true);
      }, SPLASH_DURATION);
      setSplashChecked(true);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (loading || !splashDone) return;
    if (!user && !isPublicRoute) {
      router.push("/welcome");
    }
  }, [loading, splashDone, user, isPublicRoute, router]);

  if (!splashChecked || !splashDone || loading) {
    return <SplashScreen />;
  }

  if (isPublicRoute) {
    return children;
  }

  if (!user) {
    return <SplashScreen />;
  }

  return children;
}