import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agents } from "@/db/schema";
import { db } from "@/db";
import { agentsInsertSchema } from "../schemas";
import { z } from "zod";
import { eq, count,and, getTableColumns, sql,ilike,desc } from "drizzle-orm";
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE} from "@/constants"


export const agentsRouter = createTRPCRouter({
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
          eq(agents.userId, ctx.auth.user.id)
        )
      );

    if (!existingAgent) {
      throw new Error("Not found or unauthorized");
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
    const data = await db
      .select({
        meetingCount: sql<number>`6`,
        ...getTableColumns(agents),
      })
      .from(agents)
      .where(and(eq(agents.userId, ctx.auth.user.id),
               search ? ilike(agents.name,`%${search}%`) : undefined,        
    ))
    .orderBy(desc(agents.createdAt), desc(agents.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize)
    const [total] = await db
      .select({ count : count()})
      .from(agents)
      .where(
        and(
          eq(agents.userId,ctx.auth.user.id),
        search ? ilike(agents.name,`%${search}%`) : undefined,
        )
      );
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
    const [createdAgent] = await db
      .insert(agents)
      .values({
        ...input,
        userId: ctx.auth.user.id,
      })
      .returning();
    return createdAgent;
  }),
});