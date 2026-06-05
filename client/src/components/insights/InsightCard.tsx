"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate } from "@/utils/format";
import type { InsightArticle } from "@/services/insights.service";

interface InsightCardProps {
  article: InsightArticle;
  compact?: boolean;
}

export default function InsightCard({ article, compact = false }: InsightCardProps) {
  const href = article.sourceUrl.startsWith("http") ? article.sourceUrl : "/insights";
  const isExternal = href.startsWith("http");

  return (
    <Card hover padding="md" className="flex h-full flex-col border-slate-200 bg-white backdrop-blur-none">
      <Badge variant="accent" size="sm" className="mb-4 w-fit">
        {article.category}
      </Badge>

      <div className="relative mb-4 aspect-[5/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt={article.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(248,250,252,1),rgba(241,245,249,1))]" />
        )}
      </div>

      <h3 className={`font-semibold text-slate-900 ${compact ? "line-clamp-2 text-lg" : "line-clamp-2 text-lg"}`}>
        {article.title}
      </h3>

      {!compact && article.excerpt && (
        <p className="mt-2 flex-1 text-sm text-slate-600 line-clamp-3">{article.excerpt}</p>
      )}

      <div className={`flex items-center justify-between ${compact ? "mt-3" : "mt-4 border-t border-slate-200 pt-3"}`}>
        <span className="text-xs text-slate-500">{formatDate(article.date)}</span>
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
