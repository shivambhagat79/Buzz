"use client";

import { UserContextProvider } from "@/utils/UserContext";
import Router from "@/utils/Router";

export default function Home() {
  return (
    <UserContextProvider>
      <Router />
    </UserContextProvider>
  );
}
