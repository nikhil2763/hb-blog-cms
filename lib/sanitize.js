import sanitizeHtml from "sanitize-html";

const COLOR = [
  /^#[0-9a-f]{3,8}$/i,
  /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/i,
  /^[a-z]+$/i,
];

const OPTIONS = {
  allowedTags: [
    "p", "br", "strong", "b", "em", "i", "u", "s", "span", "mark", "a",
    "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "code", "pre", "hr",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: ["style"],
    mark: ["style", "data-color"],
  },
  allowedStyles: {
    span: { color: COLOR, "background-color": COLOR },
    mark: { color: COLOR, "background-color": COLOR },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowProtocolRelative: false,
  transformTags: {
    // Only two link behaviours are allowed; new-tab links always get secure rel.
    a: (tagName, attribs) => {
      const out = { href: attribs.href };
      if (attribs.target === "_blank") {
        out.target = "_blank";
        out.rel = "noopener noreferrer";
      }
      return { tagName, attribs: out };
    },
  },
};

// Strips scripts, event handlers, unsafe URLs and unknown styles from editor HTML.
export function sanitizeContent(html) {
  return sanitizeHtml(html || "", OPTIONS);
}

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

// Plain-text version of the rich content, used for previews, meta descriptions and empty checks.
export function toPlainText(html) {
  const spaced = (html || "").replace(/<(br|\/p|\/h\d|\/li|\/blockquote)[^>]*>/gi, " ");
  const text = sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} });
  return text.replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m]).replace(/\s+/g, " ").trim();
}

export function makeExcerpt(html, length = 160) {
  const text = toPlainText(html);
  if (text.length <= length) return text;
  const cut = text.lastIndexOf(" ", length);
  return text.slice(0, cut > 0 ? cut : length) + "…";
}

export function readingTime(html) {
  const words = toPlainText(html).split(" ").filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
