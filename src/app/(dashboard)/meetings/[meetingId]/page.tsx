import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getQueryClient, caller } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MeetingIdView } from "@/modules/meetings/ui/views/meeting-id-view";
import { MeetingIdViewLoading, MeetingIdViewError } from "@/modules/meetings/ui/views/meeting-id-view";



interface Props {
    params: Promise<{
      meetingId: string;

    }>;
}


const page = async ({params}: Props) => {
    const {meetingId} = await params;
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session) {
        redirect("/sign-in");
    }

    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['meetings', 'getOne', { id: meetingId }],
        queryFn: () => caller.meetings.getOne({ id: meetingId }),
    });
    return(

        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<MeetingIdViewLoading />}>
         <ErrorBoundary fallback={<MeetingIdViewError />}>
         <MeetingIdView meetingId={meetingId} />
        </ErrorBoundary>
        </Suspense>
        </HydrationBoundary>
    );

}

export default page;