import { MeetingsView, MeetingsViewLoading, MeetingsViewError } from "@/modules/meetings/ui/views/meetings-view";
import { getQueryClient, caller } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Page = async () => {
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['meetings', 'getMany'],
        queryFn: () => caller.meetings.getMany({})
    });
    return(
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<MeetingsViewLoading />}>
                <ErrorBoundary  fallback={<MeetingsViewError />}>
            <MeetingsView />
            
            </ErrorBoundary>
            </Suspense>
           
        </HydrationBoundary>
        
    );
};


export default Page;