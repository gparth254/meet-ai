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
      console.log('Authentication error detected, redirecting to sign-in');
      router.push('/sign-in');
    }
  }, [error, router]);

  // Handle row clicks - navigate to agent details
  const handleRowClick = (agent: any) => {
    console.log('Agent clicked:', agent);
    router.push(`/agents/${agent.id}`);
  };

  // If there's an authentication error, show loading while redirecting
  if (error && error.message?.includes('You must be logged in')) {
    return <AgentsViewLoading />;
  }

  // If there's any other error, show error state
  if (error) {
    return (
      <ErrorState
        title="Failed to load agents"
        description={error.message || "An unexpected error occurred"}
      />
    );
  }

  // Show loading state while data is being fetched
  if (!data) {
    return <AgentsViewLoading />;
  }

  // Show empty state if no agents
  if (data.items.length === 0) {
    return (
      <EmptyState
        title="Create your first agent"
        description="Create an agent to join your meetings. Each agent will follow your instructions."
      />
    );
  }

  return (
    <div className="space-y-4">
      <DataTable 
        data={data.items} 
       columns={columns}
        onRowClicks={handleRowClick}
        />
      <DataPagination
       page={filters.page}
       totalPages={data.totalPages}
        onPageChange={(page) => setFilters({ ...filters, page })}
      />
    </div>
  );
};

export const AgentsViewLoading = () => {
  return (
        <LoadingState
      title="Loading Agents"
      description="This may take a few seconds"
        />
    );
};

export const AgentsViewError = () => {
    return (
        <ErrorState
      title="Failed to load agents"
      description="There was an error loading your agents. Please try again."
        />
  );
};
