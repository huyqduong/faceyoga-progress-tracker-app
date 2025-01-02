import DOMPurify from 'dompurify';

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

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'span', 'div'],
    ALLOWED_ATTR: ['style', 'class'],
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['target', 'allowfullscreen', 'frameborder', 'src'],
    USE_PROFILES: {
      html: true,
      svg: false,
      svgFilters: false,
      mathMl: false
    }
  });
}
