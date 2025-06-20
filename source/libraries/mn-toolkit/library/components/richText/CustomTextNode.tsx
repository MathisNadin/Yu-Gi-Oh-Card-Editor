import {
  TextNode,
  DOMConversionMap,
  DOMConversion,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalEditor,
  SerializedTextNode,
  $applyNodeReplacement,
} from 'lexical';
import { mergeStyle } from '.';

export class CustomTextNode extends TextNode {
  public static override getType() {
    return 'custom-text';
  }

  public static override clone(node: CustomTextNode): CustomTextNode {
    return new CustomTextNode(node.__text, node.__key);
  }

  /** Import text node from DOM: read styles from span, strong, mark, u, b, i, etc. */
  public static override importDOM(): DOMConversionMap | null {
    // Helper to check if any inline style is present
    const extractStyles = (domNode: HTMLElement) => {
      let color: string | undefined;
      let backgroundColor: string | undefined;

      // Use CSSStyleDeclaration if possible
      if (domNode.style) {
        if (domNode.style.color) color = domNode.style.color;
        if (domNode.style.backgroundColor) backgroundColor = domNode.style.backgroundColor;
        // Also check background shorthand
        if (!backgroundColor && domNode.style.background) backgroundColor = domNode.style.background;
      }

      // Fallback for attributes (in case of SSR)
      const styleAttr = domNode.getAttribute('style');
      if (styleAttr) {
        styleAttr.split(';').forEach((rule) => {
          const [key, value] = rule.split(':').map((s) => s.trim());
          if (key === 'color' && value) color = value;
          if ((key === 'background' || key === 'background-color') && value) backgroundColor = value;
        });
      }

      const styles: string[] = [];
      if (color) styles.push(`color: ${color}`);
      if (backgroundColor) styles.push(`background-color: ${backgroundColor}`);
      return styles.join('; ');
    };

    // Conversion applies to multiple HTML elements
    const tags = ['span', 'mark', 'b', 'strong', 'i', 'em', 'u', 's', 'code', 'sup', 'sub'];
    const map: DOMConversionMap = {};
    for (const tag of tags) {
      map[tag] = (domNode: HTMLElement): DOMConversion | null => {
        // Ignore empy elements
        if (!domNode.textContent?.trim().length) return null;
        return {
          priority: 1,
          conversion: (domNode: HTMLElement): DOMConversionOutput => {
            const style = extractStyles(domNode);
            const text = domNode.textContent ?? '';

            // Only create node when there is text
            if (!text) return { node: null };

            const node = $createCustomTextNode(text);
            if (style) node.setStyle(style);

            // Handle base formats
            if (tag === 'b' || tag === 'strong') node.setFormat('bold');
            else if (tag === 'i' || tag === 'em') node.setFormat('italic');
            else if (tag === 'u') node.setFormat('underline');
            else if (tag === 's') node.setFormat('strikethrough');
            else if (tag === 'code') node.setFormat('code');
            else if (tag === 'sup') node.setFormat('superscript');
            else if (tag === 'sub') node.setFormat('subscript');

            return { node };
          },
        };
      };
    }
    return map;
  }

  /** Export DOM, merging custom style with any inherited style attribute */
  public override exportDOM(editor: LexicalEditor): DOMExportOutput {
    const { element } = super.exportDOM(editor);
    if (element instanceof HTMLElement) {
      const style = this.getStyle();
      if (style) {
        element.setAttribute('style', mergeStyle(element.getAttribute('style'), style) ?? '');
      }
    }
    return { element };
  }

  /** Import from JSON: updateFromJSON already restores style */
  public static override importJSON(serializedNode: SerializedTextNode): CustomTextNode {
    return $createCustomTextNode().updateFromJSON(serializedNode);
  }

  /** Export node to JSON, including custom style */
  public override exportJSON() {
    const json = super.exportJSON();
    const style = this.getStyle();
    if (style) json.style = style;
    return json;
  }
}

export function $createCustomTextNode(text?: string) {
  return $applyNodeReplacement(new CustomTextNode(text ?? ''));
}
