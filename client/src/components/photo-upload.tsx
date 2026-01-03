import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { CloudUpload, X, Loader2, Camera, CheckCircle } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface PhotoUploadProps {
  open: boolean;
  onClose: () => void;
  storageUnitId?: number;
}

export default function PhotoUpload({ open, onClose, storageUnitId }: PhotoUploadProps) {
  const [selectedStorageUnit, setSelectedStorageUnit] = useState<string>(storageUnitId?.toString() || "");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const { toast } = useToast();

  const { data: storageUnits = [] } = useQuery<any[]>({
    queryKey: ["/api/storage-units"],
  });

  const analyzeMutation = useMutation({
    mutationFn: async ({ files, storageUnitId }: { files: File[], storageUnitId: number }) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('photos', file);
      });
      formData.append('storageUnitId', storageUnitId.toString());

      const response = await fetch('/api/analyze-photos', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to analyze photos');
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/storage-units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      
      toast({
        title: "Analysis complete",
        description: `Successfully added ${data.itemsAdded} items to your inventory.`,
      });
      
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze photos",
        variant: "destructive",
      });
      setUploadProgress("");
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were rejected",
        description: "Only image files under 10MB are allowed.",
        variant: "destructive",
      });
    }

    setSelectedFiles(validFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    setSelectedFiles(validFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const startAnalysis = () => {
    if (!selectedStorageUnit || selectedFiles.length === 0) {
      toast({
        title: "Missing information",
        description: "Please select a storage unit and upload photos.",
        variant: "destructive",
      });
      return;
    }

    setUploadProgress("Uploading photos...");
    
    setTimeout(() => {
      setUploadProgress("AI is analyzing your photos...");
    }, 1000);

    analyzeMutation.mutate({
      files: selectedFiles,
      storageUnitId: parseInt(selectedStorageUnit),
    });
  };

  const handleClose = () => {
    if (!analyzeMutation.isPending) {
      setSelectedStorageUnit("");
      setSelectedFiles([]);
      setUploadProgress("");
      onClose();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg" aria-describedby="photo-upload-description">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add Photos for AI Analysis
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={analyzeMutation.isPending}
              aria-label="Close"
            >
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div id="photo-upload-description" className="sr-only">
          Upload photos of your storage contents for AI-powered item identification
        </div>
        
        <div className="space-y-6">
          {/* Storage Unit Selection */}
          <div className="space-y-2">
            <Label>Select Storage Unit</Label>
            <Select 
              value={selectedStorageUnit} 
              onValueChange={setSelectedStorageUnit}
              disabled={analyzeMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose storage unit..." />
              </SelectTrigger>
              <SelectContent>
                {storageUnits.map((unit: any) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Photo Upload Area */}
          <div className="space-y-4">
            <Label>Upload Photos</Label>
            
            {selectedFiles.length === 0 ? (
              <>
                <button
                  type="button"
                  className="w-full border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  onClick={() => document.getElementById('photo-input')?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  aria-label="Upload photos"
                >
                  <CloudUpload className="mx-auto mb-4 text-secondary" size={48} />
                  <p className="text-slate-700 font-medium mb-2">Drop photos here or click to browse</p>
                  <p className="text-sm text-secondary">Supports JPG, PNG, HEIC up to 10MB each</p>
                </button>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  id="photo-input"
                  onChange={handleFileSelect}
                  disabled={analyzeMutation.isPending}
                />
              </>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{selectedFiles.length} file(s) selected</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedFiles([])}
                    disabled={analyzeMutation.isPending}
                  >
                    Clear
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3 max-h-32 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="relative group bg-slate-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Camera size={16} className="text-slate-400" />
                        <span className="text-xs truncate flex-1">{file.name}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-auto p-1 opacity-0 group-hover:opacity-100"
                          onClick={() => removeFile(index)}
                          disabled={analyzeMutation.isPending}
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => document.getElementById('photo-input')?.click()}
                  disabled={analyzeMutation.isPending}
                  className="w-full"
                >
                  Add More Photos
                </Button>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden" 
                  id="photo-input"
                  onChange={handleFileSelect}
                  disabled={analyzeMutation.isPending}
                />
              </div>
            )}
          </div>
          
          {/* Processing Status */}
          {uploadProgress && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="animate-spin text-primary" size={20} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{uploadProgress}</p>
                  <p className="text-xs text-secondary">This may take 30-60 seconds</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
              disabled={analyzeMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={startAnalysis} 
              className="flex-1"
              disabled={!selectedStorageUnit || selectedFiles.length === 0 || analyzeMutation.isPending}
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2" size={16} />
                  Analyzing...
                </>
              ) : (
                "Start Analysis"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
