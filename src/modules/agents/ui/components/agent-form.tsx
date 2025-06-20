import { AgentGetOne } from "../../types";
import { useTRPC} from "@/trpc/client";
import {useQueryClient,useMutation} from "@tanstack/react-query";
import {useForm } from "react-hook-form";
import {z} from "zod";
import { agentsInsertSchema } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {Textarea} from "@/components/ui/textarea";
import { GeneratedAvatar } from "@/components/generated-avatar";
import {Input} from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {toast} from "sonner";


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  
} from "@/components/ui/form";






interface AgentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: AgentGetOne;
}

export const AgentForm = ({
   onSuccess,
    onCancel,
    initialValues,



}: AgentFormProps   ) => {
    const trpc = useTRPC();
    const queryClient =useQueryClient();

  const createdAgent = useMutation(
        trpc.agents.create.mutationOptions({
            onSuccess: () =>{
                queryClient.invalidateQueries(
                    trpc.agents.getMany.queryOptions({}),
                );
              if(initialValues?.id) {
                queryClient.invalidateQueries(
                    trpc.agents.getOne.queryOptions({ id: initialValues.id}),
                );
              }
              onSuccess?.();



            },
            onError: (error) => {
                toast.error(error.message);
            },
        }),
    );
    const form = useForm<z.infer<typeof agentsInsertSchema>>({
        resolver: zodResolver(agentsInsertSchema),
        defaultValues: {
            name: initialValues?.name ?? "",
            instructions:initialValues?.instructions ?? "",
        },

    });
const isEdit =!!initialValues?.id;
const isPending = createdAgent.isPending;

const onSubmit =(values: z.infer<typeof agentsInsertSchema>) =>{
    if(isEdit){
        console.log("TODO: updateAgent")
    }else{
        createdAgent.mutate(values);
    }
};



return (
     <Form {...form}>
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      <GeneratedAvatar
        seed={form.watch("name")}
        variant="botttsNeutral"
        className="border size-16"
      />
      <FormField
      name="name"
      control ={form.control}
      render={({field}) => (
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} placeholder="e.g. pragya😪" />
          </FormControl>
        </FormItem>
      )}
      />
       <FormField
      name="instructions"
      control ={form.control}
      render={({field}) => (
        <FormItem>
          <FormLabel>   Instructions</FormLabel>
          <FormControl>
            <Textarea {...field} placeholder="what you want in a virtual agent😊 " />
          </FormControl>
        </FormItem>
      )}
      />
      <div className="flex justify-between gap-x-2">
        {onCancel && (
            <Button
            variant="ghost"
            disabled={isPending}
            type="button"
            onClick={() => onCancel()}
            >
                cancel
            </Button>
        )}
        <Button disabled={isPending} type="submit">
            {isEdit ? "Update" : "Create"}
        </Button>
      </div>
      </form>
      </Form>
    

)

}
