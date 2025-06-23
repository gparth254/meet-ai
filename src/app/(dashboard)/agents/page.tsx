"use client";

import { AgentsViewError,AgentsView,AgentsViewLoading } from "@/modules/agents/ui/views/agents-view";
import { dehydrate,HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import {Suspense} from "react";
import {AgentsListHeader} from "@/modules/agents/ui/components/agents-list-header"
import { makeQueryClient } from "@/trpc/query-client";
import { SearchParams } from "nuqs";
import { useEffect, useState } from "react";

import { loadSearchParams } from "@/modules/agents/params";


interface   Props {
    searchParams:Promise<SearchParams>;
}
const Page = ({searchParams}: Props ) => {
    const [isClient, setIsClient] = useState(false);
    const [filters, setFilters] = useState<any>(null);

    // Ensure this component only renders on the client side
    useEffect(() => {
      setIsClient(true);
      // Load search params on client side
      loadSearchParams(searchParams).then(setFilters);
    }, [searchParams]);

    // Don't render anything on the server side
    if (!isClient || !filters) {
      return <div>Loading...</div>;
    }

    const queryClient = makeQueryClient();
    
    return (
        <>
        <AgentsListHeader/>
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<AgentsViewLoading />}>
                <ErrorBoundary fallback={<AgentsViewError />}>
                    <AgentsView />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
        </>
    );
};
export default Page;

