import { createRef } from 'react';
import { $getRoot, CLEAR_HISTORY_COMMAND, ParagraphNode, TextNode, LexicalEditor, EditorState } from 'lexical';
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode } from '@lexical/link';
import { Containable, IContainableProps, IContainableState, TDidUpdateSnapshot } from '../containable';
import { ILexicalRichTextEditorContentProps, LexicalRichTextEditorContent } from './LexicalRichTextEditorContent';
import { $createCustomParagraphNode, CustomParagraphNode } from './CustomParagraphNode';
import { $createCustomTextNode, CustomTextNode } from './CustomTextNode';
import { IToolbarPluginProps, ToolbarPlugin } from './ToolbarPlugin';
import { OverlayToolbar } from './OverlayToolbar';
import { TRichTextBaseToolId } from '.';

const EMPTY_EDITOR_STATE: ReturnType<EditorState['toJSON']> = {
  root: {
    type: 'root',
    version: 1,
    format: '',
    indent: 0,
    direction: null,
    children: [],
  },
};
const EMPTY_EDITOR_STATE_JSON = JSON.stringify(EMPTY_EDITOR_STATE);

const defaultInitialConfig: InitialConfigType = {
  namespace: 'MNLexicalRichTextEditor',
  theme: {
    text: {
      bold: 'bold-weight',
      italic: 'italic-style',
      underline: 'underline-decoration',
      strikethrough: 'strikethrough-decoration',
    },
  },
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    CustomParagraphNode,
    CustomTextNode,
    {
      replace: ParagraphNode,
      with: (_node: ParagraphNode) => $createCustomParagraphNode(),
      withKlass: CustomParagraphNode,
    },
    {
      replace: TextNode,
      with: (node: TextNode) => $createCustomTextNode(node.__text),
      withKlass: CustomTextNode,
    },
  ],
  onError: (error: Error) => console.error(error),
};

const defaultToolbarSettings: { [key in TRichTextBaseToolId]: boolean } = {
  undo: true,
  redo: true,
  bold: true,
  italic: true,
  underline: true,
  strikethrough: true,
  color: true,
  backgroundColor: true,
  ul: true,
  ol: true,
  indent: true,
  outdent: true,
  blockquote: true,
  h1: true,
  h2: true,
  h3: true,
  paragraph: true,
  alignLeft: true,
  alignCenter: true,
  alignRight: true,
  alignJustify: true,
  link: true,
};

export interface IRichTextEditorProps<TOOL_IDS extends string = TRichTextBaseToolId> extends IContainableProps {
  inputId?: string;
  inputName?: string;
  spellCheck: boolean;
  initialConfig: InitialConfigType;
  toolbarMode: 'fixed' | 'ghost';
  toolbarOptions: IToolbarPluginProps<TOOL_IDS>['options'];
  toolbarColors?: IToolbarPluginProps<TOOL_IDS>['colors'];
  toolbarCustomTools?: IToolbarPluginProps<TOOL_IDS>['customTools'];
  placeholder: ILexicalRichTextEditorContentProps['placeholder'];
  value: string;
  onChange: (value: string) => void | Promise<void>;
}

interface IRichTextEditorState extends IContainableState {
  editorState?: EditorState;
  lastHtmlValue: string;
  ghostToolbarVisible?: boolean;
}

export class RichTextEditor<TOOL_IDS extends string = TRichTextBaseToolId> extends Containable<
  IRichTextEditorProps<TOOL_IDS>,
  IRichTextEditorState
> {
  private editor?: LexicalEditor;
  private overlayToolbarRef = createRef<HTMLDivElement>();

  public static override get defaultProps(): Omit<
    IRichTextEditorProps,
    'value' | 'onChange' | 'onEditorInit' | 'toolbarOptions'
  > & { toolbarOptions: { [key in TRichTextBaseToolId]: boolean } } {
    return {
      ...super.defaultProps,
      initialConfig: defaultInitialConfig,
      toolbarOptions: defaultToolbarSettings,
      toolbarMode: 'ghost',
      placeholder: 'Écrivez ici...',
      spellCheck: true,
    };
  }

  public constructor(props: IRichTextEditorProps<TOOL_IDS>) {
    super(props);
    this.state = { ...this.state, lastHtmlValue: props.value };
  }

  /**
   * Ensures the value is wrapped in valid HTML block elements that Lexical can use as root nodes.
   * Lexical's root can only contain element or decorator nodes, not inline elements like span, strong, etc.
   * Valid root elements: p, h1-h6, blockquote, ul, ol, etc.
   * If the value contains only inline elements, wraps it in a paragraph.
   */
  private ensureValidHtmlRoot(value: string): string {
    if (!value) return '<p></p>';

    const trimmedValue = value.trim();
    if (!trimmedValue) return '<p></p>';

    // Check if the value starts with an HTML tag
    if (!trimmedValue.startsWith('<')) {
      // If it's raw text, wrap it in a paragraph
      return `<p>${value}</p>`;
    }

    // Parse the HTML to check if the root elements are valid for Lexical
    const parser = new DOMParser();
    const dom = parser.parseFromString(trimmedValue, 'text/html');
    const bodyChildren = Array.from(dom.body.childNodes);

    // Valid block elements that can be root nodes in Lexical
    const validBlockElements = new Set([
      'P',
      'H1',
      'H2',
      'H3',
      'H4',
      'H5',
      'H6',
      'BLOCKQUOTE',
      'UL',
      'OL',
      'DIV',
      'ARTICLE',
      'SECTION',
    ]);

    // Check if all direct children of body are valid block elements or text
    const hasInvalidElements = bodyChildren.some((node) => {
      // Text nodes are OK
      if (node.nodeType === 3) {
        return node.textContent?.trim() === '';
      }
      // Element nodes should be valid block elements
      if (node.nodeType === 1) {
        return !validBlockElements.has((node as Element).tagName);
      }
      return false;
    });

    if (hasInvalidElements) {
      // If there are invalid elements (like span, strong, etc.), wrap everything in a paragraph
      return `<p>${trimmedValue}</p>`;
    }

    return trimmedValue;
  }

  public override componentDidUpdate(
    prevProps: Readonly<IRichTextEditorProps<TOOL_IDS>>,
    prevState: Readonly<IRichTextEditorState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (!this.editor) return;
    if (prevProps.value === this.props.value) return;
    if (this.props.value === this.state.lastHtmlValue) return;

    const serializedBase = EMPTY_EDITOR_STATE_JSON;
    const editorState = this.editor.parseEditorState(serializedBase, () => {
      if (!this.editor) return;
      const validHtml = this.ensureValidHtmlRoot(this.props.value);
      const dom = new DOMParser().parseFromString(validHtml, 'text/html');
      const root = $getRoot();
      root.clear();
      root.append(...$generateNodesFromDOM(this.editor, dom));
    });
    this.setState({ editorState, lastHtmlValue: this.props.value }, () =>
      this.editor!.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
    );
  }

  /**
   * Returns true if the editor is empty (no real content), false if there is any text or non-empty node.
   */
  public isEmpty(editorState = this.state.editorState): boolean {
    if (!editorState) return false;
    let isEmpty = true;
    editorState.read(() => {
      const root = $getRoot();
      // The editor is empty if:
      // - it has no children
      // - or it only has a single child which is an empty paragraph/line/etc.
      if (root.getChildrenSize() === 0) {
        isEmpty = true;
        return;
      }
      if (root.getChildrenSize() === 1) {
        const child = root.getFirstChild();
        // For paragraphs or blockquotes or other elements that are empty
        if (child && typeof child.getTextContent === 'function' && child.getTextContent().trim() === '') {
          isEmpty = true;
          return;
        }
      }
      // If we reach this point, there is some non-empty content
      isEmpty = false;
    });
    return isEmpty;
  }

  private handleFocusIn = (_event: React.FocusEvent<HTMLDivElement>) => {
    if (this.props.toolbarMode !== 'ghost' || this.state.ghostToolbarVisible) return;
    this.setState({ ghostToolbarVisible: true });
  };

  private handleFocusOut = (_event: React.FocusEvent<HTMLDivElement>) => {
    if (this.props.toolbarMode !== 'ghost') return;

    window.setTimeout(() => {
      const root = this.base.current;
      const active = document.activeElement;
      if (!root || !active) return;

      const isInOverlayToolbar = !!this.overlayToolbarRef.current && this.overlayToolbarRef.current.contains(active);
      const isInPopover = !!active.closest('.mn-popover');

      if (isInPopover || isInOverlayToolbar || root.contains(active)) {
        return; // focus still in editor or a popover
      }

      if (this.state.ghostToolbarVisible) {
        this.setState({ ghostToolbarVisible: false });
      }
    }, 0);
  };

  public override renderAttributes() {
    const attributes = super.renderAttributes();
    if (this.props.toolbarMode === 'ghost') {
      attributes.onFocusCapture = this.handleFocusIn;
      attributes.onBlurCapture = this.handleFocusOut;
    }
    return attributes;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-rich-text-editor'] = true;
    if (this.props.toolbarMode) {
      classes[`toolbar-${this.props.toolbarMode}-mode`] = true;
    }
    if (this.props.toolbarMode === 'ghost' && this.state.ghostToolbarVisible) {
      classes['ghost-toolbar-visible'] = true;
    }
    return classes;
  }

  public override render() {
    return (
      <LexicalComposer initialConfig={this.props.initialConfig}>
        <div ref={this.base} {...this.renderAttributes()}>
          {this.renderToolbar()}
          <LexicalRichTextEditorContent
            inputId={this.props.inputId}
            inputName={this.props.inputName}
            spellCheck={this.props.spellCheck}
            placeholder={this.props.placeholder}
            value={this.state.editorState}
            onChange={this.onChange}
            onEditorInit={(editor) => this.onEditorInit(editor)}
          />
          {this.props.children}
        </div>
      </LexicalComposer>
    );
  }

  private renderToolbar() {
    const toolbar = (
      <ToolbarPlugin
        options={this.props.toolbarOptions}
        colors={this.props.toolbarColors}
        customTools={this.props.toolbarCustomTools}
      />
    );
    if (this.props.toolbarMode === 'fixed') return toolbar;
    return (
      <OverlayToolbar
        ref={this.overlayToolbarRef}
        anchor={this.base.current}
        visible={!!this.state.ghostToolbarVisible}
      >
        <ToolbarPlugin
          options={this.props.toolbarOptions}
          colors={this.props.toolbarColors}
          customTools={this.props.toolbarCustomTools}
        />
      </OverlayToolbar>
    );
  }

  private onEditorInit = (editor: LexicalEditor) => {
    this.editor = editor;

    let serializedState: ReturnType<EditorState['toJSON']>;
    this.editor.update(() => {
      if (!this.editor) return;

      const parser = new DOMParser();
      const validHtml = this.ensureValidHtmlRoot(this.state.lastHtmlValue);
      const dom = parser.parseFromString(validHtml, 'text/html');
      const root = $getRoot();

      // Clear any default content and insert nodes parsed from HTML
      root.clear();
      const nodes = $generateNodesFromDOM(this.editor, dom);
      root.append(...nodes);

      // Serialize the new state for parsing
      serializedState = this.editor.getEditorState().toJSON();

      // parseEditorState expects a string or a serialized JSON object
      this.setState({ editorState: this.editor.parseEditorState(serializedState) });
    });
  };

  private onChange = async (editorState: EditorState) => {
    if (!this.editor) return;

    let lastHtmlValue: string;
    if (this.isEmpty(editorState)) lastHtmlValue = '';
    else lastHtmlValue = editorState.read(() => $generateHtmlFromNodes(this.editor!));

    // OnChange is not just called when the text actually changes
    const shouldNotifyParent = this.state.lastHtmlValue !== lastHtmlValue;
    await this.setStateAsync({ editorState, lastHtmlValue });
    if (shouldNotifyParent) await this.props.onChange(this.state.lastHtmlValue);
  };
}
