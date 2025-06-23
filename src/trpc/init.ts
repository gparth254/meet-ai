import { initTRPC,  TRPCError } from '@trpc/server';
import { cache } from 'react';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// Define the context type
interface TRPCContext {
  session: any | null;
  userId: string | null;
}

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
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  // transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;


export const protectedProcedure = baseProcedure.use(async ({ next, ctx }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: ctx.session
    }
  });
});