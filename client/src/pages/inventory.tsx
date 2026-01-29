import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowLeft, Filter, SortAsc } from "lucide-react";
import { Link } from "wouter";
import type { Item, StorageUnit } from "@shared/schema";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const { data: items = [], isLoading } = useQuery<Item[]>({
    queryKey: ["/api/items", { search: searchQuery }],
  });

  const { data: storageUnits = [] } = useQuery<StorageUnit[]>({
    queryKey: ["/api/storage-units"],
  });

  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));

  const filteredItems = items.filter((item) =>
    !selectedCategory || item.category === selectedCategory
  );

  const getStorageUnitName = (storageUnitId: number) => {
    const unit = storageUnits.find((u) => u.id === storageUnitId);
    return unit?.name || `Unit #${storageUnitId}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft size={16} className="mr-2" />
                Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Inventory</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Input 
                type="text" 
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={16} />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <SortAsc size={16} className="mr-2" />
                Sort
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("")}
              >
                All Items
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category || "")}
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Items Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-slate-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No items found</h3>
              <p className="text-slate-500">
                {searchQuery ? "Try adjusting your search terms" : "Start by adding photos to storage units"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item: any) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{item.name}</CardTitle>
                    {item.quantity > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        {item.quantity}x
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {item.description && (
                    <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="space-y-2">
                    {item.category && (
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    )}
                    
                    <div className="text-xs text-slate-500">
                      <p>Storage: {getStorageUnitName(item.storageUnitId)}</p>
                      {item.aiConfidence && (
                        <p>AI Confidence: {item.aiConfidence}%</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        {filteredItems.length > 0 && (
          <div className="mt-8 text-center text-slate-500">
            <p>
              Showing {filteredItems.length} of {items.length} items
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
