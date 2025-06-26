"use client";

import {CallProvider} from "../components/call-provider";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import {ErrorState} from "@/components/error-state";
interface Props {
  meetingId: string;
}

export const CallView = ({ meetingId }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );
  if(data.status === "completed"){
    return (
         <div className ="flex h-screen items-center justify-center">
            <ErrorState 
             title="Meeting Completed"
             description="Meeting was completed successfully"
            />
         </div>
    )
  }
  return  <CallProvider meetingId={meetingId} meetingName={data.name} agent={data.agent} />;
};
