import { Outlet, ScrollRestoration } from "react-router-dom";

import { ConsentGate } from "@/components/auth/ConsentGate";
import { ProfileCompletionBanner } from "@/components/auth/ProfileCompletionBanner";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { MetricsTracker } from "./MetricsTracker";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <ProfileCompletionBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ConsentGate />
      <MetricsTracker />
      <ScrollRestoration />
    </div>
  );
}