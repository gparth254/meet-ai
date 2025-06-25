import { auth } from "@/lib/auth";
import {headers} from "next/headers";
import {redirect} from "next/navigation";
import {getQueryClient, caller} from "@/trpc/server";
import {HydrationBoundary, dehydrate} from "@tanstack/react-query";
import { CallView } from "@/modules/call/ui/views/call-view";

interface Props {
  params: {
    meetingid: string;
  };
}

 const Page = async ({ params }: Props) => {
    const { meetingid } =await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in");
  }



  const queryClient =  getQueryClient();

   void queryClient.prefetchQuery({
    queryKey: ['meetings', 'getOne', { id: meetingid }],
    queryFn: () => caller.meetings.getOne({ id: meetingid }),
   });

return (
     <HydrationBoundary state={dehydrate(queryClient)}>
    <CallView meetingId={meetingid} />


     </HydrationBoundary>

)
    

};
export default Page;
