import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {  meetings } from "@/db/schema";
import { db } from "@/db";

import { z } from "zod";
import { eq, count,and, getTableColumns, ilike,desc } from "drizzle-orm";
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE} from "@/constants"
import { TRPCError } from "@trpc/server";

export const meetingsRouter = createTRPCRouter({
   





  
  
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    if (!ctx.auth?.user) {
      throw new Error("Unauthorized");
    }
    const [existingMeeting] = await db
      .select({
      
        ...getTableColumns(meetings),
      })
      .from(meetings)
      .where(
        and(
          eq(meetings.id, input.id),
          eq(meetings.userId, ctx.auth.user.id),
        )
      );

    if (!existingMeeting) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
    }

    return existingMeeting;
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
    const whereConditions = [eq(meetings.userId, ctx.auth.user.id)];
    
    // Only add search condition if search is provided and not "*"
    if (search && search !== "*") {
      whereConditions.push(ilike(meetings.name, `%${search}%`));
    }
    
    console.log('Where conditions:', whereConditions);
    
    const data = await db
      .select({
        
        ...getTableColumns(meetings),
      })
      .from(meetings)
      .where(and(...whereConditions))
      .orderBy(desc(meetings.createdAt), desc(meetings.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
      
    console.log('Query result data:', data);
      
    const [total] = await db
      .select({ count : count()})
      .from(meetings)
      .where(and(...whereConditions));
      
    console.log('Total count:', total.count);
      
    const totalPages = Math.ceil(total.count/pageSize);
    return {
      items:data,
      total: total.count,
      totalPages,
    };
    
  }),
});