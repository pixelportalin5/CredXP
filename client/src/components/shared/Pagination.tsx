"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";
import type { Pagination as PaginationType } from "@/types/common";

/* ============================================================
   Pagination — Reusable Pagination Component
   ============================================================ */

interface PaginationProps {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
  /** When set, pages render as real links so crawlers can follow them. */
  hrefForPage?: (page: number) => string;
}

interface PageControlProps {
  page: number;
  disabled?: boolean;
  className: string;
  label?: string;
  rel?: string;
  current?: boolean;
  children: React.ReactNode;
  onPageChange: (page: number) => void;
  hrefForPage?: (page: number) => string;
}

function PageControl({ page, disabled, className, label, rel, current, children, onPageChange, hrefForPage }: PageControlProps) {
  if (hrefForPage && !disabled) {
    return (
      <a
        href={hrefForPage(page)}
        rel={rel}
        aria-label={label}
        aria-current={current ? "page" : undefined}
        className={className}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
          event.preventDefault();
          onPageChange(page);
        }}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onPageChange(page)}
      disabled={disabled}
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={className}
    >
      {children}
    </button>
  );
}

export default function Pagination({ pagination, onPageChange, hrefForPage }: PaginationProps) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { currentPage, totalPages, totalItems } = pagination;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) end = 4;
      if (currentPage >= totalPages - 1) start = totalPages - 3;

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const buttonBase =
    "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200";

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-navy-500">
        Page{" "}
        <span className="font-medium text-navy-300">{currentPage}</span> of{" "}
        <span className="font-medium text-navy-300">{totalPages}</span>{" "}
        <span className="text-navy-600">({totalItems} properties)</span>
      </p>

      <div className="flex items-center gap-1.5">
        <PageControl
          page={currentPage - 1}
          disabled={currentPage <= 1}
          label="Previous page"
          rel="prev"
          onPageChange={onPageChange}
          hrefForPage={hrefForPage}
          className={cn(
            buttonBase,
            "border border-[var(--border-default)] bg-navy-800/60 text-navy-400",
            "hover:bg-navy-700 hover:text-white",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </PageControl>

        {getPageNumbers().map((page, i) =>
          page === "..." ? (
            <span key={`dot-${i}`} className="px-1 text-navy-600">
              ...
            </span>
          ) : (
            <PageControl
              key={page}
              page={page as number}
              current={page === currentPage}
              label={`Page ${page}`}
              onPageChange={onPageChange}
              hrefForPage={hrefForPage}
              className={cn(
                buttonBase,
                page === currentPage
                  ? "bg-accent-500 text-white shadow-md shadow-accent-500/20"
                  : "border border-[var(--border-default)] bg-navy-800/60 text-navy-400 hover:bg-navy-700 hover:text-white"
              )}
            >
              {page}
            </PageControl>
          )
        )}

        <PageControl
          page={currentPage + 1}
          disabled={currentPage >= totalPages}
          label="Next page"
          rel="next"
          onPageChange={onPageChange}
          hrefForPage={hrefForPage}
          className={cn(
            buttonBase,
            "border border-[var(--border-default)] bg-navy-800/60 text-navy-400",
            "hover:bg-navy-700 hover:text-white",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </PageControl>
      </div>
    </div>
  );
}
