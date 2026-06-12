"use client";

import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import ImageWithSkeleton from "@/components/ui/ImageWithSkeleton";
import { formatDate } from "@/utils/format";
import { cn } from "@/utils/cn";
import { estimateReadTime, formatReadTime } from "@/utils/readTime";
import type { InsightArticle } from "@/services/insights.service";

interface InsightCardProps {
  article: InsightArticle;
  compact?: boolean;
  className?: string;
}

export default function InsightCard({ article, compact = false, className }: InsightCardProps) {
  const href = article.sourceUrl.startsWith("http") ? article.sourceUrl : "/insights";
  const isExternal = href.startsWith("http");
  const readMinutes = estimateReadTime(article.excerpt || article.title);
  const categoryInitial = article.category?.charAt(0)?.toUpperCase() || "I";

  return (
    <Card hover padding="md" className={cn("flex h-full flex-col bg-white backdrop-blur-none", className)}>
      <Badge variant="accent" size="sm" className="mb-4 w-fit">
        {article.category}
      </Badge>

      <div className="relative mb-4 aspect-[5/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {article.imageUrl ? (
          <ImageWithSkeleton
            src={article.imageUrl}
            alt={article.title}
            fill
            variant="light"
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,rgba(254,226,226,0.5),rgba(241,245,249,1))]">
            <span className="text-4xl font-bold text-accent-500/40">{categoryInitial}</span>
          </div>
        )}
      </div>

      <h3 className={`font-semibold text-slate-900 ${compact ? "line-clamp-2 text-lg" : "line-clamp-2 text-lg"}`}>
        {article.title}
      </h3>

      {!compact && article.excerpt && (
        <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-3">{article.excerpt}</p>
      )}

      <div className={`flex items-center justify-between ${compact ? "mt-3" : "mt-4 border-t border-slate-200 pt-3"}`}>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span>{formatDate(article.date)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatReadTime(readMinutes)}
          </span>
        </div>
        {isExternal ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-accent-500 hover:text-accent-600">
            Read More <ArrowRight className="h-3 w-3" />
          </a>
        ) : (
          <Link href={href} className="inline-flex items-center gap-1 text-xs font-medium text-accent-500 hover:text-accent-600">
            Read More <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </Card>
  );
}
