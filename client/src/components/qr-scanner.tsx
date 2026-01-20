import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, X, Camera } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useCamera } from "@/hooks/use-camera";
import { scanQRCode } from "@/lib/qr-scanner";

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (storageUnitId: number) => void;
}

export default function QRScanner({ open, onClose, onSuccess }: QRScannerProps) {
  const [manualEntry, setManualEntry] = useState(true); // Default to manual entry
  const [qrCode, setQrCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { 
    videoRef, 
    canvasRef, 
    isSupported, 
    hasPermission, 
    startCamera, 
    stopCamera,
    captureFrame 
  } = useCamera();

  const { data: storageUnit, error } = useQuery({
    queryKey: ["/api/storage-units/qr", qrCode],
    enabled: !!qrCode && qrCode.length > 0,
  });

  useEffect(() => {
    if (open && !manualEntry && isSupported) {
      startScanning();
    } else {
      stopScanning();
    }

    return () => {
      stopScanning();
    };
  }, [open, manualEntry, isSupported]);

  useEffect(() => {
    if (storageUnit) {
      const unit = storageUnit as any;
      toast({
        title: "Storage unit found",
        description: `Found ${unit.name}`,
      });
      if (onSuccess) {
        onSuccess(unit.id);
      } else {
        setLocation(`/storage-units`);
        onClose();
      }
    } else if (error && qrCode) {
      toast({
        title: "Storage unit not found",
        description: "The QR code doesn't match any storage unit.",
        variant: "destructive",
      });
    }
  }, [storageUnit, error, qrCode, onSuccess, setLocation, onClose]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      await startCamera();
      scanForQRCode();
    } catch (error) {
      console.error("Failed to start camera:", error);
      toast({
        title: "Camera error",
        description: "Failed to access camera. Please try manual entry.",
        variant: "destructive",
      });
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    stopCamera();
  };

  const scanForQRCode = async () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    try {
      const frame = captureFrame();
      if (frame) {
        const detectedQR = await scanQRCode(frame);
        if (detectedQR && detectedQR.startsWith('SU-')) {
          setQrCode(detectedQR);
          return;
        }
      }
    } catch (error) {
      console.error("QR scan error:", error);
    }

    // Continue scanning
    if (isScanning) {
      requestAnimationFrame(scanForQRCode);
    }
  };

  const handleManualSubmit = () => {
    if (qrCode.trim()) {
      // Query will automatically trigger due to the enabled condition
    }
  };

  const handleClose = () => {
    stopScanning();
    setQrCode("");
    setManualEntry(false);
    onClose();
  };

  if (!isSupported) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              QR Code Scanner
              <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close">
                <X size={16} />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Camera not supported on this device. Please enter the QR code manually.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="manual-qr">QR Code</Label>
              <Input
                id="manual-qr"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="SU-XXXXXXXX"
                className="font-mono"
              />
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleManualSubmit} className="flex-1">
                Search
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md" aria-describedby="qr-scanner-description">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Scan QR Code
            <Button variant="ghost" size="sm" onClick={handleClose} aria-label="Close">
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div id="qr-scanner-description" className="sr-only">
          Scan or enter a QR code to access your storage unit
        </div>
        
        {manualEntry ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-qr">QR Code</Label>
              <Input
                id="manual-qr"
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                placeholder="SU-XXXXXXXX"
                className="font-mono"
              />
            </div>
            
            {/* Test QR codes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm font-medium text-blue-900 mb-2">Test QR Codes:</p>
              <div className="space-y-1">
                <button 
                  onClick={() => setQrCode("SU-12345678")}
                  className="block w-full text-left text-xs font-mono bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                >
                  SU-12345678 (Living Room Storage Box)
                </button>
                <button 
                  onClick={() => setQrCode("SU-87654321")}
                  className="block w-full text-left text-xs font-mono bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                >
                  SU-87654321 (Basement Storage A)
                </button>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {isSupported && (
                <Button 
                  variant="outline" 
                  onClick={() => setManualEntry(false)} 
                  className="flex-1"
                >
                  Use Camera
                </Button>
              )}
              <Button onClick={handleManualSubmit} className="flex-1" disabled={!qrCode.trim()}>
                Scan Storage Unit
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Camera viewfinder */}
            <div className="relative bg-slate-100 rounded-xl h-64 overflow-hidden">
              {hasPermission ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-32 border-2 border-primary border-dashed rounded-lg"></div>
                  </div>
                  <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    Position QR code in frame
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <Camera className="text-4xl text-slate-400 mb-4" size={48} />
                  <p className="text-slate-600 text-center px-4">
                    Camera permission required for QR scanning
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={handleClose} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setManualEntry(true)} 
                className="flex-1"
              >
                Enter Manually
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
