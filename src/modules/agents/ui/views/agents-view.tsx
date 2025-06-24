"use client";

import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { DataTable } from "@/components/data-table";
import { columns }  from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useAgentsFilters } from "../../hooks/use-agents-filters";
import { DataPagination } from "../components/data-pagination";
import {useRouter} from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export const AgentsView = () => {
  const router = useRouter();
  const [filters,setFilters] = useAgentsFilters();
  const trpc = useTRPC();

  console.log('AgentsView filters:', filters);

  const { data, error } = useSuspenseQuery(trpc.agents.getMany.queryOptions({
    ...filters,
  }));

  // Test query to check database
  const { data: testData, refetch: refetchTest } = useQuery(trpc.agents.test.queryOptions());

  console.log('AgentsView data:', data);
  console.log('Test data:', testData);

  // Handle authentication errors
  useEffect(() => {
    if (error && error.message?.includes('You must be logged in')) {
      router.push('/sign-in');
    }
  }, [error, router]);

  // If there's an authentication error, show loading while redirecting
  if (error && error.message?.includes('You must be logged in')) {
    return <AgentsViewLoading />;
  }

  return (
    <div className="flex-1 pb-4  px-4 md:px-8 flex flex-col gap-y-4">
     
    
      <DataTable data={data.items}
       columns={columns}
       onRowClicks={(row) => router.push(`/agents/${row.id}`)}
        />

      <DataPagination
       page={filters.page}
       totalPages={data.totalPages}
       onPageChange={(page)=> setFilters({page})}
      />

      {data.items.length === 0 && (
        <EmptyState
        title="Create your first agent"
        description="Create an agent to join your meetings,Each agent will follow your instruction" />
      )}
    </div>
  );
};

export const AgentsViewLoading = () => {
    return(
        <LoadingState
        title ="Loading Agents" description="This may take a seconds"
        />
    );
};

export const AgentsViewError = () =>{
    return (
        <ErrorState
          title="Error Loading Agents"
          description="Something went wrong"
        />
    )
}
