import { authClient } from "@/lib/auth-client";
import { ChevronDownIcon, CreditCardIcon, LogOutIcon } from "lucide-react";
import {
 DropdownMenu,
 DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

import { Avatar,AvatarImage } from "@radix-ui/react-avatar";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export const DashboardUserButton = () => {
   const router = useRouter();
   const [isClient, setIsClient] = useState(false);
   const isMobile = useIsMobile();
   const { data, isPending } = authClient.useSession();

   // Ensure this component only renders on the client side
   useEffect(() => {
     setIsClient(true);
   }, []);

   const onLogout = () => {
     authClient.signOut({
      fetchOptions: {
         onSuccess: () => {
            router.push("/sign-in");
         }
      }
     });
   }

   const onBilling = async () => {
     await authClient.signOut({
      fetchOptions: {
         onSuccess: () => {
            router.push("/billing");
         }
      }
     });
   }

   // Don't render anything on the server side or while loading
   if (!isClient || isPending || !data?.user) {
     return null;
   }

   if (!data || !data.user) {
     return null;
   }

   if (isMobile) {
     return (
       <Drawer>
         <DrawerTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2">
           <div className="flex items-center gap-3">
             {data.user.image ? (
               <Avatar className="size-9">
                 <AvatarImage src={data.user.image} alt={data.user.name || "User"} className="rounded-full" />
               </Avatar>
             ) : (
               <GeneratedAvatar
                 seed={data.user.name}
                 variant="initials"
                 className="size-9"
               />
             )}
             <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
               <p className="text-xs truncate w-full">{data.user.name}</p>
               <p className="text-xs truncate w-full">{data.user.email}</p>
             </div>
           </div>
           <ChevronDownIcon className="size-4 shrink-0" />
         </DrawerTrigger>
         <DrawerContent>
           <DrawerHeader>
             <DrawerTitle>
               {data.user.name}
             </DrawerTitle>
             <DrawerDescription>
               {data.user.email}
             </DrawerDescription>
           </DrawerHeader>
           <DrawerFooter>
             <Button
               variant="outline"
               onClick={()=>authClient.customer.portal()}
             >
               <CreditCardIcon className="size-4 text-black" />
               Billing
             </Button>
             <Button
               variant="outline"
               onClick={onLogout}
             >
               <LogOutIcon className="size-4 text-black" />
               Logout
             </Button>
           </DrawerFooter>
         </DrawerContent>
       </Drawer>
     );
   }

   return (
     <DropdownMenu>
       <DropdownMenuTrigger className="rounded-lg border border-border/10 p-3 w-full flex items-center justify-between bg-white/5 hover:bg-white/10 overflow-hidden gap-x-2">
         <div className="flex items-center gap-3">
           {data.user.image ? (
             <Avatar className="size-9">
               <AvatarImage src={data.user.image} alt={data.user.name || "User"} className="rounded-full" />
             </Avatar>
           ) : (
             <GeneratedAvatar
               seed={data.user.name}
               variant="initials"
               className="size-9"
             />
           )}
           <div className="flex flex-col gap-0.5 text-left overflow-hidden flex-1 min-w-0">
             <p className="text-xs truncate w-full">{data.user.name}</p>
             <p className="text-xs truncate w-full">{data.user.email}</p>
           </div>
         </div>
         <ChevronDownIcon className="size-4 shrink-0"/>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end" side="right" className="w-72">
         <DropdownMenuLabel>
           <div className="flex flex-col gap-1">
             <span className="font-medium truncate">
               {data.user.name}
             </span>
             <span className="text-sm font-normal text-muted-foreground truncate">{data.user.email}</span>
           </div>
         </DropdownMenuLabel>
         <DropdownMenuSeparator />
         <DropdownMenuItem
            onClick={()=>authClient.customer.portal()}
           className="cursor-pointer flex items-center justify-between">
           Billing
           <CreditCardIcon className="size-4" />
         </DropdownMenuItem>
         <DropdownMenuItem
           onClick={onLogout}
           className="cursor-pointer flex items-center justify-between">
           Logout
           <LogOutIcon className="size-4" />
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   );
};