"use client"

 import { useTRPC } from "@/trpc/client";
 import { useSuspenseQuery } from "@tanstack/react-query";
 import { useRouter } from "next/navigation";
 import { useEffect } from "react";
 import { LoadingState  } from "@/components/loading-state";
 import { ErrorState } from "@/components/error-state";
 import { AgentIdViewHeader } from "../components/agent-id-view-header";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { VideoIcon } from "lucide-react";



 interface Props {
   agentId: string;
 }

 export const AgentIdView = ({ agentId }: Props) => {
 
  const trpc = useTRPC();
  const router = useRouter();
  const { data, error } = useSuspenseQuery(trpc.agents.getOne.queryOptions({ id: agentId }));

  // Handle authentication errors
  useEffect(() => {
    if (error && error.message?.includes('You must be logged in')) {
      router.push('/sign-in');
    }
  }, [error, router]);

  // If there's an authentication error, show loading while redirecting
  if (error && error.message?.includes('You must be logged in')) {
    return <div>Loading...</div>;
  }

   return (
     <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
          <AgentIdViewHeader
          agentId={agentId}
          agentName={data.name}
          onEdit={() => {}}
          onRemove={() => {}}
          
          />
          <div className="bg-white rounded-lg border">
            <div className="px-4 py-5 gap-y-5 flex flex-col col-span-2">
               <div className="flex items-center gap-x-3">
                <GeneratedAvatar
                variant="botttsNeutral"
                seed={data.id}
                className="size-10"
                />
                <h2 className="text-2xl font-medium">{data.name}</h2>
               </div>
               <Badge
               variant="outline"
               className="flex items-center gap-x-2 [&>svg]:size-4"
               >
                <VideoIcon className= "text-blue-700" />
                {data.meetingCount} {data.meetingCount === 1 ? "Meeting" : "Meetings"}
               </Badge>
               <div className="flex flex-col gap-x-2">
                <p  className="text-lg font-medium">Instructions</p>
                <p className="text-neutral-800">{data.instructions}</p>
               </div>
            </div>
          </div>
     </div>
  );
 };

 export const AgentsIdViewLoading = () => {
  return(
      <LoadingState
      title ="Loading Agents" description="This may take a seconds"
      />
  );
};

export const AgentsIdViewError = () =>{
  return (
      <ErrorState
        title="Error Loading Agents"
        description="Something went wrong"
      />
  )
}

