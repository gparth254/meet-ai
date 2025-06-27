"use client";

import { CompletedState } from "../components/completed-state";
import { CancelledState } from "../components/cancelled-state";
import { MeetingIdViewHeader } from "../components/meeting-view-header";
import { LoadingState } from "@/components/loading-state";
import {useTRPC} from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/error-state";
import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UpcomingState } from "../components/upcoming-state";
import { useConfirm } from "@/hooks/use-confirm";
import { useState } from "react";
import { ProcessingState } from "../components/processing-state";
import { ActiveState } from "../components/active-state";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog ";
interface Props {
    meetingId: string;
  }
  
  export const MeetingIdView = ({ meetingId }: Props) => {
    const trpc = useTRPC();
    const router = useRouter();
    const queryClient = useQueryClient();
    const[UpdateMeetingDialogOpen,setUpdateMeetingDialogOpen] = useState(false);
    const[RemoveConfirmation,confirmRemove] = useConfirm(
        "Are you sure you want to remove this meeting?",
        "This action cannot be undone. The meeting will be permanently deleted."
    );
    const {data} = useSuspenseQuery(
        trpc.meetings.getOne.queryOptions({id: meetingId}),
    );
    
     const removeMeeting = useMutation(
        trpc.meetings.remove.mutationOptions({
            onSuccess:()=>{
                queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
                router.push("/meetings");
            },
            
        })
     );
      const handleRemove = async()=>{
       const ok = await confirmRemove();
       if(!ok){
        return;
       }
      await removeMeeting.mutateAsync({id: meetingId});
      }
const isActive = data.status === "active";
const isUpcoming = data.status === "upcoming";
const isCancelled = data.status === "cancelled";
const isCompleted = data.status === "completed";
const isProcessing = data.status === "processing";




    return (
        <>
        <RemoveConfirmation />
        <UpdateMeetingDialog
         open={UpdateMeetingDialogOpen}
         onOpenChange={setUpdateMeetingDialogOpen}
         initialValues={data}
        />
      <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
        <MeetingIdViewHeader
        meetingId={meetingId}
        meetingName={data.name}
        onEdit={()=>setUpdateMeetingDialogOpen(true)}
        onRemove={handleRemove}
        
        />
      {isCancelled && <CancelledState/>}
      {isCompleted && <CompletedState data={data}/>}
      {isProcessing && <ProcessingState/>}
      {isActive && <ActiveState meetingId={meetingId}/>}
      {isUpcoming && <UpcomingState 
       meetingId={meetingId}
       onCancelMeeting={()=>{}}
       isCancelling={false}
      
      
      
      />}
     
      </div>
      </>
    );
  };


  export const MeetingIdViewLoading =() =>{
    return (
        <LoadingState
        title="Loading Meeting"
        description="We are loading the meeting details for you."
        />
    );
};
export const MeetingIdViewError =()=>{
    return (
        <ErrorState
        title="Error Loading Meeting"
        description="We are unable to load the meeting details for you."
        />
    )
}
  