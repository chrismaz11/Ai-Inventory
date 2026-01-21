import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, Plus, QrCode, Settings, Trash2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import StorageUnitForm from "@/components/storage-unit-form";
import { formatDistanceToNow } from "date-fns";

export default function StorageUnits() {
  const [showCreateUnit, setShowCreateUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const { toast } = useToast();

  const { data: storageUnits = [], isLoading } = useQuery({
    queryKey: ["/api/storage-units"],
  });

  const { data: items = [] } = useQuery({
    queryKey: ["/api/items"],
  });

  const deleteUnitMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/storage-units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/storage-units"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      toast({
        title: "Storage unit deleted",
        description: "The storage unit has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete storage unit.",
        variant: "destructive",
      });
    },
  });

  const getItemCount = (unitId: number) => {
    return items.filter((item: any) => item.storageUnitId === unitId).length;
  };

  const handleDelete = (unit: any) => {
    if (confirm(`Are you sure you want to delete "${unit.name}"? This will also delete all items in this storage unit.`)) {
      deleteUnitMutation.mutate(unit.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft size={16} className="mr-2" />
                  Back
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-slate-900">Storage Units</h1>
            </div>
            
            <Button onClick={() => setShowCreateUnit(true)}>
              <Plus size={16} className="mr-2" />
              New Storage Unit
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Storage Units Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-slate-200 rounded mb-4"></div>
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : storageUnits.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <QrCode size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No storage units yet</h3>
              <p className="text-slate-500 mb-6">
                Create your first storage unit to start organizing your inventory
              </p>
              <Button onClick={() => setShowCreateUnit(true)}>
                <Plus size={16} className="mr-2" />
                Create Storage Unit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storageUnits.map((unit: any) => (
              <Card key={unit.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {unit.qrCode.split('-')[1]?.slice(0, 3) || 'XX'}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{unit.name}</CardTitle>
                        <p className="text-sm text-slate-500">{unit.location}</p>
                      </div>
                    </div>
                    
                    <Badge variant={unit.status === 'active' ? 'default' : 'secondary'}>
                      {unit.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {unit.description && (
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {unit.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Items:</span>
                      <span className="font-medium">{getItemCount(unit.id)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">QR Code:</span>
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {unit.qrCode}
                      </code>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Updated:</span>
                      <span className="text-slate-600">
                        {formatDistanceToNow(new Date(unit.updatedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setEditingUnit(unit)}
                    >
                      <Settings size={14} className="mr-1" />
                      Edit
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(unit)}
                          disabled={deleteUnitMutation.isPending}
                          aria-label="Delete storage unit"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete storage unit</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {storageUnits.length > 0 && (
          <div className="mt-8 text-center text-slate-500">
            <p>
              {storageUnits.length} storage unit{storageUnits.length !== 1 ? 's' : ''} with {' '}
              {items.length} total item{items.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <StorageUnitForm 
        open={showCreateUnit} 
        onClose={() => setShowCreateUnit(false)} 
      />
      
      {editingUnit && (
        <StorageUnitForm 
          open={!!editingUnit} 
          onClose={() => setEditingUnit(null)}
          storageUnit={editingUnit}
        />
      )}
    </div>
  );
}
