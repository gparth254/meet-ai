"use client";

import { EnvChecker } from "@/components/env-checker";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VideoIcon, BotIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

export const HomeView = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 p-6 space-y-6">
      <EnvChecker />
      
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}!</h1>
          <p className="text-muted-foreground">Manage your meetings and AI agents</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <VideoIcon className="h-5 w-5" />
                Meetings
              </CardTitle>
              <CardDescription>
                Schedule and manage your meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/meetings">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Meeting
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BotIcon className="h-5 w-5" />
                Agents
              </CardTitle>
              <CardDescription>
                Create and manage AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/agents">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Agent
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


  



