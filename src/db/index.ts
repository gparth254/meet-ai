import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is not set");
  console.error("Please add DATABASE_URL to your .env.local file");
  console.error("Example: DATABASE_URL=\"postgresql://username:password@localhost:5432/meet_ai\"");
  throw new Error("DATABASE_URL environment variable is not set");
}

// Validate DATABASE_URL format
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.error("❌ Invalid DATABASE_URL format");
  console.error("DATABASE_URL should start with 'postgresql://' or 'postgres://'");
  throw new Error("Invalid DATABASE_URL format");
}

console.log("🔗 Connecting to database...");

export const db = drizzle(dbUrl);

// Test database connection
export const testConnection = async () => {
  try {
    console.log("🧪 Testing database connection...");
    // Simple query to test connection
    await db.execute(sql`SELECT 1`);
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error("💡 Database server is not running or not accessible");
        console.error("💡 Please ensure PostgreSQL is running on your machine");
        console.error("💡 Or use a cloud database like Neon, Supabase, or Railway");
      } else if (error.message.includes('authentication failed')) {
        console.error("💡 Database authentication failed");
        console.error("💡 Please check your DATABASE_URL username and password");
      } else if (error.message.includes('database') && error.message.includes('does not exist')) {
        console.error("💡 Database does not exist");
        console.error("💡 Please create the database first");
      }
    }
    
    return false;
  }
};

// Initialize database connection
export const initDatabase = async () => {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error("❌ Failed to connect to database");
    console.error("💡 Please check your DATABASE_URL and ensure the database is running");
    return false;
  }
  return true;
};
