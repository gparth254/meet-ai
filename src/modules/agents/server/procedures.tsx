import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agents } from "@/db/schema";
import { db } from "@/db";
import { agentsInsertSchema } from "../schemas";
import { z } from "zod";
import { eq, count,and, getTableColumns, sql,ilike,desc } from "drizzle-orm";
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE} from "@/constants"
import { TRPCError } from "@trpc/server";

export const agentsRouter = createTRPCRouter({
  // Add a test procedure to check database connection
  test: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.auth?.user) {
      throw new Error("Unauthorized");
    }
    
    console.log('Testing database connection...');
    
    // Test basic query
    const allAgents = await db.select().from(agents);
    console.log('All agents in database:', allAgents);
    
    // Test user-specific query
    const userAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, ctx.auth.user.id));
    console.log('User agents:', userAgents);
    
    return { allAgents, userAgents };
  }),
  
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    if (!ctx.auth?.user) {
      throw new Error("Unauthorized");
    }
    const [existingAgent] = await db
      .select({
        meetingCount: sql<number>`5`,
        ...getTableColumns(agents),
      })
      .from(agents)
      .where(
        and(
          eq(agents.id, input.id),
          eq(agents.userId, ctx.auth.user.id),
        )
      );

    if (!existingAgent) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
    }

    return existingAgent;
  }),
  getMany: protectedProcedure
  .input(z.object({
     page: z.number().default(  DEFAULT_PAGE),
     pageSize: z
     .number()
     .min(MIN_PAGE_SIZE)
     .max(MAX_PAGE_SIZE)
     .default(DEFAULT_PAGE_SIZE),
     search: z.string().nullish()
  }))
  .query(async ({ ctx,input }) => {
    const {search,page,pageSize } = input;
    if (!ctx.auth?.user) {
      throw new Error("Unauthorized");
    }
    
    console.log('getMany called with:', { search, page, pageSize, userId: ctx.auth.user.id });
    
    // Build the where condition
    const whereConditions = [eq(agents.userId, ctx.auth.user.id)];
    
    // Only add search condition if search is provided and not "*"
    if (search && search !== "*") {
      whereConditions.push(ilike(agents.name, `%${search}%`));
    }
    
    console.log('Where conditions:', whereConditions);
    
    const data = await db
      .select({
        meetingCount: sql<number>`6`,
        ...getTableColumns(agents),
      })
      .from(agents)
      .where(and(...whereConditions))
      .orderBy(desc(agents.createdAt), desc(agents.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
      
    console.log('Query result data:', data);
      
    const [total] = await db
      .select({ count : count()})
      .from(agents)
      .where(and(...whereConditions));
      
    console.log('Total count:', total.count);
      
    const totalPages = Math.ceil(total.count/pageSize);
    return {
      items:data,
      total: total.count,
      totalPages,
    };
    
  }),
  create: protectedProcedure.input(agentsInsertSchema).mutation(async ({ input, ctx }) => {
    if (!ctx.auth?.user) {
      throw new Error("Unauthorized");
    }
    
    console.log('Creating agent with input:', input);
    console.log('User ID:', ctx.auth.user.id);
    
    const [createdAgent] = await db
      .insert(agents)
      .values({
        ...input,
        userId: ctx.auth.user.id,
      })
      .returning();
      
    console.log('Agent created:', createdAgent);
    return createdAgent;
  }),
});