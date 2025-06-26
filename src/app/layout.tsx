import type { Metadata } from "next";
import {  Inter } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider  } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next"
import { AuthProvider } from "@/components/auth-provider";
import { DatabaseErrorBoundary } from "@/components/database-error-boundary";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meet AI - AI-Powered Meeting Assistant",
  description: "Intelligent meeting assistant with AI agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NuqsAdapter>
      <TRPCReactProvider>
        <html lang="en">
          <body className={`${inter.variable} antialiased`}>
            <DatabaseErrorBoundary>
              <AuthProvider>
                <Toaster />
                {children}
              </AuthProvider>
            </DatabaseErrorBoundary>
          </body>
        </html>
      </TRPCReactProvider>
    </NuqsAdapter>
  );
}
