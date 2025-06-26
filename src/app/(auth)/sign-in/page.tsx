import { SignInView } from "@/modules/auth/ui/views/sign-in-view";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { testConnection } from "@/db";

const Page = async () => {
  try {
    // Test database connection first
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error("Database connection failed during sign-in page load");
      // Don't throw error, just show the sign-in page
      // The user will see the database error boundary if needed
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!!session) {
      redirect("/"); // redirect if session found
    }
    
    return <SignInView/>;
  } catch (error) {
    console.error("Error in sign-in page:", error);
    
    // If it's a database error, still show the sign-in page
    // The error boundary will handle it
    if (error instanceof Error && (
      error.message.includes('ECONNREFUSED') || 
      error.message.includes('database') ||
      error.message.includes('NeonDbError')
    )) {
      console.log("Database error detected, showing sign-in page anyway");
      return <SignInView/>;
    }
    
    // For other errors, re-throw
    throw error;
  }
};

export default Page;
