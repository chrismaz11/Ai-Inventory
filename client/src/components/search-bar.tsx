import { useState, useCallback, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

// Custom debounce implementation to avoid lodash dependency
function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search items...", 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: ["/api/items", { search: query }],
    enabled: query.length > 0,
  });

  const debouncedSearch = useDebounce((searchQuery: string) => {
    onSearch(searchQuery);
  }, 300);

  const handleInputChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
    setShowSuggestions(value.length > 0);
  };

  const handleClear = () => {
    setQuery("");
    setShowSuggestions(false);
    onSearch("");
  };

  const handleSuggestionClick = (itemName: string) => {
    setQuery(itemName);
    setShowSuggestions(false);
    onSearch(itemName);
  };

  const categories = Array.from(new Set(searchResults.map((item: any) => item.category).filter(Boolean)));

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input 
          type="text" 
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(query.length > 0)}
          className="pl-10 pr-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary" size={16} />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-auto p-1"
          >
            <X size={14} />
          </Button>
        )}
      </div>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {searchResults.length > 0 ? (
            <div className="p-2">
              <div className="text-xs font-medium text-slate-500 mb-2">Items</div>
              {searchResults.slice(0, 5).map((item: any) => (
                <button
                  key={item.id}
                  onClick={() => handleSuggestionClick(item.name)}
                  className="w-full text-left p-2 hover:bg-slate-50 rounded text-sm"
                >
                  <div className="font-medium">{item.name}</div>
                  {item.description && (
                    <div className="text-slate-500 text-xs truncate">{item.description}</div>
                  )}
                </button>
              ))}
              
              {categories.length > 0 && (
                <>
                  <div className="text-xs font-medium text-slate-500 mt-3 mb-2">Categories</div>
                  <div className="flex flex-wrap gap-1">
                    {categories.slice(0, 4).map((category: any) => (
                      <Badge
                        key={category}
                        variant="secondary"
                        className="cursor-pointer hover:bg-slate-200 text-xs"
                        onClick={() => handleSuggestionClick(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : query.length > 0 ? (
            <div className="p-4 text-center text-slate-500 text-sm">
              No items found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
