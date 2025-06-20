import {
  $applyNodeReplacement,
  DOMConversion,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  ElementFormatType,
  LexicalEditor,
  ParagraphNode,
  SerializedParagraphNode,
} from 'lexical';
import { mergeStyle } from '.';

export class CustomParagraphNode extends ParagraphNode {
  public static override getType() {
    return 'custom-paragraph';
  }

  public static override clone(node: CustomParagraphNode): CustomParagraphNode {
    return new CustomParagraphNode(node.__key);
  }

  /** Override importDOM to read alignment from style attribute, computed style, or CSS class */
  public static override importDOM(): DOMConversionMap | null {
    return {
      p: (_domNode: HTMLElement): DOMConversion | null => {
        return {
          priority: 1,
          conversion: (domNode: HTMLElement): DOMConversionOutput => {
            let format: ElementFormatType | undefined;

            // Check inline style attribute
            const style = domNode.getAttribute('style');
            if (style) {
              style.split(';').forEach((rule) => {
                const [key, value] = rule.split(':').map((s) => s.trim());
                if (key === 'text-align' && value) format = value as ElementFormatType;
              });
            }

            // Check class for alignment (e.g. align-left, align-center, align-right)
            if (!format && domNode.classList) {
              domNode.classList.forEach((c) => {
                if (c.startsWith('align-')) {
                  const possible = c.replace('align-', '');
                  if (['left', 'right', 'center', 'justify'].includes(possible)) format = possible as ElementFormatType;
                }
              });
            }

            // Fallback: use computed style (browser only)
            if (!format && typeof window !== 'undefined' && domNode instanceof HTMLElement) {
              const cs = window.getComputedStyle(domNode);
              const align = cs.textAlign as ElementFormatType;
              const authorizedTypes: ElementFormatType[] = ['left', 'right', 'center', 'justify', 'start', 'end'];
              if (align && authorizedTypes.includes(align)) {
                format = align;
              }
            }

            const node = $createCustomParagraphNode();
            if (format) node.setFormat(format);
            if (style) node.setStyle(style);

            return { node };
          },
        };
      },
    };
  }

  /** Override exportDOM to add CSS style for alignment */
  public override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);
    if (element instanceof HTMLElement) {
      const format = this.getFormatType();
      if (format) element.classList.add(`align-${format}`);

      const style = this.getStyle();
      if (style) {
        element.setAttribute('style', mergeStyle(element.getAttribute('style'), style) ?? '');
      }
    }
    return { element };
  }

  public override updateFromJSON(json: SerializedParagraphNode | SerializedCustomParagraphNode): this {
    super.updateFromJSON(json);
    if ('style' in json && json.style) this.setStyle(json.style);
    return this;
  }

  /** Serialization methods to support copy-paste and JSON */
  public static override importJSON(
    serializedNode: SerializedParagraphNode | SerializedCustomParagraphNode
  ): CustomParagraphNode {
    return $createCustomParagraphNode().updateFromJSON(serializedNode);
  }

  /** Export node to JSON, including custom style */
  public override exportJSON(): SerializedCustomParagraphNode {
    const json = super.exportJSON() as SerializedCustomParagraphNode;
    const style = this.getStyle();
    if (style) json.style = style;
    return json;
  }
}

export type SerializedCustomParagraphNode = SerializedParagraphNode & { style?: string };

export function $createCustomParagraphNode() {
  return $applyNodeReplacement(new CustomParagraphNode());
}
