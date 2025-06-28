import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { polarClient } from "@/lib/polar"
import { db } from "@/db"
import { count } from "drizzle-orm"
import { agents, meetings } from "@/db/schema"
import { eq } from "drizzle-orm"
import { MAX_FREE_AGENTS, MAX_FREE_MEETINGS } from "@/modules/premium/constants"

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

export const premiumProcedure = (entity: "meetings" | "agents") =>
  protectedProcedure.use(async ({ ctx, next }) => {
    const customer = await polarClient.customers.getStateExternal({
      externalId: ctx.auth.user.id,
    });

    // You can add custom logic here based on customer or entity
    const [userMeetings] = await db
    .select({
      count: count(meetings.id),
    })
    .from(meetings)
    .where(eq(meetings.userId, ctx.auth.user.id));
  
  const [userAgents] = await db
    .select({
      count: count(agents.id),
    })
    .from(agents)
    .where(eq(agents.userId, ctx.auth.user.id));
  

    const [userAgents] = await db
  .select({
    count: count(agents.id),
  })
  .from(agents)
  .where(eq(agents.userId, ctx.auth.user.id));

const isPremium = customer.activeSubscriptions.length > 0;
const isFreeAgentLimitReached = userAgents.count >= MAX_FREE_AGENTS;
const isFreeMeetingLimitReached = userMeetings.count >= MAX_FREE_MEETINGS;
const shouldThrowMeetingError =
  entity === "meetings" && isFreeMeetingLimitReached && !isPremium;

const shouldThrowAgentError =
  entity === "agents" && isFreeAgentLimitReached && !isPremium;

if (shouldThrowMeetingError) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "You have reached the maximum number of free meetings",
  });
}

if (shouldThrowAgentError) {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "You have reached the maximum number of free agents",
  });
}



return next({ctx:{...ctx,customer}});
   
  });


