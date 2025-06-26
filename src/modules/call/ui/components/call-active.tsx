import { Button } from "@/components/ui/button";
import { useCall } from "@stream-io/video-react-sdk";
import { LogOutIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, BotIcon, UserIcon } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useVoiceAgent } from "@/hooks/use-voice-agent";
import { authClient } from "@/lib/auth-client";

interface Props {
  onLeave: () => void;
  meetingName: string;
  agent: any;
}

export const CallActive = ({ onLeave, meetingName, agent }: Props) => {
  const call = useCall();
  const agentInstructions = agent?.instructions || "You are a helpful assistant.";
  const agentName = agent?.name || "Agent";
  const agentAvatar = agent?.image || "/bot-avatar.png";
  const [agentReply, setAgentReply] = useState<string>("");
  const [voiceState, setVoiceState] = useState<'idle'|'listening'|'thinking'|'speaking'>('idle');
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [hasAudioPermission, setHasAudioPermission] = useState(true);

  // Get current user info
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || "You";
  const userAvatar = session?.user?.image || "/user-avatar.png";

  // Debug agent info
  useEffect(() => {
    console.log("Agent info:", { agent, agentInstructions, agentName });
  }, [agent, agentInstructions, agentName]);

  // Check device permissions on mount
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setHasAudioPermission(true))
      .catch(() => {
        setHasAudioPermission(false);
        setDeviceError("Microphone access denied. Please allow microphone access in your browser settings.");
      });
  }, []);

  const { startListening } = useVoiceAgent(
    agentInstructions,
    (reply) => {
      console.log("Agent spoke:", reply);
      setAgentReply(reply);
    },
    (state) => {
      console.log("Voice state changed:", state);
      setVoiceState(state);
    }
  );

  const toggleMicrophone = () => {
    if (call?.microphone.enabled) {
      call.microphone.disable();
    } else {
      call?.microphone.enable();
    }
  };

  const toggleCamera = () => {
    if (call?.camera.enabled) {
      call.camera.disable();
    } else {
      call?.camera.enable();
    }
  };

  // UI status text
  let statusText = "";
  if (voiceState === 'listening') statusText = "Listening...";
  else if (voiceState === 'thinking') statusText = "Thinking...";
  else if (voiceState === 'speaking') statusText = "Agent Speaking...";

  const isMuted = call?.microphone.enabled === false;
  const isCamOff = call?.camera.enabled === false;

  return (
    <div className="flex h-full flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.svg" width={22} height={22} alt="Logo" />
          <span className="text-sm font-medium text-white">{meetingName}</span>
        </div>
        <Button onClick={onLeave} variant="destructive" size="sm">
          <LogOutIcon className="size-4" />
          Leave
        </Button>
      </div>
      <div className="flex flex-1 items-center justify-center bg-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-4xl justify-center">
          {/* User tile */}
          <div className="flex flex-col items-center">
            <div className={`relative w-32 h-32 rounded-2xl bg-gray-800 flex items-center justify-center border-4 ${isMuted ? 'border-red-500' : 'border-green-500'}`}>
              {/* User video/avatar */}
              <UserIcon className="w-16 h-16 text-white" />
              {isMuted && (
                <MicOffIcon className="absolute bottom-2 right-2 w-7 h-7 text-red-500" />
              )}
              {isCamOff && (
                <VideoOffIcon className="absolute bottom-2 left-2 w-7 h-7 text-yellow-400" />
              )}
            </div>
            <span className="mt-2 text-white font-semibold">{userName}</span>
            <span className="text-xs text-gray-400">You</span>
          </div>
          {/* Agent tile */}
          <div className="flex flex-col items-center">
            <div className={`relative w-32 h-32 rounded-2xl bg-gray-800 flex items-center justify-center border-4 border-blue-500 ${voiceState === 'speaking' ? 'animate-pulse' : ''}`}>
              <BotIcon className="w-16 h-16 text-blue-400" />
              {voiceState === 'listening' && (
                <span className="absolute bottom-2 right-2 w-7 h-7 text-blue-300 animate-bounce">🎤</span>
              )}
              {voiceState === 'speaking' && (
                <span className="absolute bottom-2 right-2 w-7 h-7 text-blue-300 animate-bounce">🔊</span>
              )}
            </div>
            <span className="mt-2 text-white font-semibold">{agentName} <span className="ml-1 text-xs bg-blue-600 text-white px-2 py-0.5 rounded">BOT</span></span>
            <span className="text-xs text-gray-400">AI Agent</span>
            {agentReply && (
              <div className="mt-2 text-blue-200 text-center max-w-xs">
                <span className="italic">{agentReply}</span>
              </div>
            )}
            <Button 
              onClick={() => {
                console.log("Talk to Agent clicked");
                startListening();
              }} 
              className="mt-2" 
              variant="secondary" 
              disabled={voiceState !== 'idle' || !hasAudioPermission}
            >
              <MicIcon className="mr-2" />
              {voiceState === 'idle' ? 'Talk to Agent' : statusText}
            </Button>
          </div>
        </div>
      </div>
      {/* Controls and status */}
      <div className="flex flex-col items-center gap-2 pb-6">
        <div className="flex gap-4 mt-2">
          <Button
            onClick={toggleMicrophone}
            variant={call?.microphone.enabled ? "default" : "destructive"}
            size="lg"
            className="rounded-full"
          >
            {call?.microphone.enabled ? (
              <MicIcon className="size-6" />
            ) : (
              <MicOffIcon className="size-6" />
            )}
          </Button>
          <Button
            onClick={toggleCamera}
            variant={call?.camera.enabled ? "default" : "destructive"}
            size="lg"
            className="rounded-full"
          >
            {call?.camera.enabled ? (
              <VideoIcon className="size-6" />
            ) : (
              <VideoOffIcon className="size-6" />
            )}
          </Button>
        </div>
        <div className="mt-2 text-center text-white/80 text-xs max-w-xs">
          <div className="mb-2">Tip: Click <b>Talk to Agent</b>, speak your question, and wait for the agent to reply. Only one can speak at a time.</div>
          <div className="text-blue-300">{statusText}</div>
          {deviceError && (
            <div className="mt-2 text-red-400 font-semibold">{deviceError}</div>
          )}
        </div>
      </div>
    </div>
  );
};
