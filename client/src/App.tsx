import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Inventory from "@/pages/inventory";
import StorageUnits from "@/pages/storage-units";
import QRScanner from "@/components/qr-scanner";
import PhotoUpload from "@/components/photo-upload";

function Router() {
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [selectedStorageUnitId, setSelectedStorageUnitId] = useState<number | undefined>();

  const handleQRScanSuccess = (storageUnitId: number) => {
    setSelectedStorageUnitId(storageUnitId);
    setShowQRScanner(false);
    setShowPhotoUpload(true);
  };

  const handlePhotoUploadComplete = () => {
    setShowPhotoUpload(false);
    setSelectedStorageUnitId(undefined);
    // Could navigate to dashboard or reset flow
  };

  const resetFlow = () => {
    setShowQRScanner(true);
    setShowPhotoUpload(false);
    setSelectedStorageUnitId(undefined);
  };

  return (
    <>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/storage-units" component={StorageUnits} />
        <Route component={NotFound} />
      </Switch>

      {/* QR Scanner Modal */}
      <QRScanner 
        open={showQRScanner} 
        onClose={() => setShowQRScanner(false)}
        onSuccess={handleQRScanSuccess}
      />

      {/* Photo Upload Modal */}
      <PhotoUpload 
        open={showPhotoUpload} 
        onClose={handlePhotoUploadComplete}
        storageUnitId={selectedStorageUnitId}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
