import Link from "next/link";
import { LogInIcon, MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, SettingsIcon, AlertCircleIcon, RefreshCwIcon, LoaderIcon } from "lucide-react";
import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
  useCall,
} from "@stream-io/video-react-sdk";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { generateAvatarUri } from "@/lib/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useRef } from "react";

interface Props {
  onJoin: () => void;
  isJoining?: boolean;
}

const DisabledVideoPreview = () => {
    const { data } = authClient.useSession();
  
    return (
      <DefaultVideoPlaceholder
        participant={
         {
            name: data?.user.name ?? "",
          image:
          data?.user.image ?? generateAvatarUri({
            seed:data?.user.name ?? "",
            variant:"initials",
        }),
        } as StreamVideoParticipant
         }
         />
        )
  }

  const AllowBrowserPermissions = () => {
    return (
        <div className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="rounded-full bg-blue-100 p-4 dark:bg-blue-900/20">
                <SettingsIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
                <h3 className="text-lg font-semibold">Camera & Microphone Access</h3>
                <p className="text-sm text-muted-foreground mt-2">
                    Click the camera/microphone buttons below to enable audio and video
                </p>
            </div>
        </div>
    )
}

export const CallLobby = ({ onJoin, isJoining = false }: Props) => {
    const call = useCall();
    const { data: session, isPending: sessionLoading, error: sessionError } = authClient.useSession();
    
    // Simple local state for device controls
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isAudioLoading, setIsAudioLoading] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const [deviceError, setDeviceError] = useState<string | null>(null);
    const [hasAudioPermission, setHasAudioPermission] = useState(false);
    const [hasVideoPermission, setHasVideoPermission] = useState(false);
    const [hasAudioDevice, setHasAudioDevice] = useState(false);
    const [hasVideoDevice, setHasVideoDevice] = useState(false);
    const [isCheckingDevices, setIsCheckingDevices] = useState(true);
    
    // Refs to store media streams
    const audioStreamRef = useRef<MediaStream | null>(null);
    const videoStreamRef = useRef<MediaStream | null>(null);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);

    // Debug authentication state
    useEffect(() => {
        console.log('Session state:', { 
            session: !!session, 
            isPending: sessionLoading, 
            sessionError: sessionError?.message,
            user: session?.user?.name 
        });
    }, [session, sessionLoading, sessionError]);

    // Check device availability on mount
    useEffect(() => {
        const checkDeviceAvailability = async () => {
            try {
                // Check if audio devices are available
                const audioDevices = await navigator.mediaDevices.enumerateDevices();
                const hasAudio = audioDevices.some(device => device.kind === 'audioinput');
                setHasAudioDevice(hasAudio);

                // Check if video devices are available
                const hasVideo = audioDevices.some(device => device.kind === 'videoinput');
                setHasVideoDevice(hasVideo);
            } catch (error) {
                console.log('Could not enumerate devices:', error);
                // Assume devices are available if we can't check
                setHasAudioDevice(true);
                setHasVideoDevice(true);
            }
        };

        checkDeviceAvailability();
    }, []);

    // Update video element when video stream changes
    useEffect(() => {
        if (videoElementRef.current && videoStreamRef.current) {
            videoElementRef.current.srcObject = videoStreamRef.current;
        }
    }, [isVideoEnabled]);
    
    // Handle audio toggle - completely manual approach
    const handleAudioToggle = async () => {
        if (!call) return;
        
        setIsAudioLoading(true);
        setDeviceError(null);
        try {
            if (isAudioEnabled) {
                // Disable audio
                await call.microphone.disable();
                setIsAudioEnabled(false);
                
                // Stop the audio stream
                if (audioStreamRef.current) {
                    audioStreamRef.current.getTracks().forEach(track => track.stop());
                    audioStreamRef.current = null;
                }
            } else {
                // Check if audio device is available
                if (!hasAudioDevice) {
                    setDeviceError('No microphone found. Please connect a microphone and try again.');
                    return;
                }

                // Enable audio - manual permission request
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                        },
                        video: false 
                    });
                    
                    // Store the stream reference
                    audioStreamRef.current = stream;
                    setHasAudioPermission(true);
                    
                    // Enable in the call
                    await call.microphone.enable();
                    setIsAudioEnabled(true);
                } catch (permissionError: any) {
                    console.error('Microphone permission denied:', permissionError);
                    
                    if (permissionError.name === 'NotFoundError' || permissionError.name === 'DevicesNotFoundError') {
                        setDeviceError('No microphone found. Please connect a microphone and try again.');
                    } else if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
                        setDeviceError('Please allow microphone access to enable audio. Check your browser settings.');
                    } else {
                        setDeviceError('Failed to access microphone. Please try again.');
                    }
                    setHasAudioPermission(false);
                }
            }
        } catch (error: any) {
            console.error('Failed to toggle audio:', error);
            setDeviceError('Failed to enable microphone. Please try again.');
        } finally {
            setIsAudioLoading(false);
        }
    };

    // Handle video toggle - completely manual approach
    const handleVideoToggle = async () => {
        if (!call) return;
        
        setIsVideoLoading(true);
        setDeviceError(null);
        try {
            if (isVideoEnabled) {
                // Disable video
                await call.camera.disable();
                setIsVideoEnabled(false);
                
                // Stop the video stream
                if (videoStreamRef.current) {
                    videoStreamRef.current.getTracks().forEach(track => track.stop());
                    videoStreamRef.current = null;
                }
                
                // Clear video element
                if (videoElementRef.current) {
                    videoElementRef.current.srcObject = null;
                }
            } else {
                // Check if video device is available
                if (!hasVideoDevice) {
                    setDeviceError('No camera found. Please connect a camera and try again.');
                    return;
                }

                // Enable video - manual permission request
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ 
                        audio: false,
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: 'user'
                        }
                    });
                    
                    // Store the stream reference
                    videoStreamRef.current = stream;
                    setHasVideoPermission(true);
                    
                    // Set video element source
                    if (videoElementRef.current) {
                        videoElementRef.current.srcObject = stream;
                    }
                    
                    // Enable in the call
                    await call.camera.enable();
                    setIsVideoEnabled(true);
                } catch (permissionError: any) {
                    console.error('Camera permission denied:', permissionError);
                    
                    if (permissionError.name === 'NotFoundError' || permissionError.name === 'DevicesNotFoundError') {
                        setDeviceError('No camera found. Please connect a camera and try again.');
                    } else if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
                        setDeviceError('Please allow camera access to enable video. Check your browser settings.');
                    } else {
                        setDeviceError('Failed to access camera. Please try again.');
                    }
                    setHasVideoPermission(false);
                }
            }
        } catch (error: any) {
            console.error('Failed to toggle video:', error);
            setDeviceError('Failed to enable camera. Please try again.');
        } finally {
            setIsVideoLoading(false);
        }
    };

    // Cleanup streams on unmount
    useEffect(() => {
        return () => {
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (videoStreamRef.current) {
                videoStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Show loading state while checking session
    if (sessionLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="text-center">
                    <LoaderIcon className="size-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Loading session...</p>
                </div>
            </div>
        );
    }

    // Show error if not authenticated
    if (!session?.user) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <div className="text-center max-w-md">
                    <Alert variant="destructive">
                        <AlertCircleIcon className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Authentication Required</strong>
                            <br />
                            You must be logged in to access this resource.
                            {sessionError && (
                                <div className="mt-2 text-xs">
                                    Error: {sessionError.message}
                                </div>
                            )}
                        </AlertDescription>
                    </Alert>
                    <div className="mt-4 space-y-2">
                        <Button asChild className="w-full">
                            <Link href="/sign-in">
                                Sign In
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/sign-up">
                                Create Account
                            </Link>
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            <RefreshCwIcon className="h-4 w-4 mr-2" />
                            Refresh Page
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Join Call</CardTitle>
                    <CardDescription>
                        Set up your audio and video before joining
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Video Preview */}
                    <div className="relative">
                        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden">
                            {isVideoEnabled && videoStreamRef.current ? (
                                <video
                                    ref={videoElementRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-48 object-cover"
                                />
                            ) : (
                                <DefaultVideoPlaceholder
                                    participant={
                                        {
                                            name: session.user.name ?? "",
                                            image: session.user.image ?? generateAvatarUri({
                                                seed: session.user.name ?? "",
                                                variant: "initials",
                                            }),
                                        } as StreamVideoParticipant
                                    }
                                />
                            )}
                        </div>
                        {!hasVideoDevice && (
                            <Badge variant="destructive" className="absolute top-2 right-2">
                                No Camera
                            </Badge>
                        )}
                    </div>

                    {/* Custom Audio/Video Controls */}
                    <div className="flex justify-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 p-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleAudioToggle}
                                    disabled={isAudioLoading || !hasAudioDevice}
                                    className={`h-12 w-12 ${isAudioEnabled ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : hasAudioDevice ? 'bg-gray-100 text-gray-600 dark:bg-gray-800' : 'bg-gray-50 text-gray-400 dark:bg-gray-900'}`}
                                >
                                    {isAudioLoading ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : isAudioEnabled ? (
                                        <MicIcon className="h-5 w-5" />
                                    ) : (
                                        <MicOffIcon className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                            <span className="text-xs text-muted-foreground">Audio</span>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="rounded-lg border-2 border-gray-200 dark:border-gray-700 p-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleVideoToggle}
                                    disabled={isVideoLoading || !hasVideoDevice}
                                    className={`h-12 w-12 ${isVideoEnabled ? 'bg-green-100 text-green-600 dark:bg-green-900/20' : hasVideoDevice ? 'bg-gray-100 text-gray-600 dark:bg-gray-800' : 'bg-gray-50 text-gray-400 dark:bg-gray-900'}`}
                                >
                                    {isVideoLoading ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : isVideoEnabled ? (
                                        <VideoIcon className="h-5 w-5" />
                                    ) : (
                                        <VideoOffIcon className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                            <span className="text-xs text-muted-foreground">Video</span>
                        </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isAudioEnabled ? 'bg-green-500' : hasAudioPermission ? 'bg-blue-500' : hasAudioDevice ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className={isAudioEnabled ? 'text-green-600' : hasAudioPermission ? 'text-blue-600' : hasAudioDevice ? 'text-yellow-600' : 'text-red-600'}>
                                Microphone {isAudioEnabled ? 'On' : hasAudioPermission ? 'Ready' : hasAudioDevice ? 'No Permission' : 'Not Found'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isVideoEnabled ? 'bg-green-500' : hasVideoPermission ? 'bg-blue-500' : hasVideoDevice ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <span className={isVideoEnabled ? 'text-green-600' : hasVideoPermission ? 'text-blue-600' : hasVideoDevice ? 'text-yellow-600' : 'text-red-600'}>
                                Camera {isVideoEnabled ? 'On' : hasVideoPermission ? 'Ready' : hasVideoDevice ? 'No Permission' : 'Not Found'}
                            </span>
                        </div>
                    </div>

                    {/* Device Error Alert */}
                    {deviceError && (
                        <Alert variant="destructive">
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertDescription>
                                {deviceError}
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="p-0 h-auto text-destructive underline"
                                    onClick={() => setDeviceError(null)}
                                >
                                    Dismiss
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Device Not Found Alert */}
                    {(!hasAudioDevice || !hasVideoDevice) && !deviceError && (
                        <Alert>
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Device Not Found:</strong>
                                <ul className="mt-2 list-disc list-inside text-sm">
                                    {!hasAudioDevice && <li>No microphone detected. Please connect a microphone.</li>}
                                    {!hasVideoDevice && <li>No camera detected. Please connect a camera.</li>}
                                    <li>You can still join the call without audio/video and enable them later if devices become available.</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Permission Alert */}
                    {hasAudioDevice && hasVideoDevice && (!hasAudioPermission || !hasVideoPermission) && !deviceError && (
                        <Alert>
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Permission Required:</strong> To use audio/video, please:
                                <ul className="mt-2 list-disc list-inside text-sm">
                                    <li>Click the camera/microphone icons above to request permissions</li>
                                    <li>Allow permissions when prompted by your browser</li>
                                    <li>You can also join without audio/video and enable them later in the call</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/meetings">
                                Cancel
                            </Link>
                        </Button>
                        <Button 
                            onClick={onJoin}
                            disabled={isJoining}
                            className="flex-1"
                        >
                            <LogInIcon className="mr-2 h-4 w-4" />
                            {isJoining ? 'Joining...' : 'Join Call'}
                        </Button>
                    </div>

                    {/* Help Text */}
                    <div className="text-center text-sm text-muted-foreground">
                        <p>You can join without audio/video and enable them later in the call</p>
                        <p className="mt-1">If you have permission issues, try refreshing the page</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

