import { auth } from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {getQueryClient, caller} from "@/trpc/server";
import {HydrationBoundary, dehydrate} from "@tanstack/react-query";
import { CallView } from "@/modules/call/ui/views/call-view";
import { testConnection } from "@/db";

interface Props {
  params: {
    meetingId: string;
  };
}

 const Page = async ({ params }: Props) => {
    const { meetingId } = await params;
    
    // Test database connection first
    try {
      const isConnected = await testConnection();
      if (!isConnected) {
        console.error("Database connection failed");
        throw new Error("Database connection failed");
      }
    } catch (error) {
      console.error("Database error:", error);
      throw new Error("Database connection failed");
    }
    
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      console.log("No session found, redirecting to sign-in");
      redirect("/sign-in");
    }

    if (!session.user) {
      console.log("Invalid session, redirecting to sign-in");
      redirect("/sign-in");
    }

    console.log("Call page - Session found:", {
      userId: session.user.id,
      userName: session.user.name,
      meetingId
    });

    const queryClient = getQueryClient();

    try {
      await queryClient.prefetchQuery({
        queryKey: ['meetings', 'getOne', { id: meetingId }],
        queryFn: () => caller.meetings.getOne({ id: meetingId }),
      });
    } catch (error) {
      console.error("Failed to prefetch meeting data:", error);
      throw new Error("Failed to load meeting data");
    }

    return (
      <HydrationBoundary state={dehydrate(queryClient)}>
        <CallView meetingId={meetingId} />
      </HydrationBoundary>
    );
};

export default Page;
