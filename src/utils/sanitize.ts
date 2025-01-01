export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  // Remove HTML tags and decode HTML entities in one pass
  return html
    // First remove HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Replace common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();
}
