"use client";

import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import {Suspense} from "react";
import { ErrorBoundary } from "react-error-boundary";
import {AgentIdView} from "@/modules/agents/ui/views/agent-id-view"
import { makeQueryClient } from "@/trpc/query-client";
import { useEffect, useState } from "react";
import { AgentsIdViewLoading, AgentsIdViewError } from "@/modules/agents/ui/views/agent-id-view";

interface Props {
  params: Promise<{ agentId: string }>;
}

const Page = ({ params }: Props) => {
  const [isClient, setIsClient] = useState(false);
  const [agentId, setAgentId] = useState<string | null>(null);

  // Ensure this component only renders on the client side
  useEffect(() => {
    setIsClient(true);
    // Get params on client side
    params.then(({ agentId }) => setAgentId(agentId));
  }, [params]);

  // Don't render anything on the server side
  if (!isClient || !agentId) {
    return <div>Loading...</div>;
  }

  const queryClient = makeQueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<AgentsIdViewLoading />}>
        <ErrorBoundary fallback={<AgentsIdViewError />}>
          <AgentIdView agentId={agentId} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default Page;
