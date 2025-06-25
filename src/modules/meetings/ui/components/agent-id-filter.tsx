import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { CommandSelect } from "@/components/command-select";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";

export const AgentIdFilter = () => {
  const [filters, setFilters] = useMeetingsFilters();
  const trpc = useTRPC();
  const [agentSearch, setAgentSearch] = useState("");
  const {data:agents} = useQuery(
    trpc.agents.getMany.queryOptions({
        search: agentSearch,
        pageSize:100,
    }),

);
return(
    <CommandSelect
    className="h-9"
    placeholder="Select Agent"
    options={(agents?.items ?? []).map((agent)=>({
        id: agent.id,
        value: agent.id,
        children: (
            <div className="flex items-center gap-x-2">
                   <GeneratedAvatar
                   seed={agent.id}
                   variant="botttsNeutral"
                   className="size-10"
                      />
                      {agent.name}
                </div>

        )
    } ))}

   onSelect={(value)=>setFilters({agentId:value})}
   onSearch = {setAgentSearch}
   value={filters.agentId ?? ""}
    />

)

};
