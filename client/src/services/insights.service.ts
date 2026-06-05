import api from "@/lib/api";

export interface InsightArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  imageUrl?: string;
  sourceUrl: string;
}

const insightsService = {
  getAll: (limit = 6): Promise<{ data: InsightArticle[] }> =>
    api.get("/insights", { params: { limit } }),
};

export default insightsService;
