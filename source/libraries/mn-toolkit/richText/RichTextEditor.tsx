import { classNames, isEmpty, logger } from 'mn-tools';
import { ButtonIcon } from '../button';
import { ColorPicker } from '../colorPicker';
import { Containable, IContainableProps, IContainableState } from '../containable';
import { HorizontalStack } from '../container';
import { TForegroundColor, TBackgroundColor } from '../themeSettings';
import { ReactElement } from 'react';

const log = logger('RichTextEditor');

const EMPTY_VALUE = '<p><br/></p>';

export type TRichTextToolId =
  | 'bold'
  | 'blockquote'
  | 'italic'
  | 'underline'
  | 'color'
  | 'ul'
  | 'ol'
  | 'indent'
  | 'unindent'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'paragraph'
  | 'unformat'
  | 'link'
  | 'unlink'
  | 'alignCenter'
  | 'alignLeft';

export interface IRichTextEditorProps extends IContainableProps {
  defaultValue?: string;
  toolsSettings?: { [key in TRichTextToolId]: boolean };
  textColors?: TForegroundColor[];
  placeholder?: string;
  bg?: TBackgroundColor;
  onChange?: (value: string) => void | Promise<void>;
  onFocus?: (event: React.FocusEvent) => void | Promise<void>;
  onSelectionChanged?: (selection: Selection) => void;
}

export interface IRichtextEditorState extends IContainableState {}

export class RichTextEditor extends Containable<IRichTextEditorProps, IRichtextEditorState> {
  private _element!: HTMLElement;
  private _editor!: HTMLElement;
  private _hasbeensetup!: boolean;
  private _focus!: boolean;
  private _placeholder!: boolean;
  private _value!: string;
  private _selectionTimeout!: NodeJS.Timeout;
  private palettePopoverId!: string;

  private constructor(props: IRichTextEditorProps) {
    super(props);
  }

  private getCurrentSelectionRect(): DOMRect | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null; // Aucune sélection actuelle
    }
    const range = selection.getRangeAt(0);
    return range.getBoundingClientRect();
  }

  public static get defaultProps(): Partial<IRichTextEditorProps> {
    return {
      ...super.defaultProps,
      placeholder: '<br/>',
      toolsSettings: {
        bold: true,
        italic: true,
        underline: true,
        color: true,
        blockquote: true,
        ul: true,
        ol: true,
        indent: true,
        unindent: true,
        h1: true,
        h2: true,
        h3: true,
        paragraph: true,
        alignCenter: true,
        alignLeft: true,
        unformat: true,
        link: true,
        unlink: true,
      },
      textColors: ['primary', 'secondary', 'tertiary', 'positive', 'negative', 'neutral', 'warning', 'info'],
    };
  }

  public componentDidUpdate(prevProps: IRichTextEditorProps) {
    if (prevProps === this.props) return;
    if (!this.isEmpty(this.props.defaultValue!)) {
      this._value = this.props.defaultValue!;
      this.setValueToEditor(this._value);
    }
  }

  public componentDidMount() {
    log.debug('componentDidMount');
    if (this._hasbeensetup) return;

    this._editor.classList.add('mn-rich-text');
    this._editor.contentEditable = 'true';
    this._hasbeensetup = true;
    document.addEventListener('selectionchange', this.onDocumentSelectionChange);
    document.execCommand('defaultParagraphSeparator', false, 'p');

    this._value = EMPTY_VALUE;
    this.setValueToEditor(this._value);

    if (!this.isEmpty(this.props.defaultValue!)) {
      this._value = this.props.defaultValue!;
      this.setValueToEditor(this._value);
    }

    if (this.isEmpty(this._editor.textContent!) && !this.isEmpty(this.props.placeholder!)) {
      this._placeholder = true;
      this._value = EMPTY_VALUE;
      this.setPlaceHolderToEditor();
    }
  }

  public componentWillUnmount() {
    document.removeEventListener('selectionchange', this.onDocumentSelectionChange);
  }

  private onDocumentSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection) return;
    if (selection.type === 'Caret') {
      log.debug('Selection is caret, leaving');
      app.$popover.removeAll();
      return;
    }
    if (selection.rangeCount === 0) return; // Il n'y a pas de sélection

    let range = selection.getRangeAt(0);
    let commonAncestorContainer = range.commonAncestorContainer;
    let containingElement =
      commonAncestorContainer.nodeType === 3 ? commonAncestorContainer.parentNode : commonAncestorContainer;

    // Recherche si containingElement est un enfant de this._editor
    while (containingElement) {
      if (containingElement === this._editor) {
        this.applyDocumentSelectionChanged();
        return;
      }
      containingElement = containingElement.parentNode;
    }
  };

  private removeEmptyParagraphs(str: string) {
    log.debug('removeEmptyParagraphs - start string', str);
    const result = str.replace(/<p[^>]*>(?:\s|&nbsp;|<br>|<br\/>)*<\/p>/gi, '');
    log.debug('removeEmptyParagraphs - end string', result);
    return result;
  }

  private isEmpty(value: string) {
    return isEmpty(value) || isEmpty(this.removeEmptyParagraphs(value));
  }

  private removeAttributes(node: HTMLElement) {
    if (node.attributes) {
      for (let i = 0; i < node.attributes.length; i++) {
        const attrib = node.attributes.item(i);
        if (attrib) node.removeAttribute(attrib.name);
      }
    }
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        let child = node.childNodes.item(i);
        if (child.nodeName === 'META') {
          node.removeChild(child);
        } else if (child.nodeName === 'SPAN') {
          const textNode = document.createTextNode(child.textContent!);
          node.appendChild(textNode);
          node.replaceChild(textNode, child);
        } else if (child.nodeType === Node.COMMENT_NODE) {
          node.removeChild(child);
        } else node.childNodes.forEach((child) => this.removeAttributes(child as HTMLElement));
      }
    }
  }

  private onPaste(e: React.ClipboardEvent | null) {
    if (!e) return;

    e.preventDefault();

    if (!e.clipboardData) return;

    const types = e.clipboardData.types;
    log.debug('Types Disponibles:', types);

    if (types.includes('text/html')) {
      this.pasteAsHtml(e.clipboardData);
    } else if (types.includes('text/plain')) {
      this.pasteAsText(e.clipboardData);
    } else {
      log.error(types);
      log.error('Types not supported');
    }
  }

  private pasteAsHtml(data: DataTransfer) {
    const html = data.getData('text/html');
    if (html.indexOf('content="Microsoft PowerPoint') !== -1) return this.pasteAsText(data);
    function clear(element: Element) {
      Array.from(element.children).forEach((child) => clear(child));
      if (element.nodeType === Node.COMMENT_NODE || element instanceof HTMLMetaElement) element.remove();
      const attributes = element.attributes;
      while (attributes.length) element.removeAttribute(attributes.item(0)!.name);
      return element;
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    Array.from(doc.children).forEach((child) => clear(child));
    document.execCommand('insertHtml', false, doc.body.innerHTML);
  }

  private pasteAsText(data: DataTransfer) {
    let text = data.getData('text/plain');
    text = text.replace(/\r\n/g, '\n');
    document.execCommand('insertText', false, text);
  }

  private onBlur(e: React.FocusEvent) {
    this._element.classList.remove('mn-focus');
    this._focus = false;
    if (isEmpty(this._editor.textContent)) {
      this._placeholder = true;
      this.setPlaceHolderToEditor();
    }
    if (!this._focus && !app.$popover.visible) {
      app.$popover.removeAll();
      window.getSelection()?.removeAllRanges();
    }
    if (this.props.onBlur) app.$errorManager.handlePromise(this.props.onBlur(e));
  }

  private setPlaceHolderToEditor() {
    let value = `<span class="placeholder">${this.props.placeholder}</span>`;
    let current = this._editor.innerHTML;
    if (current !== value) {
      this._editor.innerHTML = value;
    }
  }

  private onFocus(e: React.FocusEvent | null) {
    this._element.classList.add('mn-focus');
    this._focus = true;
    if (this._placeholder) {
      this.setValueToEditor(this._value);
      this._placeholder = false;
    }
    if (this.props.onFocus) app.$errorManager.handlePromise(this.props.onFocus(e!));
  }

  private onInput() {
    log.debug('onInput -', this._editor.innerHTML);
    if (this.props.onChange) {
      // this._value = this.removeEmptyParagraphs(this._editor.innerHTML);
      this._value = `${this._editor.innerHTML}`;
      this.props.onChange(this._value);
    }
  }

  public shouldComponentUpdate() {
    return false;
  }

  private setValueToEditor(value: string) {
    let current = this._editor.innerHTML;
    if (current !== value) {
      log.debug('seting value to editor', value);
      this._editor.innerHTML = value;
    }
  }

  private applyDocumentSelectionChanged() {
    log.debug('selection changed');
    const selection = document.getSelection();
    if (!selection) return;

    const tools = this.getTools();
    if (!tools.length) return;

    clearTimeout(this._selectionTimeout);
    this._selectionTimeout = setTimeout(() => {
      if (this.props.onSelectionChanged) this.props.onSelectionChanged(selection);
      const targetRectangle = this.getCurrentSelectionRect();
      if (targetRectangle && !app.$popover.visible) {
        app.$popover.bubble(undefined!, {
          ignoreFocus: true,
          targetRectangle,
          content: (
            <HorizontalStack wrap gutter>
              {tools}
            </HorizontalStack>
          ),
          height: 80,
          width: 388,
        });
      }
    }, 200);
  }

  public doFocus(e: FocusEvent): void | boolean {
    let a = this._editor;
    if (a) a.focus();

    if (e) {
      e.preventDefault();
      return false;
    }
  }

  private getToolIds() {
    return Object.keys(this.props.toolsSettings!).filter((x) => !!this.props.toolsSettings![x as TRichTextToolId]);
  }

  public renderClasses() {
    const classes = super.renderClasses();
    classes['mn-rich-text-editor'] = true;
    classes['mn-focus'] = this._focus;
    if (this.props.bg) classes[`mn-bg-${this.props.bg}`] = true;
    return classes;
  }

  public render() {
    return (
      <div
        id={this.props.nodeId}
        title={this.props.hint}
        ref={(element) => {
          if (element) this._element = element;
        }}
        className={classNames(this.renderClasses())}
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex, jsx-a11y/tabindex-no-positive
        tabIndex={100}
      >
        <div
          // setTimeout nécessaire pour que les document.execCommand aient la possibilité
          // d'effectuer des manipulations avant que onInput soit créé, par exemple ce que fait onLink()
          onInput={() => setTimeout(() => this.onInput())}
          onFocus={(e) => this.onFocus(e)}
          onBlur={(e) => this.onBlur(e)}
          onPaste={(e) => this.onPaste(e)}
          onClick={this.props.onTap ? (e) => app.$errorManager.handlePromise(this.props.onTap!(e)) : undefined}
          ref={(c) => {
            if (c && this._editor !== c) {
              this._editor = c;
            }
          }}
          className='editor'
        />
      </div>
    );
  }

  public getTools(): ReactElement[] {
    return this.getToolIds().map((id) => this.getTool(id as TRichTextToolId)) as ReactElement[];
  }

  private getTool(id: TRichTextToolId): ReactElement | undefined {
    if (!document) return undefined;
    const selection = document.getSelection();
    if (!selection) return;

    let range = selection.type === 'Range';
    range = true; // FIXME

    let tool!: ReactElement;
    switch (id) {
      case 'bold':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-bold'
            hint='Passer la sélection en gras'
            onTap={() => this.doBold()}
          />
        );
        break;

      case 'blockquote':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-blockquote'
            hint='Passer la sélection en citation'
            onTap={() => this.doBlockQuote()}
          />
        );
        break;

      case 'italic':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-italic'
            hint='Passer la sélection en italique'
            onTap={() => this.doItalic()}
          />
        );
        break;

      case 'underline':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-underline'
            hint='Souligner la sélection'
            onTap={() => this.doUnderline()}
          />
        );
        break;

      case 'color':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-color'
            hint='Choisir la couleur du texte'
            onTap={(e) => this.showColors(e)}
          />
        );
        break;

      case 'ul':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-ul'
            hint='Transformer en liste à puces'
            onTap={() => this.doInsertUnorderedList()}
          />
        );
        break;

      case 'ol':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-ol'
            hint='Transformer en liste numérotée'
            onTap={() => this.doInsertOrderedList()}
          />
        );
        break;

      case 'indent':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-indent'
            hint='Indenter la sélection'
            onTap={() => this.doIndent()}
          />
        );
        break;

      case 'h1':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-header-1'
            hint='Passer en titre 1'
            onTap={() => this.doH1()}
          />
        );
        break;

      case 'h2':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-header-2'
            hint='Passer en titre 2'
            onTap={() => this.doH2()}
          />
        );
        break;

      case 'h3':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-header-3'
            hint='Passer en titre 3'
            onTap={() => this.doH3()}
          />
        );
        break;

      case 'paragraph':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-paragraph'
            hint='Passer en paragraphe'
            onTap={() => this.doNormal()}
          />
        );
        break;

      case 'alignLeft':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-align-left'
            hint='Aligner à gauche'
            onTap={() => this.doAlignLeft()}
          />
        );
        break;

      case 'alignCenter':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-align-center'
            hint='Centrer'
            onTap={() => this.doAlignCenter()}
          />
        );
        break;

      case 'unformat':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-unformat'
            hint='Retirer le formatage'
            onTap={() => this.doRemoveFormat()}
          />
        );
        break;

      case 'link':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-link'
            hint='Créer un lien à partir de la sélection'
            onTap={() => this.doLink()}
          />
        );
        break;

      case 'unlink':
        tool = (
          <ButtonIcon
            key={id}
            disabled={!range}
            icon='toolkit-format-unlink'
            hint='Supprimer ce lien'
            onTap={() => this.doUnlink()}
          />
        );
        break;
    }
    return tool;
  }

  private async showColors(event: React.MouseEvent) {
    this.palettePopoverId = await app.$popover.bubble(event, {
      height: 52,
      width: 275,
      content: <ColorPicker colors={this.props.textColors} onSelectColor={(c) => this.doColor(c)} />,
    });
  }

  private doColor(id: TForegroundColor) {
    // Ferme le popover du palette
    app.$popover.remove(this.palettePopoverId);

    // Récupère la sélection courante
    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    // Récupère la plage de texte sélectionné
    const range = selection.getRangeAt(0);

    // Convertit la plage sélectionnée en texte
    const selectedText = range.toString();

    // Vérifie si du texte a été sélectionné, sinon retourne
    if (selectedText.length === 0) return;

    let newNode: HTMLSpanElement | Text;

    // Si un ID est donné
    if (id) {
      // Crée un nouvel élément de type <span>
      newNode = document.createElement('span');

      // Ajoute des classes à nouvel élément <span>
      newNode.classList.add('mn-rich-text-custom-color');
      newNode.classList.add(`mn-rich-text-custom-color-${id || 'none'}`);

      // Définit le texte du nouvel élément <span>
      newNode.textContent = selectedText;
    } else {
      // Crée un nouveau nœud texte
      newNode = document.createTextNode(selectedText);
    }

    // Récupère le nœud parent du début et de la fin de la plage de sélection
    const startParentNode = range.startContainer.parentNode!;
    const endParentNode = range.endContainer.parentNode!;

    // Vérifie si le début et la fin de la sélection sont dans le même nœud parent <span>
    const inSingleParentNode = startParentNode === endParentNode;

    // Vérifie si le décalage de début est au début d'un élément <span> et si le décalage de fin est à la fin d'un élément <span>
    const isStartOfSpanParent = range.startOffset === 0 && startParentNode.nodeName === 'SPAN';
    const isEndOfSpanParent =
      range.endOffset === endParentNode.textContent?.length && endParentNode.nodeName === 'SPAN';

    if (isStartOfSpanParent && isEndOfSpanParent) {
      // Si le début et la fin de la sélection sont dans le même nœud parent <span>
      if (inSingleParentNode) {
        // Remplace l'élément <span> existant par le nouvel élément
        const spanToReplace = range.startContainer.parentNode!;
        spanToReplace.parentNode!.replaceChild(newNode, spanToReplace);
      } else {
        // Insère le nouvel élément avant l'élément <span> de début
        const startSpan = range.startContainer.parentNode!;
        const parentNode = startSpan.parentElement!;
        parentNode.insertBefore(newNode, startSpan);

        // Supprime les éléments <span> existants avec la même classe à l'intérieur du nœud sélectionné
        const selectedNode = range.commonAncestorContainer.parentElement!;
        const existingSpans = selectedNode.querySelectorAll('span.mn-rich-text-custom-color');
        existingSpans.forEach((span) => {
          if (span !== newNode) parentNode.removeChild(span);
        });
      }
    } else {
      // Si la sélection traverse plusieurs éléments <span>

      // Récupère le nœud sélectionné (ancêtre commun)
      const selectedNode = range.commonAncestorContainer.parentElement!;

      // Récupère les éléments <span> existants avec la même classe à l'intérieur du nœud sélectionné
      const existingSpans = selectedNode.querySelectorAll('span.mn-rich-text-custom-color');

      existingSpans.forEach((span) => {
        // Crée une plage pour l'élément <span> actuel
        const spanRange = document.createRange();
        spanRange.selectNode(span);

        // Vérifie s'il y a intersection entre les plages
        const intersection = this.getRangeIntersection(range, spanRange);

        if (intersection && intersection.toString().length > 0) {
          // Clone l'élément <span> et divise le texte aux points d'intersection
          const spanClone = span.cloneNode(true);
          const remainingText = document.createElement('span');
          remainingText.textContent = spanClone.textContent!.substring(intersection.endOffset);
          spanClone.textContent = spanClone.textContent!.substring(0, intersection.startOffset);

          // Insère le span cloné avant l'élément original
          if (spanClone.textContent.length > 0) {
            span.parentNode!.insertBefore(spanClone, span);
          }

          // Insère le reste du texte après l'élément <span> original
          if (remainingText.textContent.length > 0) {
            span.parentNode!.insertBefore(remainingText, span.nextSibling);
          }
        }
      });

      // Supprime le contenu de la
      range.deleteContents();
      range.insertNode(newNode);
    }
    this.onInput();
  }

  private getRangeIntersection(range1: Range, range2: Range): Range | null {
    const compareResult1 = range1.compareBoundaryPoints(Range.START_TO_END, range2);
    const compareResult2 = range1.compareBoundaryPoints(Range.END_TO_START, range2);
    if (compareResult1 <= 0 && compareResult2 >= 0) {
      const intersection = document.createRange();
      intersection.setStart(
        range1.startContainer,
        range1.startOffset > range2.startOffset ? range1.startOffset : range2.startOffset
      );
      intersection.setEnd(
        range1.endContainer,
        range1.endOffset < range2.endOffset ? range1.endOffset : range2.endOffset
      );
      return intersection;
    } else {
      return null;
    }
  }

  public doUnlink() {
    document.execCommand('unlink', false, undefined);
  }

  public doLink() {
    let url = window.prompt("Quelle est l'URL de votre lien ?");
    if (!url) return;
    // Appliquer le execCommand pour créer un lien
    document.execCommand('createLink', false, url);

    // Obtenir la sélection actuelle
    const selection = window.getSelection();
    if (!selection) return;

    if (!selection.rangeCount) return; // Aucune sélection

    // Obtenir le premier élément de la sélection
    let selectedElement = selection.getRangeAt(0).commonAncestorContainer as HTMLAnchorElement;

    // Assurez-vous que l'élément sélectionné est un élément de lien (et non un noeud texte)
    if (selectedElement.nodeType === 3) {
      selectedElement = selectedElement.parentNode as HTMLAnchorElement;
    }

    // Vérifier si l'élément sélectionné est un lien
    if (selectedElement.tagName === 'A') {
      // Modifier le lien pour qu'il s'ouvre dans un nouvel onglet
      selectedElement.target = '_blank';
      selectedElement.rel = 'noopener noreferrer';
    }
  }

  public doRemoveFormat() {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    const fragment = range.extractContents();
    // Créer un nouveau noeud de texte avec le contenu textuel du fragment
    const textNode = document.createTextNode(fragment.textContent!);
    // Insérer le nouveau noeud de texte dans la plage
    range.insertNode(textNode);
    this.onInput();
  }

  public doH1() {
    document.execCommand('removeFormat', false, undefined);
    document.execCommand('formatBlock', false, '<h2>');
  }
  public doH2() {
    document.execCommand('removeFormat', false, undefined);
    document.execCommand('formatBlock', false, '<h3>');
  }
  public doH3() {
    document.execCommand('removeFormat', false, undefined);
    document.execCommand('formatBlock', false, '<h4>');
  }
  public doNormal() {
    document.execCommand('removeFormat', false, undefined);
    document.execCommand('formatBlock', false, '<p>');
  }
  public doAlignCenter() {
    document.execCommand('justifyCenter', true, undefined);
  }
  public doAlignLeft() {
    document.execCommand('justifyLeft', true, undefined);
  }
  public doOutdent() {
    document.execCommand('outdent', false, undefined);
  }
  public doIndent() {
    document.execCommand('indent', false, undefined);
  }
  public doInsertOrderedList() {
    document.execCommand('insertOrderedList', false, undefined);
  }
  public doInsertUnorderedList() {
    document.execCommand('insertUnorderedList', false, undefined);
  }
  public doUnderline() {
    document.execCommand('underline', false, undefined);
  }
  public doItalic() {
    document.execCommand('italic', false, undefined);
  }
  public doBlockQuote() {
    document.execCommand('indent', false, undefined);
    this.removeAttributes(this._editor);
  }
  public doBold() {
    document.execCommand('bold', false, undefined);
  }
}
