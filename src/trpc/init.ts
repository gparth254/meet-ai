import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Define the context type
interface TRPCContext {
  session: any | null;
  userId: string | null;
}

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCContext = cache(async (): Promise<TRPCContext> => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    console.log('TRPC Context - Session:', session);
    console.log('TRPC Context - User ID:', session?.user?.id);
    
    return { 
      session,
      userId: session?.user?.id || null
    };
  } catch (error) {
    console.error('TRPC Context - Error getting session:', error);
    // Handle cases where session fetch fails (e.g., during SSR)
    return { 
      session: null,
      userId: null 
    };
  }
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ next, ctx }) => {
  if (!ctx.session) {
    console.error('Protected procedure called without session:', {
      session: ctx.session,
      userId: ctx.userId,
      headers: await headers()
    });
    
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource.",
    });
  }

  if (!ctx.session.user) {
    console.error('Protected procedure called with invalid session:', {
      session: ctx.session,
      userId: ctx.userId
    });
    
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid session. Please sign in again.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.session
    }
  });
});