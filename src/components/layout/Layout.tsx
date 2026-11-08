import { Outlet, ScrollRestoration } from "react-router-dom";

import { ConsentGate } from "@/components/auth/ConsentGate";

import { Footer } from "./Footer";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ConsentGate />
      <ScrollRestoration />
    </div>
  );
}