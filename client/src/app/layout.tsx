"use client";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/utils/cn";
import { UserContextProvider } from "@/utils/UserContext";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Buzz",
//   description: "A real time-chat application project",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <UserContextProvider>
      <html lang="en">
        <title>Buzz</title>
        <body className={cn(inter.className, "")}>{children}</body>
      </html>
    </UserContextProvider>
  );
}
