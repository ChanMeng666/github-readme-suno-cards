/**
 * XML-escape a string for safe inclusion in SVG text content and HTML
 * inside <foreignObject>. Handles the five XML entity chars; all other
 * characters (including CJK) pass through unchanged.
 */
export function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Escape a string for use inside an attribute value — quotes become numeric refs. */
export function escapeAttr(s: string): string {
  return escapeXml(s);
}
