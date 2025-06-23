"use client";

import { HomeView } from "@/modules/home/ui/views/home-view";
import { useEffect, useState } from "react";

const Page = () => {
  const [isClient, setIsClient] = useState(false);

  // Ensure this component only renders on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything on the server side
  if (!isClient) {
    return <div>Loading...</div>;
  }

  return <HomeView />;
};

export default Page;
