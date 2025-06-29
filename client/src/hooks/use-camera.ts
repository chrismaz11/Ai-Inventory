import { useRef, useState, useCallback, useEffect } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  // Check if camera is supported
  useEffect(() => {
    setIsSupported(
      'mediaDevices' in navigator && 
      'getUserMedia' in navigator.mediaDevices
    );
  }, []);

  const startCamera = useCallback(async () => {
    if (!isSupported || !videoRef.current) {
      throw new Error("Camera not supported");
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Prefer back camera for QR scanning
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setHasPermission(true);
    } catch (error) {
      console.error("Camera access failed:", error);
      setHasPermission(false);
      throw error;
    }
  }, [isSupported]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setHasPermission(false);
  }, []);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  return {
    videoRef,
    canvasRef,
    isSupported,
    hasPermission,
    startCamera,
    stopCamera,
    captureFrame,
  };
}
