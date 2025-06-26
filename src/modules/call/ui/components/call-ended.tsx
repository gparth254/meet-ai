import Link from "next/link";
import { CheckCircleIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const CallEnded = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                        <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Call Ended</CardTitle>
                    <CardDescription>
                        You have successfully left the call
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            📝 Meeting summary and recording will be available soon
                        </p>
                    </div>
                    <Button asChild className="w-full">
                        <Link href="/meetings" className="flex items-center justify-center gap-2">
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back to Meetings
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
    






