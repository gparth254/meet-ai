import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { HomeView } from "@/modules/home/ui/views/home-view"; // <-- Complete import path
import { redirect } from "next/navigation";


const Page = async () => {
  
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/sign-in"); // redirect if session not found
  }
  
  return <HomeView />;
};

export default Page;
