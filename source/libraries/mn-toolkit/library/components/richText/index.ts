import { LexicalEditor } from 'lexical/LexicalEditor';
import { IAbstractPopoverProps } from '../popover';
import { IIconProps, TIconId } from '../icon';

export * from './CustomParagraphNode';
export * from './CustomTextNode';
export * from './ToolbarPlugin';
export * from './ListPlugin';
export * from './LexicalRichTextEditorContent';
export * from './RichTextEditor';
export * from './RichTextEditorField';

export type TRichTextToolGroupId = 'undoRedo' | 'format' | 'block' | 'structure' | 'align' | 'link' | 'custom';

export type TRichTextBaseToolId =
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
  | 'outdent'
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

interface IToolbarPluginToolCommons<TOOL_IDS extends string = TRichTextBaseToolId> {
  /** Unique identifier in the bar */
  id: TOOL_IDS;
  /** Group in which to render the tool */
  group: TRichTextToolGroupId;
  /** Dynamic icon based on editor state */
  getIcon: (editor: LexicalEditor) => TIconId;
  /** Dynamic tool name based on editor state */
  getHint: (editor: LexicalEditor) => string;
  /** Dynamic style based on editor state (optional) */
  getStyle?: (editor: LexicalEditor) => IIconProps['style'];
  /** Returns true if the tool is currently "disabled" (optional) */
  isDisabled?: (editor: LexicalEditor) => boolean;
  /** Returns true if the tool is currently "active" (optional) */
  isActive?: (editor: LexicalEditor) => boolean;
}

interface IToolbarPluginToolExecute<TOOL_IDS extends string = TRichTextBaseToolId>
  extends IToolbarPluginToolCommons<TOOL_IDS> {
  /** Execute on click */
  execute: (editor: LexicalEditor) => void | Promise<void>;
}

interface IToolbarPluginToolPopover<TOOL_IDS extends string = TRichTextBaseToolId>
  extends IToolbarPluginToolCommons<TOOL_IDS> {
  /** Popover content for tools like color picker (optional) */
  popoverContent: (editor: LexicalEditor) => IAbstractPopoverProps['content'];
}

export type TToolbarPluginTool<TOOL_IDS extends string = TRichTextBaseToolId> =
  | IToolbarPluginToolExecute<TOOL_IDS>
  | IToolbarPluginToolPopover<TOOL_IDS>;

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
