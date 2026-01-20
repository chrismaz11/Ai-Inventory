import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, QrCode } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertStorageUnitSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertStorageUnitSchema.extend({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
});

type FormData = z.infer<typeof formSchema>;

interface StorageUnitFormProps {
  open: boolean;
  onClose: () => void;
  storageUnit?: any; // For editing
}

export default function StorageUnitForm({ open, onClose, storageUnit }: StorageUnitFormProps) {
  const [generatedQR, setGeneratedQR] = useState<string>("");
  const { toast } = useToast();
  const isEditing = !!storageUnit;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
      qrCode: "",
      status: "active",
    },
  });

  // Reset form when opening for new unit or editing existing
  useEffect(() => {
    if (open) {
      if (isEditing) {
        form.reset({
          name: storageUnit.name,
          location: storageUnit.location,
          description: storageUnit.description || "",
          qrCode: storageUnit.qrCode,
          status: storageUnit.status,
        });
        setGeneratedQR(storageUnit.qrCode);
      } else {
        form.reset({
          name: "",
          location: "",
          description: "",
          qrCode: "",
          status: "active",
        });
        setGeneratedQR("");
      }
    }
  }, [open, isEditing, storageUnit, form]);

  const generateQRMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-qr");
      return await response.json();
    },
    onSuccess: (data) => {
      setGeneratedQR(data.qrCode);
      form.setValue("qrCode", data.qrCode);
      toast({
        title: "QR code generated",
        description: "A unique QR code has been generated for this storage unit.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate QR code.",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/storage-units", data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage-units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Storage unit created",
        description: "Your new storage unit has been created successfully.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create storage unit.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("PUT", `/api/storage-units/${storageUnit.id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage-units"] });
      toast({
        title: "Storage unit updated",
        description: "Your storage unit has been updated successfully.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update storage unit.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending && !updateMutation.isPending) {
      form.reset();
      setGeneratedQR("");
      onClose();
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {isEditing ? "Edit Storage Unit" : "Create Storage Unit"}
            <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading} aria-label="Close">
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g., Basement Storage A"
              disabled={isLoading}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...form.register("location")}
              placeholder="e.g., Basement, Garage, Attic"
              disabled={isLoading}
            />
            {form.formState.errors.location && (
              <p className="text-sm text-destructive">{form.formState.errors.location.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Optional description of contents or purpose"
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={form.watch("status")} 
              onValueChange={(value) => form.setValue("status", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* QR Code Section */}
          <div className="space-y-2">
            <Label>QR Code</Label>
            {generatedQR ? (
              <div className="bg-slate-50 border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono">{generatedQR}</code>
                  <QrCode size={16} className="text-slate-400" />
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => generateQRMutation.mutate()}
                disabled={isLoading || generateQRMutation.isPending}
                className="w-full"
              >
                <QrCode size={16} className="mr-2" />
                {generateQRMutation.isPending ? "Generating..." : "Generate QR Code"}
              </Button>
            )}
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
