import { useState } from "react";
import { StreamTheme, useCall } from "@stream-io/video-react-sdk";
import { CallLobby } from "./call-lobby";
import { CallActive } from "./call-active";
import { CallEnded } from "./call-ended";
import { ErrorState } from "@/components/error-state";

interface Props {
  meetingName: string;
  agent: any;
}

export const CallUI = ({ meetingName, agent }: Props) => {
  const call = useCall();
  const [show, setShow] = useState<"lobby" | "call" | "ended">("lobby");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    if (!call || isJoining) return;
    
    try {
      setIsJoining(true);
      setError(null);
      
      // Check if call is already joined or joining
      if (call.state.callingState !== 'idle' && call.state.callingState !== 'unknown') {
        console.log('Call already joined or in progress, switching to call view');
        setShow("call");
        return;
      }
      
      // Join the call (devices are managed manually in lobby)
      await call.join();
      setShow("call");
    } catch (error: any) {
      console.error("Failed to join call:", error);
      
      // Handle specific permission errors
      if (error?.message?.includes('getUserMedia') || error?.message?.includes('permission') || error?.message?.includes('device not found')) {
        setError("Camera or microphone access is required. Please allow permissions and try again.");
      } else if (error?.message?.includes('network') || error?.message?.includes('connection')) {
        setError("Network connection issue. Please check your internet and try again.");
      } else if (error?.message?.includes('shall be called only once')) {
        // If call is already joined, just switch to call view
        setShow("call");
        return;
      } else {
        setError("Failed to join the call. Please try again.");
      }
      // Stay in lobby if join fails
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = () => {
    if (!call) return;
    try {
      call.endCall();
      setShow("ended");
    } catch (error) {
      console.error("Failed to end call:", error);
      setShow("ended");
    }
  };

  // Show error state if there's an error
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="text-center">
          <ErrorState
            title="Connection Error"
            description={error}
          />
          <button
            onClick={() => {
              setError(null);
              setShow("lobby");
            }}
            className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <StreamTheme className="h-full">
      {show === "lobby" && <CallLobby onJoin={handleJoin} isJoining={isJoining} />}
      {show === "call" && <CallActive onLeave={handleLeave} meetingName={meetingName} agent={agent} />}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  );
};
