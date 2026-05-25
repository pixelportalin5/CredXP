"use client";

import { Search } from "lucide-react";
import { useState } from "react";

/* ============================================================
   SearchBar — Property Search Component
   ============================================================ */

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  initialValue = "",
  placeholder = "Search by property name, location, or type...",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl" id="property-search-form">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-500" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] py-3 pl-11 pr-4 text-sm text-navy-100 placeholder:text-navy-500 outline-none transition-all focus:border-[var(--border-focus)] focus:ring-1 focus:ring-accent-500/20 hover:border-[var(--border-hover)]"
        id="property-search-input"
      />
    </form>
  );
}
