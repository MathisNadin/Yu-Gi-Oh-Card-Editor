import { LexicalEditor } from 'lexical/LexicalEditor';
import { TIconId } from '../icon';

export * from './CustomParagraphNode';
export * from './CustomTextNode';
export * from './ToolbarPlugin';
export * from './ListPlugin';
export * from './LexicalRichTextEditorContent';
export * from './RichTextEditor';
export * from './RichTextEditorField';

export interface IToolbarPluginCustomTool {
  /** Unique identifier in the bar */
  id: string;
  /** Icon ID */
  icon: TIconId;
  /** Accessibility tooltip */
  hint: string;
  /** Execute on click */
  execute: (editor: LexicalEditor) => void;
  /** Returns true if the tool is currently "active" */
  isActive?: (editor: LexicalEditor) => boolean;
}

export type TRichTextToolId =
  | 'undo'
  | 'redo'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'color'
  | 'backgroundColor'
  | 'ul'
  | 'ol'
  | 'indent'
  | 'blockquote'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'paragraph'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'link';

/** Merge two CSS style attribute strings, deduplicate properties, and preserve order */
export function mergeStyle(attrA?: string | null, attrB?: string | null): string | undefined {
  const map = new Map<string, string>();
  [attrA, attrB].filter(Boolean).forEach((attr) => {
    attr!.split(';').forEach((rule) => {
      const [k, v] = rule.split(':').map((s) => s.trim());
      if (k && v) map.set(k.toLowerCase(), v);
    });
  });
  if (map.size === 0) return undefined;
  return Array.from(map.entries())
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}
