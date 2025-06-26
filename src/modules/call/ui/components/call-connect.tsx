"use client"

import {CallUI} from "./call-ui";
import {
Call,
CallingState,
StreamCall,
StreamVideo,
StreamVideoClient,
} from "@stream-io/video-react-sdk";
import {useEffect,useState} from "react";
import {LoaderIcon, AlertCircleIcon} from "lucide-react";
import {useTRPC} from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {useMutation} from "@tanstack/react-query";
interface Props {
    meetingId: string;
    meetingName: string;
    userId: string;
    userName: string;
    userImage: string;
    agent: any;
  }
  
  export const CallConnect = ({
    meetingId,
    meetingName,
    userId,
    userName,
    userImage,
    agent,
  }: Props) => {
    const trpc = useTRPC();
    const [error, setError] = useState<string | null>(null);

const { mutateAsync: generateToken } = useMutation(
  trpc.meetings.generateToken.mutationOptions()
);

const [client, setClient] = useState<StreamVideoClient>();

useEffect(() => {
  try {
    const _client = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
      user: {
        id: userId,
        name: userName,
        image: userImage,
      },
      tokenProvider: generateToken,
    });
    setClient(_client);

    return () => {
      _client.disconnectUser();
      setClient(undefined);
    };
  } catch (err) {
    console.error('Failed to create Stream Video client:', err);
    setError('Failed to initialize video client. Please refresh the page.');
  }
  
  
}, [userId,userName,userImage,generateToken]);
const [call, setCall] = useState<Call>();

useEffect(() => {
  if (!client) return;

  try {
    const _call = client.call("default", meetingId);
    
    // Configure call with manual device control
    // Disable devices immediately to prevent automatic access
    _call.camera.disable();
    _call.microphone.disable();
    
    setCall(_call);

    return () => {
      if (_call.state.callingState !== CallingState.LEFT) {
        _call.leave();
        _call.endCall();
        setCall(undefined);
      }
    };
  } catch (err) {
    console.error('Failed to create call:', err);
    setError('Failed to create call. Please try again.');
  }
}, [client, meetingId]);

if (error) {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center max-w-md">
        <Alert>
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
        >
          Refresh Page
        </Button>
      </div>
    </div>
  );
}

if (!client || !call) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <LoaderIcon className="size-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Connecting to call...</p>
        </div>
      </div>
    );
  }
  

   
  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <CallUI  meetingName={meetingName} agent={agent}/>
      </StreamCall>
    </StreamVideo>
  );
};
  