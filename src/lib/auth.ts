import { betterAuth } from "better-auth";
 import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { sql } from "drizzle-orm";

// Test database connection before initializing auth
const testDbConnection = async () => {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error("❌ Database connection failed during auth initialization:", error);
    return false;
  }
};

export const auth = betterAuth({
    socialProviders:{
       github: { 
            clientId: process.env.GITHUB_CLIENT_ID as string, 
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
        },
          google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    emailAndPassword: {
        enabled: true,
    },
     database: drizzleAdapter(db, {
        provider: "pg", // or "mysql", "sqlite"
        schema:{
            ...schema,
        },
    }),
    // Add better error handling
    onError: (error: any) => {
        console.error("Auth error:", error);
    },
});

// Export a function to check if auth is properly configured
export const checkAuthConfig = async () => {
    const dbConnected = await testDbConnection();
    if (!dbConnected) {
        console.error("❌ Auth configuration failed: Database not connected");
        return false;
    }
    
    console.log("✅ Auth configuration successful");
    return true;
};
