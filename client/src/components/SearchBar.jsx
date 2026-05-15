"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar({ onSearch, initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val.trim());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-xl">
      <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search by property name..."
        className="w-full rounded-xl border border-white/10 bg-slate-800/80 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
      />
    </form>
  );
}
