import { createRef } from 'react';
import { $getRoot, CLEAR_HISTORY_COMMAND, ParagraphNode, TextNode } from 'lexical';
import { LexicalEditor } from 'lexical/LexicalEditor';
import { EditorState } from 'lexical/LexicalEditorState';
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
    };
  }

  public constructor(props: IRichTextEditorProps<TOOL_IDS>) {
    super(props);
    this.state = { ...this.state, lastHtmlValue: props.value };
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
      const dom = new DOMParser().parseFromString(this.props.value || '<p></p>', 'text/html');
      const root = $getRoot();
      root.clear();
      root.append(...$generateNodesFromDOM(this.editor!, dom));
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
      const active = document.activeElement as HTMLElement | null;
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
            placeholder={this.props.placeholder}
            value={this.state.editorState}
            onChange={this.onChange}
            onEditorInit={this.onEditorInit}
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

  private onEditorInit = async (editor: LexicalEditor) => {
    this.editor = editor;

    let serializedState: ReturnType<EditorState['toJSON']>;
    this.editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(this.state.lastHtmlValue || '<p></p>', 'text/html');
      const root = $getRoot();

      // Clear any default content and insert nodes parsed from HTML
      root.clear();
      const nodes = $generateNodesFromDOM(this.editor!, dom);
      root.append(...nodes);

      // Serialize the new state for parsing
      serializedState = this.editor!.getEditorState().toJSON();
    });

    // parseEditorState expects a string or a serialized JSON object
    await this.setStateAsync({ editorState: this.editor.parseEditorState(serializedState!) });
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
