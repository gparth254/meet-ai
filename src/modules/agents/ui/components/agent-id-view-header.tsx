import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,

    BreadcrumbList,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { ChevronRightIcon,TrashIcon,PencilIcon,MoreVerticalIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";




interface Props {
    agentId: string;
    agentName: string;
    onEdit: () => void;
    onRemove: () => void;
}


export const AgentIdViewHeader = ({
     agentId,
      agentName,
       onEdit,
        onRemove 
    }: Props) => {
        return (

            <div className="flex items-center justify-between">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="font-medium text-xl">
                            <Link href="/agents">
                            my Agents
                            </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="text-foreground text-xl font-medium [&>svg]:size-4 ">
                        <ChevronRightIcon />
                        </BreadcrumbSeparator>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild className="font-medium text-xl text-foreground">
                            <Link href={`/agents/${agentId}`}>
                           {agentName}
                            </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {/* modal false is used to prevent the dropdown menu from closing when clicking outside of it */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVerticalIcon className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                   <DropdownMenuItem onClick={onEdit}>
                    <PencilIcon className="size-4 text-black" />
                    Edit

                   </DropdownMenuItem>
                   <DropdownMenuItem onClick={onRemove}>
                    <TrashIcon className="size-4 text-black" />
                    Delete

                   </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
        )
 




    };