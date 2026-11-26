import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";

import { ConsentGate } from "@/components/auth/ConsentGate";
import { ProfileCompletionBanner } from "@/components/auth/ProfileCompletionBanner";
import { cn } from "@/utils/cn";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { MetricsTracker } from "./MetricsTracker";

export function Layout() {
  // O chat ocupa a tela toda (como o Messenger): altura fixa, sem rodapé, e só a lista de mensagens rola.
  const fullscreen = useLocation().pathname.startsWith("/mensagens");

  return (
    <div className={cn("flex flex-col", fullscreen ? "h-dvh overflow-hidden" : "min-h-screen")}>
      <Header />
      <ProfileCompletionBanner />
      <main className={cn("flex-1", fullscreen && "min-h-0")}>
        <Outlet />
      </main>
      {!fullscreen && <Footer />}
      <ConsentGate />
      <MetricsTracker />
      <ScrollRestoration />
    </div>
  );
}