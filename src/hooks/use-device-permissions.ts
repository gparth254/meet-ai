import { useState, useEffect } from 'react';

interface DevicePermissions {
  hasCameraPermission: boolean;
  hasMicrophonePermission: boolean;
  isChecking: boolean;
  requestPermissions: () => Promise<void>;
}

export const useDevicePermissions = (): DevicePermissions => {
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkPermissions = async () => {
    try {
      // Check microphone permission separately
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ 
          audio: true,
          video: false 
        });
        setHasMicrophonePermission(true);
        // Stop the test stream immediately
        audioStream.getTracks().forEach(track => track.stop());
      } catch (audioError) {
        console.log('Microphone permission not granted:', audioError);
        setHasMicrophonePermission(false);
      }

      // Check camera permission separately
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ 
          audio: false,
          video: true 
        });
        setHasCameraPermission(true);
        // Stop the test stream immediately
        videoStream.getTracks().forEach(track => track.stop());
      } catch (videoError) {
        console.log('Camera permission not granted:', videoError);
        setHasCameraPermission(false);
      }
    } catch (error) {
      console.log('Device permissions check failed:', error);
      setHasCameraPermission(false);
      setHasMicrophonePermission(false);
    }
  };

  const requestPermissions = async () => {
    setIsChecking(true);
    try {
      await checkPermissions();
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check permissions on mount with a slight delay to avoid conflicts
    const timeoutId = setTimeout(() => {
      checkPermissions();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return {
    hasCameraPermission,
    hasMicrophonePermission,
    isChecking,
    requestPermissions,
  };
}; 