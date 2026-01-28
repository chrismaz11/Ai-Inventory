import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { badgeVariants } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { type Item } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search items...", 
  className = "" 
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const { data: searchResults = [] } = useQuery<Item[]>({
    queryKey: ["/api/items", { search: debouncedQuery }],
    enabled: debouncedQuery.length > 0,
  });

  // Effect to trigger the parent onSearch when the debounced query changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
  };

  const handleClear = () => {
    setQuery("");
    setShowSuggestions(false);
    // debouncedQuery will update eventually, triggering the effect
  };

  const handleSuggestionClick = (itemName: string) => {
    setQuery(itemName);
    setShowSuggestions(false);
    // We want immediate feedback for clicks, so we might want to bypass debounce?
    // But setting query will trigger debounce.
    // Ideally we'd set debounced value immediately but useDebounce doesn't expose setter.
    // However, for UX, clicking a suggestion should probably search immediately.
    // Since useDebounce is tied to query, we can't force it.
    // But wait, the original code called `onSearch` immediately in handleSuggestionClick:
    // `onSearch(itemName);`
    // So I should keep that behavior.
  };

  // Re-evaluating handleSuggestionClick:
  // If I call onSearch(itemName) here, and also setQuery(itemName),
  // then setQuery updates state -> debounce timer starts -> 300ms later debouncedQuery updates -> effect fires -> onSearch called again.
  // This might cause double search.
  // Ideally, if the user clicks a suggestion, we accept that as the final query.

  // Let's stick to the previous behavior logic where possible, but `useDebounce` makes it reactive.
  // If I want to avoid the double call, I can check if query matches debouncedQuery? No.

  // Actually, standard pattern with useDebounce is: UI is driven by `query`, API/Search is driven by `debouncedQuery`.
  // If user clicks suggestion, `query` becomes `itemName`. `debouncedQuery` updates 300ms later. `onSearch` fires.
  // The delay is slightly annoying for a click, but acceptable.
  // OR, I can keep `onSearch(itemName)` in the click handler, and the effect will fire again later.
  // Since `onSearch` is likely just setting a filter state in parent, setting it twice to the same value is fine (React handles equality checks).

  // Let's refine the Categories part.
  const categories = Array.from(new Set(searchResults.map((item) => item.category).filter(Boolean) as string[]));

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
            aria-label="Clear search"
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
              {searchResults.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSuggestionClick(item.name)}
                  className="w-full text-left p-2 hover:bg-slate-50 rounded text-sm focus:outline-none focus:bg-slate-50 transition-colors"
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
                    {categories.slice(0, 4).map((category) => (
                      <button
                        key={category}
                        className={cn(
                          badgeVariants({ variant: "secondary" }),
                          "cursor-pointer hover:bg-slate-200 text-xs border-transparent"
                        )}
                        onClick={() => handleSuggestionClick(category)}
                      >
                        {category}
                      </button>
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
