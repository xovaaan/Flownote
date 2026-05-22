const ALLOWED_TAGS =
  /^(h2|h3|p|strong|b|em|i|ul|ol|li|blockquote|br|div|span|table|thead|tbody|tr|th|td)$/i;

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<span>$1</span>");
}

function parseTableCells(row: string): string[] {
  const trimmed = row.trim();
  if (!trimmed.includes("|")) return [inlineFormat(trimmed)];
  const inner = trimmed.startsWith("|") ? trimmed.slice(1) : trimmed;
  const cells = inner.split("|").map((c) => inlineFormat(c.trim()));
  if (cells.length && cells[cells.length - 1] === "") cells.pop();
  return cells;
}

function isTableSeparator(line: string): boolean {
  const t = line.trim();
  return /^\|?[\s\-:|]+\|?$/.test(t) && t.includes("-");
}

function isTableRow(line: string): boolean {
  const t = line.trim();
  return t.includes("|") && (t.startsWith("|") || /^\S.*\|.*\S/.test(t));
}

function markdownTableToHtml(lines: string[]): string {
  if (lines.length < 2) return lines.map((l) => `<p>${inlineFormat(l)}</p>`).join("");

  const header = parseTableCells(lines[0]);
  const bodyStart = isTableSeparator(lines[1]) ? 2 : 1;
  const bodyLines = lines.slice(bodyStart).filter((l) => l.trim());

  let html =
    '<table class="summary-table"><thead><tr>' +
    header.map((c) => `<th>${c}</th>`).join("") +
    "</tr></thead><tbody>";

  for (const row of bodyLines) {
    if (isTableSeparator(row)) continue;
    const cells = parseTableCells(row);
    html += "<tr>" + cells.map((c) => `<td>${c}</td>`).join("") + "</tr>";
  }

  html += "</tbody></table>";
  return html;
}

/** Find markdown pipe tables in plain text and replace with HTML tables */
export function convertMarkdownTables(text: string): string {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (isTableRow(trimmed) && i + 1 < lines.length && isTableSeparator(lines[i + 1].trim())) {
      const block: string[] = [lines[i]];
      i++;
      block.push(lines[i]);
      i++;
      while (i < lines.length && isTableRow(lines[i].trim()) && !isTableSeparator(lines[i].trim())) {
        block.push(lines[i]);
        i++;
      }
      out.push(markdownTableToHtml(block));
      continue;
    }

    out.push(line);
    i++;
  }

  return out.join("\n");
}

/** Fix tables saved as consecutive <p>| ... |</p> rows */
function convertParagraphTablesToHtml(html: string): string {
  return html.replace(
    /((?:<p>\s*\|[^<]+\|\s*<\/p>\s*)+)/gi,
    (block) => {
      const rows = [...block.matchAll(/<p>\s*(\|[^<]+?\|)\s*<\/p>/gi)].map((m) => m[1]);
      if (rows.length < 2 || !isTableSeparator(rows[1])) return block;
      return markdownTableToHtml(rows);
    }
  );
}

/** Convert legacy markdown enhanced notes to HTML */
export function markdownToHtml(markdown: string): string {
  const withTables = convertMarkdownTables(markdown);
  const lines = withTables.split("\n");
  const parts: string[] = [];
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      parts.push("</ul>");
      inUl = false;
    }
    if (inOl) {
      parts.push("</ol>");
      inOl = false;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      closeLists();
      continue;
    }

    if (trimmed.startsWith("<table")) {
      closeLists();
      parts.push(trimmed);
      continue;
    }

    if (/^#{1,2}\s+/.test(trimmed)) {
      closeLists();
      parts.push(`<h2>${inlineFormat(trimmed.replace(/^#{1,2}\s+/, ""))}</h2>`);
      continue;
    }
    if (/^#{3,6}\s+/.test(trimmed)) {
      closeLists();
      parts.push(`<h3>${inlineFormat(trimmed.replace(/^#{3,6}\s+/, ""))}</h3>`);
      continue;
    }
    if (/^[-*•]\s+/.test(trimmed)) {
      if (!inUl) {
        closeLists();
        parts.push("<ul>");
        inUl = true;
      }
      parts.push(`<li>${inlineFormat(trimmed.replace(/^[-*•]\s+/, ""))}</li>`);
      continue;
    }
    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inOl) {
        closeLists();
        parts.push("<ol>");
        inOl = true;
      }
      parts.push(`<li>${inlineFormat(trimmed.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }
    if (trimmed.startsWith(">")) {
      closeLists();
      parts.push(`<blockquote><p>${inlineFormat(trimmed.replace(/^>\s?/, ""))}</p></blockquote>`);
      continue;
    }

    if (isTableRow(trimmed)) {
      closeLists();
      parts.push(`<p>${inlineFormat(trimmed)}</p>`);
      continue;
    }

    closeLists();
    parts.push(`<p>${inlineFormat(trimmed)}</p>`);
  }

  closeLists();
  return parts.join("");
}

/** Strip disallowed tags/attributes; keep simple semantic HTML */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\s(on\w+|style)=["'][^"']*["']/gi, "")
    .replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (tag, name) => {
      const n = name.toLowerCase();
      if (ALLOWED_TAGS.test(n)) {
        if (tag.startsWith("</")) return `</${n}>`;
        if (n === "br") return "<br>";
        if (n === "div" && /class="table-scroll"/.test(tag)) return '<div class="table-scroll">';
        return `<${n}>`;
      }
      return "";
    });
}

export function normalizeEnhancedHtml(raw: string): string {
  let content = raw.trim();
  if (!content) return "";

  content = content.replace(/^```html?\s*/i, "").replace(/```\s*$/i, "");
  content = convertMarkdownTables(content);
  content = convertParagraphTablesToHtml(content);

  const looksLikeHtml = /<(h2|h3|p|ul|ol|li|strong|em|blockquote|table|div)\b/i.test(content);
  let html = looksLikeHtml ? content : markdownToHtml(content);

  if (!html.includes("<table") && content.includes("|")) {
    html = markdownToHtml(content);
  }

  html = convertParagraphTablesToHtml(html);
  html = sanitizeHtml(html);
  html = html.replace(/<table/gi, '<div class="table-scroll"><table');
  html = html.replace(/<\/table>/gi, "</table></div>");
  return html;
}

export function stripHtmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/t[dh]>/gi, "\t")
    .replace(/<\/tr>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[23]>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
