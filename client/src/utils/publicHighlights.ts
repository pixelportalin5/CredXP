/**
 * Seed scripts store "Broker: name phone" lines in highlights for staff use.
 * They must never reach public pages or client proposals.
 */
export function publicHighlights(highlights?: string[] | null): string[] {
  return (highlights || []).filter((item) => !/^\s*broker\s*:/i.test(item));
}
