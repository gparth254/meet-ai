import { MeetingsView, MeetingsViewLoading, MeetingsViewError } from "@/modules/meetings/ui/views/meetings-view";
import { getQueryClient, caller } from "@/trpc/server";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { MeetingsListHeader } from "@/modules/meetings/ui/components/meetings-list-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {loadSearchParams} from "@/modules/meetings/params";
import { SearchParams } from "nuqs/server";

interface props {
    searchParams: Promise<SearchParams>;
}

const Page = async ({searchParams}:props) => {
    const filters = await loadSearchParams(searchParams);
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if(!session){
        redirect("/sign-in");
    }
    
    const queryClient = getQueryClient();
    
    // Prefetch the meetings data using the server-side caller
    await queryClient.prefetchQuery({
        queryKey: ['meetings', 'getMany', filters],
        queryFn: () => caller.meetings.getMany(filters),
    });

    return(
        <>
        <MeetingsListHeader />
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<MeetingsViewLoading />}>
                <ErrorBoundary  fallback={<MeetingsViewError />}>
            <MeetingsView />
            
            </ErrorBoundary>
            </Suspense>
           
        </HydrationBoundary>
        </>
        
    );
};

export default Page;