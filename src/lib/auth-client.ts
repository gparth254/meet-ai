import { createAuthClient } from "better-auth/react"

const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (!baseURL) {
  console.warn("NEXT_PUBLIC_APP_URL is not set, using default localhost:3000");
}

export const authClient = createAuthClient({
  baseURL,
  // Add better error handling
  onError: (error) => {
    console.error("Auth client error:", error);
  },
  // Add session persistence
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});