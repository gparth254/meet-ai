import { useTRPC} from "@/trpc/client";
import {useQueryClient,useMutation} from "@tanstack/react-query";
import {useForm } from "react-hook-form";
import {z} from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import {useQuery} from "@tanstack/react-query";

import {Input} from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {toast} from "sonner";
import {MeetingGetOne} from "../../types";
import {meetingsInsertSchema} from "../../schemas";
import {CommandSelect} from "@/components/command-select";
import {GeneratedAvatar} from "@/components/generated-avatar";
import {NewAgentDialog} from "@/modules/agents/ui/components/new-agent-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  
} from "@/components/ui/form";

import {useState} from "react";
import { LoaderIcon } from "lucide-react";




interface MeetingFormProps {
  onSuccess?: (id?: string) => void;
  onCancel?: () => void;
  initialValues?: MeetingGetOne;
}

export const MeetingForm = ({
   onSuccess,
    onCancel,
    initialValues,



}: MeetingFormProps   ) => {
    const trpc = useTRPC();
    const queryClient =useQueryClient();

    const [openNewAgentDialog, setOpenNewAgentDialog] = useState(false);
    const [agentSearch, setAgentSearch] = useState("");
    const agents = useQuery(
      trpc.agents.getMany.queryOptions({
        pageSize: 100,
        search: agentSearch,
      }),
    );
    

  const createdMeeting = useMutation(
        trpc.meetings.create.mutationOptions({
            onSuccess: (data) =>{
                console.log('Meeting created successfully:', data);
                
                // Invalidate all meetings queries to ensure the list updates
                queryClient.invalidateQueries({
                  queryKey: ['meetings']
                });
                
                // Also invalidate the specific getMany query with all possible filter combinations
                queryClient.invalidateQueries({
                  queryKey: ['meetings', 'getMany']
                });
                
                // Invalidate specific query patterns that might be cached
                queryClient.invalidateQueries({
                  predicate: (query) => {
                    return query.queryKey[0] === 'meetings' && 
                           query.queryKey[1] === 'getMany';
                  }
                });
                
              if(initialValues?.id) {
                queryClient.invalidateQueries(
                    trpc.meetings.getOne.queryOptions({ id: initialValues.id}),
                );
              }
              
              toast.success('Meeting created successfully!');
              onSuccess?.(data.id);
            },
            onError: (error) => {
                console.error('Error creating meeting:', error);
                toast.error(error.message);
            },
        }),
    );

    const updateMeeting = useMutation(
      trpc.meetings.update.mutationOptions({
          onSuccess: (data) =>{
              console.log('Meeting updated successfully:', data);
              
              // Invalidate all meetings queries to ensure the list updates
              queryClient.invalidateQueries({
                queryKey: ['meetings']
              });
              
              // Also invalidate the specific getMany query with all possible filter combinations
              queryClient.invalidateQueries({
                queryKey: ['meetings', 'getMany']
              });
              
              // Invalidate specific query patterns that might be cached
              queryClient.invalidateQueries({
                predicate: (query) => {
                  return query.queryKey[0] === 'meetings' && 
                         query.queryKey[1] === 'getMany';
                }
              });
              
            if(initialValues?.id) {
              queryClient.invalidateQueries(
                  trpc.meetings.getOne.queryOptions({ id: initialValues.id}),
              );
            }
            
            toast.success('Meeting updated successfully!');
            onSuccess?.();
          },
          onError: (error) => {
              console.error('Error updating meeting:', error);
              toast.error(error.message);
          },
      }),
  );
    const form = useForm<z.infer<typeof meetingsInsertSchema>>({
        resolver: zodResolver(meetingsInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            agentId: initialValues?.agentId ?? "",
        },
    });

    const isEdit = !!initialValues?.id;
    const isPending = createdMeeting.isPending || updateMeeting.isPending;

    const onSubmit = (values: z.infer<typeof meetingsInsertSchema>) => {
        if (isEdit) {
            updateMeeting.mutate({
                id: initialValues.id,
                ...values,
            });
        } else {
            createdMeeting.mutate(values);
        }
    };

    return (
        <>
            <NewAgentDialog open={openNewAgentDialog} onOpenChange={setOpenNewAgentDialog} />
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">Meeting Name</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        placeholder="e.g. Neet counselling, Job Interview, etc." 
                                        className="h-10"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Give your meeting a descriptive name
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    <FormField
                        name="agentId"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium">AI Agent</FormLabel>
                                <FormControl>
                                    <CommandSelect
                                        options={(agents.data?.items ?? []).map((agent) => ({
                                            id: agent.id,
                                            value: agent.id,
                                            children: (
                                                <div className="flex items-center gap-2">
                                                    <GeneratedAvatar seed={agent.name} variant="botttsNeutral" className="size-6" />
                                                    <span>{agent.name}</span>
                                                </div>
                                            )
                                        }))}
                                        onSelect={field.onChange}
                                        onSearch={setAgentSearch}
                                        value={field.value}
                                        placeholder="Select an AI agent for your meeting"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Choose an AI agent that will participate in your meeting
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="ml-2 mt-2 inline-flex items-center gap-2 border-dashed border-primary/50 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/70 transition-all duration-200"
                                        onClick={() => setOpenNewAgentDialog(true)}
                                    >
                                        <span className="text-sm font-medium">+</span>
                                        Create new agent
                                    </Button>
                                </FormDescription>
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-between gap-x-3 pt-4">
                        {onCancel && (
                            <Button
                                variant="outline"
                                disabled={isPending}
                                type="button"
                                onClick={() => onCancel()}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        )}
                        <Button 
                            disabled={isPending} 
                            type="submit"
                            className="flex-1"
                        >
                            {isPending ? (
                                <>
                                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                                    {isEdit ? "Updating..." : "Creating..."}
                                </>
                            ) : (
                                isEdit ? "Update Meeting" : "Create Meeting"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
