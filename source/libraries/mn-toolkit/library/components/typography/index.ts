export * from './Typography';

import DOMPurify from 'dompurify';
import { marked, Token, Tokens } from 'marked';
import { shortnameToImage } from 'mn-tools';

/**
 * Options controlling the Markdown to HTML conversion.
 */
export interface MarkdownOptions {
  /**
   * If true, will use dompurify to sanitize the resulting HTML text
   */
  sanitizeHTML?: boolean;
  /**
   * If true, strip <p> wrappers and <br/> for inline injection (e.g., headings).
   */
  inline?: boolean;
  /**
   * If true, auto-link plain URLs into <a> tags.
   */
  linkify?: boolean;
}

/**
 * Converts a user-supplied Markdown string to safe HTML.
 *
 * @param raw     Raw Markdown input from the user.
 * @param options Conversion flags (inline mode, linkify, etc.).
 * @returns       Sanitized HTML string.
 */
export function markdownToHtml(markdown: string, options: MarkdownOptions = {}): string {
  if (!markdown) return '';

  const { inline = false, linkify = false, sanitizeHTML = false } = options;

  // 1) Convert Markdown to raw HTML.
  let html = marked.parse(markdown, { async: false, gfm: true, breaks: !inline });

  // 2) For inline: remove <p> wrappers and <br> tags.
  if (inline) {
    html = html.trim();
    if (html.startsWith('<p>') && html.endsWith('</p>')) {
      html = html.slice(3, -4); // strip <p>...</p>
    }
    html = html.replace(/<br\s*\/?>/gi, '');
  }

  // 3) Depending on linkify, make all links _blank OR remove all <a> tags but keep their text content.
  if (linkify) {
    html = html.replace(/<a/g, '<a target="_blank"');
  } else {
    // Replace <a ...>text</a> with just "text"
    html = html.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');
  }

  // 4) If sanitizeHTML === true, use DOMPurify.
  if (sanitizeHTML) {
    html = DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ADD_ATTR: ['target', 'rel'],
    });
  }

  // 5) Replace emoji shortnames and ASCII with SVG emoji icons.
  html = shortnameToImage(html);

  return html;
}

/** Options controlling how Markdown is stripped. */
export interface RemoveMarkdownOptions {
  /**
   * Unicode character to prefix list items with (e.g. "•").
   * If falsy, no bullet is inserted.
   */
  listUnicodeChar?: string;
  /**
   * If true (default), remove the Markdown list bullet/number.
   * If false, keep them (or replace with `listUnicodeChar` if provided).
   */
  stripListLeaders?: boolean;
  /**
   * Enable GitHub-flavoured-markdown (passed to marked). Default: true.
   */
  gfm?: boolean;
  /**
   * If true (default), keep the alt text of images.
   * Otherwise, images are removed entirely.
   */
  useImgAltText?: boolean;
}

const defaultRemoveOpts: RemoveMarkdownOptions = {
  listUnicodeChar: '',
  stripListLeaders: true,
  gfm: true,
  useImgAltText: true,
};

/**
 * Removes all Markdown/HTML formatting and returns plain text.
 *
 * @param source   Markdown string to clean.
 * @param opts     Removal options.
 * @returns        Plain-text string.
 */
export function removeMarkdown(source: string, opts: RemoveMarkdownOptions = {}): string {
  if (!source) return '';

  const options = { ...defaultRemoveOpts, ...opts };

  // Let marked tokenize the input — no HTML generation.
  const tokens = marked.lexer(source, { gfm: options.gfm });

  /** Recursively extract plain text from an array of tokens. */
  const renderTokens = (tokArr: Token[] | Tokens.ListItem[]) => {
    let out = '';
    for (const tok of tokArr) {
      switch (tok.type) {
        /* ---------- Block-level tokens ---------- */
        case 'heading':
        case 'paragraph':
        case 'text':
          out += innerText(tok.tokens) + '\n';
          break;

        case 'space':
          // blank line between blocks
          out += '\n';
          break;

        case 'list':
          const listTok = tok as Tokens.List;
          listTok.items.forEach((item) => {
            if (!options.stripListLeaders) {
              out += options.listUnicodeChar || item.task ? '- ' : '';
            } else if (options.listUnicodeChar) {
              out += options.listUnicodeChar + ' ';
            }
            out += innerText(item.tokens) + '\n';
          });
          break;

        case 'blockquote':
          const bqTok = tok as Tokens.Blockquote;
          out += renderTokens(bqTok.tokens) + '\n';
          break;

        case 'code':
          out += tok.text + '\n';
          break;

        case 'table':
          const tableTok = tok as Tokens.Table;
          // Concatenate all cell texts, separated by spaces
          tableTok.rows.forEach((row) => {
            out +=
              row
                .map((cell) => innerText(cell.tokens))
                .join('  ')
                .trim() + '\n';
          });
          break;

        /* ---------- Inline-only tokens ---------- */
        case 'html':
        case 'hr':
          // Ignore raw HTML and horizontal rules
          break;

        default:
          // Any unhandled token type → dig inside if it has .tokens
          if ('tokens' in tok && Array.isArray(tok.tokens)) {
            out += renderTokens(tok.tokens);
          }
          break;
      }
    }
    return out;
  };

  /** Extract raw text from inline tokens (strong, em, link, image, etc.). */
  const innerText = (inline?: Token[] | undefined): string => {
    if (!inline) return '';
    let txt = '';
    for (const token of inline) {
      switch (token.type) {
        case 'text':
          txt += token.text;
          break;
        case 'codespan':
          txt += token.text;
          break;
        case 'strong':
        case 'em':
        case 'del':
        case 'underline':
          txt += innerText(token.tokens);
          break;
        case 'link':
          txt += innerText(token.tokens); // ignore the href, keep the label
          break;
        case 'image':
          if (options.useImgAltText) {
            txt += token.text;
          }
          break;
        case 'html':
          /* ignore raw HTML inside inline context */
          break;
        default:
          if ('tokens' in token && Array.isArray(token.tokens)) {
            txt += innerText(token.tokens);
          }
      }
    }
    return txt;
  };

  // Build the final plain-text output
  let output = renderTokens(tokens);

  // Collapse 3+ line breaks into exactly two
  output = output.replace(/\n{3,}/g, '\n\n').trim();

  return output;
}
