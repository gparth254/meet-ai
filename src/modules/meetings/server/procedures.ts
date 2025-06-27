import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {  meetings } from "@/db/schema";
import { db } from "@/db";
import {agents,user} from "@/db/schema";
import JSONL  from "jsonl-parse-stringify"

import { z } from "zod";
import { eq, count,and, getTableColumns, ilike,desc,sql,inArray } from "drizzle-orm";
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE} from "@/constants"
import { TRPCError } from "@trpc/server";
import { meetingsInsertSchema } from "../schemas";
import { meetingsUpdateSchema } from "../schemas";
import { MeetingStatus } from "../types";
import {generateAvatarUri} from "@/lib/avatar";
import {streamVideo} from "@/lib/stream-video";
import {StreamTranscriptItem} from "../types"
import {streamChat} from "@/lib/stream-chat";

export const meetingsRouter = createTRPCRouter({
  generateChatToken: protectedProcedure.mutation(async ({ ctx }) => {
    const token = streamChat.createToken(ctx.auth.user.id);
  
    await streamChat.upsertUser({
      id: ctx.auth.user.id,
      role: "admin",
    });
  
    return token;
  }),
  


  getTranscript: protectedProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(
        and(
          eq(meetings.id, input.id),
          eq(meetings.userId, ctx.auth.user.id)
        )
      );

if(!existingMeeting){
  throw new TRPCError({
    code:"NOT_FOUND",
    message:"Meeting not found",
  })
}


if(!existingMeeting.transcriptUrl){
  return [];

}

const transcript = await fetch(existingMeeting.transcriptUrl)
  .then((res) => res.text())
  .then((text) => JSON.parse<StreamTranscriptItem>(text))
  .catch(() => {
    return [];
  });

const speakerIds = [
  ...new Set(transcript.map((item) => item.speaker_id)),
];
const userSpeakers = await db
  .select()
  .from(user)
  .where(inArray(user.id, speakerIds ))
  .then((users) =>
    users.map((user) => ({
      ...user,
      image: user.image ?? generateAvatarUri({ seed: user.name, variant: "initials" }),
    }))
  );

  const agentSpeakers = await db
  .select()
  .from(agents)
  .where(inArray(agents.id, speakerIds ))
  .then((agents) =>
    agents.map((agent) => ({
      ...agent,
      image: generateAvatarUri({ seed: agent.name, variant: "botttsNeutral" }),
    }))
  );
const speakers = [...userSpeakers, ...agentSpeakers];

const transcriptWithSpeakers = transcript.map((item) => {
  const speaker = speakers.find(
    (speaker) => speaker.id === item.speaker_id
  );
  
});

if (!speaker) {
  return {
    ...item,
    user: {
      name: "Unknown",
      image: generateAvatarUri({ seed: "Unknown", variant: "initials" }),
    },
  };
}

return {
  ...item,
  user: {
    name: speaker.name,
    image: speaker.image,
  },
};







})   



return transcriptWithSpeakers;


  }),






 generateToken: protectedProcedure.mutation(async({ctx})=>{
  await streamVideo.upsertUsers([
    {
      id: ctx.auth.user.id,
      name: ctx.auth.user.name,
      role:"admin",
      image: 
         ctx.auth.user.image ??
         generateAvatarUri({seed:ctx.auth.user.name,variant:"initials"}),

    }
  ])
    const expirationTime = Math.floor(Date.now()/1000)+3600;
    const issuedAt = Math.floor(Date.now()/1000)-60;
    const token = streamVideo.generateUserToken({
      user_id: ctx.auth.user.id,
      exp: expirationTime,
      validity_in_seconds: issuedAt,
    })
    return token;
 }),
 





  remove: protectedProcedure.input(z.object({id: z.string()})).mutation(async ({ input, ctx }) => {
    const [removedMeeting] = await db
    .delete(meetings)
   
    .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)))
    .returning();
    if (!removedMeeting) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
    }
    return removedMeeting;
  }),




  update: protectedProcedure.input(meetingsUpdateSchema).mutation(async ({ input, ctx }) => {
    const [updatedMeeting] = await db
    .update(meetings)
    .set(input)
    .where(and(eq(meetings.id, input.id), eq(meetings.userId, ctx.auth.user.id)))
    .returning();
    if (!updatedMeeting) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Meeting not found" });
    }
    return updatedMeeting;
  }),























  create: protectedProcedure.input(meetingsInsertSchema).mutation(async ({ input, ctx }) => {
    if (!ctx.auth?.user) {
      throw new Error("Unauthorized");
    }
    
    console.log('Creating meeting with input:', input);
    console.log('User ID:', ctx.auth.user.id);
    
    const [createdMeeting] = await db
      .insert(meetings)
      .values({
        ...input,
        userId: ctx.auth.user.id,
      })
      .returning();
      
    console.log('meeting created:',createdMeeting);
    const call =streamVideo.video.call("default", createdMeeting.id);

    await call.create({
      data: {
        created_by_id: ctx.auth.user.id,
        custom: {
          meetingid: createdMeeting.id,
          meetingName: createdMeeting.name
        },
      
      settings_override: {
        transcription: {
          language: "en",
          mode: "auto-on",
          closed_caption_mode: "auto-on",
        },
        recording: {
          mode: "auto-on",
          quality: "1080p",
        
        },
      },
    }
    });

     const [existingAgent] = await db
     .select()
     .from(agents)
     .where(eq(agents.id, createdMeeting.agentId))

     if(!existingAgent){
      throw new TRPCError({
        code:"NOT_FOUND",
        message:"Agent not found",
      });
    }
    
    await streamVideo.upsertUsers([
      {
        id: existingAgent.id,
        name: existingAgent.name,
        role:"user",
        image: generateAvatarUri({seed:existingAgent.name,variant:"botttsNeutral"}),

      }
    ])







    return createdMeeting;
  }),

  

   





  
  
  getOne: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    if (!ctx.auth?.user) {
      throw new Error("Unauthorized");
    }
    const [existingMeeting] = await db
      .select({
      
        ...getTableColumns(meetings),
        agent: agents,
        duration: sql<number> `EXTRACT(EPOCH FROM (ended_at - started_at))`.as("duration"),
      })
      .from(meetings)
      .innerJoin(agents, eq(meetings.agentId, agents.id))
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
     search: z.string().nullish(),
     agentId: z.string().nullish(),
     status: z
        .enum([
          MeetingStatus.Upcoming,
          MeetingStatus.Active,
          MeetingStatus.Completed,
          MeetingStatus.Cancelled,
          MeetingStatus.Processing,

        ])
        .nullish(),
  }))
  .query(async ({ ctx,input }) => {
    const {search,page,pageSize,agentId,status } = input;
    if (!ctx.auth?.user) {
      throw new Error("Unauthorized");
    }
    
    console.log('getMany called with:', { search, page, pageSize, userId: ctx.auth.user.id });
    
    // Build the where condition
    const whereConditions = [eq(meetings.userId, ctx.auth.user.id)];
    
    // Only add search condition if search is provided and not "*" or empty
    if (search && search !== "*" && search.trim() !== "") {
      whereConditions.push(ilike(meetings.name, `%${search}%`));
    }
    
    console.log('Where conditions:', whereConditions);
    
    const data = await db
      .select({
        
        ...getTableColumns(meetings),
        agent: agents,
        duration: sql<number>`EXTRACT(EPOCH FROM (meetings.ended_at - meetings.started_at))`.as("duration"),


      })
      .from(meetings)
      .innerJoin(agents, eq(meetings.agentId, agents.id))
      .where(
        and(
          eq(meetings.userId, ctx.auth.user.id),
          search && search !== "*" && search.trim() !== "" ? ilike(meetings.name, `%${search}%`) : undefined,
          agentId ? eq(meetings.agentId, agentId) : undefined,
          status ? eq(meetings.status, status) : undefined,
        
        )
      )
      .orderBy(desc(meetings.createdAt), desc(meetings.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
      
    console.log('Query result data:', data);
      
    const [total] = await db
      .select({ count : count()})
      .from(meetings)
      .innerJoin(agents, eq(meetings.agentId, agents.id))
      .where(and(
        eq(meetings.userId, ctx.auth.user.id),
        search && search !== "*" && search.trim() !== "" ? ilike(meetings.name, `%${search}%`) : undefined,
        agentId ? eq(meetings.agentId, agentId) : undefined,
        status ? eq(meetings.status, status) : undefined,
      ));
      
    console.log('Total count:', total.count);
      
    const totalPages = Math.ceil(total.count/pageSize);
    return {
      items:data,
      total: total.count,
      totalPages,
    };
    
  }),
});