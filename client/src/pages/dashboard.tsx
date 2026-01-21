import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";
import { 
  Search, 
  QrCode, 
  Camera, 
  Plus, 
  BoxesIcon, 
  List, 
  Clock,
  Bell,
  User,
  ChevronRight,
  Package
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";

// Lazy load heavy modal components
const QRScanner = lazy(() => import("@/components/qr-scanner"));
const PhotoUpload = lazy(() => import("@/components/photo-upload"));
const StorageUnitForm = lazy(() => import("@/components/storage-unit-form"));

export default function Dashboard() {
  const [showQRScanner, setShowQRScanner] = useState(false); // Don't auto-open QR scanner
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [showCreateUnit, setShowCreateUnit] = useState(false);
  const [selectedStorageUnitId, setSelectedStorageUnitId] = useState<number | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Handle QR scanner success - open photo upload for the scanned storage unit
  const handleQRScanSuccess = (storageUnitId: number) => {
    console.log("QR scan success for storage unit:", storageUnitId);
    setSelectedStorageUnitId(storageUnitId);
    setShowQRScanner(false);
    setShowPhotoUpload(true);
  };

  const { data: stats } = useQuery<{
    totalStorageUnits: number;
    totalItems: number;
    lastActivity: any | null;
  }>({
    queryKey: ["/api/stats"],
  });

  const { data: activities = [] } = useQuery<any[]>({
    queryKey: ["/api/activities", { limit: 4 }],
  });

  const { data: storageUnits = [] } = useQuery<any[]>({
    queryKey: ["/api/storage-units"],
  });

  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: ["/api/items", { search: debouncedSearchQuery }],
    enabled: debouncedSearchQuery.length > 0,
  });

  const popularCategories = ["Electronics", "Clothing", "Books", "Tools"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BoxesIcon className="text-white" size={16} />
                </div>
                <h1 className="text-xl font-bold text-slate-900">AI Inventory</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/" className="text-primary font-medium border-b-2 border-primary pb-1">
                Dashboard
              </Link>
              <Link href="/inventory" className="text-secondary hover:text-slate-900 transition-colors">
                Inventory
              </Link>
              <Link href="/storage-units" className="text-secondary hover:text-slate-900 transition-colors">
                Storage Units
              </Link>
            </nav>

            <div className="flex items-center space-x-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Notifications">
                    <Bell size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View notifications</p>
                </TooltipContent>
              </Tooltip>
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <User size={14} className="text-slate-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="bg-primary text-white p-6 h-auto hover:bg-blue-700 transition-colors"
              onClick={() => setShowQRScanner(true)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Scan QR Code</h3>
                  <p className="text-blue-100 text-sm mt-1">Quick access to storage</p>
                </div>
                <QrCode size={32} className="text-blue-200" />
              </div>
            </Button>

            <Button 
              variant="outline"
              className="p-6 h-auto bg-white border-slate-200 hover:shadow-md transition-shadow"
              onClick={() => setShowPhotoUpload(true)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <h3 className="font-semibold text-lg text-slate-900">Add Photos</h3>
                  <p className="text-secondary text-sm mt-1">AI item recognition</p>
                </div>
                <Camera size={32} className="text-secondary" />
              </div>
            </Button>

            <Button 
              variant="outline"
              className="p-6 h-auto bg-white border-slate-200 hover:shadow-md transition-shadow"
              onClick={() => setShowCreateUnit(true)}
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <h3 className="font-semibold text-lg text-slate-900">New Storage</h3>
                  <p className="text-secondary text-sm mt-1">Create storage unit</p>
                </div>
                <Plus size={32} className="text-secondary" />
              </div>
            </Button>

            <Link href="/inventory">
              <Button 
                variant="outline"
                className="p-6 h-auto bg-white border-slate-200 hover:shadow-md transition-shadow w-full"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="text-left">
                    <h3 className="font-semibold text-lg text-slate-900">Search Items</h3>
                    <p className="text-secondary text-sm mt-1">Find anything fast</p>
                  </div>
                  <Search size={32} className="text-secondary" />
                </div>
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Activity & Stats */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BoxesIcon className="text-primary" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-secondary">Storage Units</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.totalStorageUnits || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <List className="text-success" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-secondary">Total Items</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.totalItems || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="text-warning" size={24} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-secondary">Last Scan</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {stats?.lastActivity 
                          ? formatDistanceToNow(new Date(stats.lastActivity.createdAt), { addSuffix: true })
                          : "Never"
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                  <Link href="/inventory">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                {activities.length === 0 ? (
                  <p className="text-center text-secondary py-8">No recent activity</p>
                ) : (
                  activities.map((activity: any) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        activity.type === 'add_items' ? 'bg-green-100' :
                        activity.type === 'scan' ? 'bg-blue-100' :
                        activity.type === 'create_unit' ? 'bg-purple-100' :
                        'bg-orange-100'
                      }`}>
                        {activity.type === 'add_items' && <Plus className="text-success" size={16} />}
                        {activity.type === 'scan' && <QrCode className="text-primary" size={16} />}
                        {activity.type === 'create_unit' && <Package className="text-purple-600" size={16} />}
                        {activity.type === 'update_items' && <Clock className="text-orange-600" size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                        {activity.metadata?.summary && (
                          <p className="text-xs text-secondary">{activity.metadata.summary}</p>
                        )}
                      </div>
                      <span className="text-xs text-secondary">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Search & Storage Units */}
          <div className="space-y-6">
            
            {/* Quick Search */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Search</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="Search items, storage units..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      aria-label="Search items and storage units"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={16} />
                  </div>
                  
                  {searchQuery && searchResults.length > 0 && (
                    <div className="space-y-2">
                      {searchResults.slice(0, 3).map((item: any) => (
                        <div key={item.id} className="p-2 border rounded-lg">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-secondary">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    {popularCategories.map((category) => (
                      <Button
                        key={category}
                        variant="secondary"
                        size="sm"
                        className="h-auto py-1 px-3 text-sm"
                        onClick={() => setSearchQuery(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Storage Units Overview */}
            <Card>
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Storage Units</h2>
                  <Link href="/storage-units">
                    <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                      Manage All
                    </Button>
                  </Link>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                {storageUnits.length === 0 ? (
                  <p className="text-center text-secondary py-8">No storage units yet</p>
                ) : (
                  storageUnits.slice(0, 5).map((unit: any) => (
                    <div key={unit.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {unit.qrCode.split('-')[1]?.slice(0, 3) || 'XX'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{unit.name}</p>
                          <p className="text-xs text-secondary">{unit.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={unit.status === 'active' ? 'default' : 'secondary'}>
                          {unit.status}
                        </Badge>
                        <ChevronRight className="text-secondary" size={12} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link href="/" className="flex flex-col items-center py-2 px-1 text-primary">
            <BoxesIcon size={20} className="mb-1" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link href="/inventory" className="flex flex-col items-center py-2 px-1 text-secondary hover:text-primary transition-colors">
            <List size={20} className="mb-1" />
            <span className="text-xs">Inventory</span>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center py-2 px-1 text-secondary hover:text-primary transition-colors h-auto"
            onClick={() => setShowQRScanner(true)}
          >
            <QrCode size={20} className="mb-1" />
            <span className="text-xs">Scan</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex flex-col items-center py-2 px-1 text-secondary hover:text-primary transition-colors h-auto"
            onClick={() => setSearchQuery("")}
          >
            <Search size={20} className="mb-1" />
            <span className="text-xs">Search</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {showQRScanner && (
          <QRScanner
            open={showQRScanner}
            onClose={() => setShowQRScanner(false)}
            onSuccess={handleQRScanSuccess}
          />
        )}
        {showPhotoUpload && (
          <PhotoUpload
            open={showPhotoUpload}
            onClose={() => {
              setShowPhotoUpload(false);
              setSelectedStorageUnitId(undefined);
            }}
            storageUnitId={selectedStorageUnitId}
          />
        )}
        {showCreateUnit && (
          <StorageUnitForm
            open={showCreateUnit}
            onClose={() => setShowCreateUnit(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
