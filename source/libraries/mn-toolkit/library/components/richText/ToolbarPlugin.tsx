import { FC, useCallback, useEffect, useState } from 'react';
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  ElementNode,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  LexicalNode,
  OUTDENT_CONTENT_COMMAND,
  ParagraphNode,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import { $setBlocksType, $patchStyleText, $getSelectionStyleValueForProperty } from '@lexical/selection';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  $isListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { HorizontalStack } from '../container';
import { Icon } from '../icon';
import { ColorPicker } from '../colorPicker';
import { IToolbarPluginCustomTool, TRichTextToolId } from '.';

export interface IToolbarPluginProps {
  options: Partial<{ [key in TRichTextToolId]: boolean }>;
  colors?: string[];
  customTools?: IToolbarPluginCustomTool[];
}

const undoRedoGroup: TRichTextToolId[] = ['undo', 'redo'];
const formatGroup: TRichTextToolId[] = ['bold', 'italic', 'underline', 'strikethrough', 'color', 'backgroundColor'];
const blockGroup: TRichTextToolId[] = ['ul', 'ol', 'indent', 'blockquote'];
const structureGroup: TRichTextToolId[] = ['h1', 'h2', 'h3', 'paragraph'];
const alignGroup: TRichTextToolId[] = ['alignLeft', 'alignCenter', 'alignRight', 'alignJustify'];
const linkGroup: TRichTextToolId[] = ['link'];

function isGroupVisible(options: Partial<{ [key in TRichTextToolId]: boolean }>, group: TRichTextToolId[]) {
  return group.some((key) => options[key]);
}

export const ToolbarPlugin: FC<IToolbarPluginProps> = ({ options, colors, customTools }) => {
  const [editor] = useLexicalComposerContext();
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textColor, setTextColor] = useState<string | undefined>(undefined);
  const [bgColor, setBgColor] = useState<string | undefined>(undefined);
  const [isUl, setIsUl] = useState(false);
  const [isOl, setIsOl] = useState(false);
  const [isLink, setIsLink] = useState(false);

  // Update toolbar state based on current selection
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      const color = $getSelectionStyleValueForProperty(selection, 'color') || undefined;
      setTextColor(color);
      const bg = $getSelectionStyleValueForProperty(selection, 'background-color') || undefined;
      setBgColor(bg);

      const node = selection.anchor.getNode();
      let parent = node.getParent();
      let foundUl = false;
      let foundOl = false;
      while (parent) {
        if ($isListNode(parent)) {
          if (parent.getListType() === 'bullet') foundUl = true;
          if (parent.getListType() === 'number') foundOl = true;
        }
        parent = parent.getParent();
      }
      setIsUl(foundUl);
      setIsOl(foundOl);

      const hasLink = selection.getNodes().some((node) => {
        let parent: LexicalNode | null = node;
        while (parent) {
          if ($isLinkNode(parent)) return true;
          parent = parent.getParent?.();
        }
        return false;
      });
      setIsLink(hasLink);
    }
  }, []);

  // Register listeners for selection changes and updates
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateToolbar]);

  // Generic helper
  const setBlockType = (creator: () => ElementNode) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, creator);
      }
    });
  };

  return (
    <HorizontalStack className='mn-rich-text-editor-toolbar' gutter wrap>
      {/* Undo/Redo */}
      {isGroupVisible(options, undoRedoGroup) && (
        <>
          {options.undo && (
            <Icon
              disabled={!canUndo}
              icon='toolkit-undo'
              name='Annuler'
              hint='Annuler'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(UNDO_COMMAND, undefined);
              }}
            />
          )}
          {options.redo && (
            <Icon
              disabled={!canRedo}
              icon='toolkit-redo'
              name='Rétablir'
              hint='Rétablir'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(REDO_COMMAND, undefined);
              }}
            />
          )}
          <div className='mn-toolbar-separator' />
        </>
      )}

      {/* Format */}
      {isGroupVisible(options, formatGroup) && (
        <>
          {options.bold && (
            <Icon
              className={isBold ? 'active' : undefined}
              icon='toolkit-format-bold'
              name='Passer la sélection en gras'
              hint='Passer la sélection en gras'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
              }}
            />
          )}
          {options.italic && (
            <Icon
              className={isItalic ? 'active' : undefined}
              icon='toolkit-format-italic'
              name='Passer la sélection en italique'
              hint='Passer la sélection en italique'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
              }}
            />
          )}
          {options.underline && (
            <Icon
              className={isUnderline ? 'active' : undefined}
              icon='toolkit-format-underline'
              name='Souligner la sélection'
              hint='Souligner la sélection'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
              }}
            />
          )}
          {options.strikethrough && (
            <Icon
              className={isStrikethrough ? 'active' : undefined}
              icon='toolkit-format-strikethrough'
              name='Barré'
              hint='Texte barré'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
              }}
            />
          )}
          {options.color && (
            <Icon
              className={textColor ? 'active' : undefined}
              style={textColor ? { '--current-rich-text-color': textColor } : undefined}
              icon='toolkit-format-color'
              name='Changer la couleur du texte'
              hint='Changer la couleur du texte'
              onTap={(e) => {
                e.preventDefault();
                app.$popover.bubble(e, {
                  onBlur: (e) => e.preventDefault(),
                  content: (
                    <ColorPicker
                      selectedColor={textColor}
                      colors={colors}
                      onSelectColor={(color) => {
                        editor.update(() => {
                          const selection = $getSelection();
                          if (selection) $patchStyleText(selection, { color: color || null });
                        });
                      }}
                    />
                  ),
                });
              }}
            />
          )}
          {options.backgroundColor && (
            <Icon
              className={bgColor ? 'active' : undefined}
              style={bgColor ? { '--current-rich-text-background-color': bgColor } : undefined}
              icon='toolkit-format-background-color'
              name='Changer la couleur de fond'
              hint='Changer la couleur de fond'
              onTap={(e) => {
                e.preventDefault();
                app.$popover.bubble(e, {
                  onBlur: (e) => e.preventDefault(),
                  content: (
                    <ColorPicker
                      selectedColor={bgColor}
                      colors={colors}
                      onSelectColor={(color) => {
                        editor.update(() => {
                          const selection = $getSelection();
                          if (selection) $patchStyleText(selection, { 'background-color': color || null });
                        });
                      }}
                    />
                  ),
                });
              }}
            />
          )}
          <div className='mn-toolbar-separator' />
        </>
      )}

      {/* Block */}
      {isGroupVisible(options, blockGroup) && (
        <>
          {options.ul && (
            <Icon
              className={isUl ? 'active' : undefined}
              icon='toolkit-format-ul'
              name='Transformer en liste à puces'
              hint='Transformer en liste à puces'
              onTap={(e) => {
                e.preventDefault();
                if (isUl) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                else editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
              }}
            />
          )}
          {options.ol && (
            <Icon
              className={isOl ? 'active' : undefined}
              icon='toolkit-format-ol'
              name='Transformer en liste numérotée'
              hint='Transformer en liste numérotée'
              onTap={(e) => {
                e.preventDefault();
                if (isOl) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                else editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
              }}
            />
          )}
          {options.indent && (
            <Icon
              icon='toolkit-format-indent'
              name='Augmenter le retrait'
              hint='Augmenter le retrait'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
              }}
            />
          )}
          {options.indent && (
            <Icon
              icon='toolkit-format-outdent'
              name='Diminuer le retrait'
              hint='Diminuer le retrait'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
              }}
            />
          )}
          {options.blockquote && (
            <Icon
              icon='toolkit-format-blockquote'
              name='Callout'
              hint='Callout'
              onTap={(e) => {
                e.preventDefault();
                setBlockType(() => $createQuoteNode());
              }}
            />
          )}
          <div className='mn-toolbar-separator' />
        </>
      )}

      {/* Structure */}
      {isGroupVisible(options, structureGroup) && (
        <>
          {options.h1 && (
            <Icon
              icon='toolkit-format-header-1'
              name='Titre 1'
              hint='Titre 1'
              onTap={(e) => {
                e.preventDefault();
                setBlockType(() => $createHeadingNode('h1'));
              }}
            />
          )}
          {options.h2 && (
            <Icon
              icon='toolkit-format-header-2'
              name='Titre 2'
              hint='Titre 2'
              onTap={(e) => {
                e.preventDefault();
                setBlockType(() => $createHeadingNode('h2'));
              }}
            />
          )}
          {options.h3 && (
            <Icon
              icon='toolkit-format-header-3'
              name='Titre 3'
              hint='Titre 3'
              onTap={(e) => {
                e.preventDefault();
                setBlockType(() => $createHeadingNode('h3'));
              }}
            />
          )}
          {options.paragraph && (
            <Icon
              icon='toolkit-format-paragraph'
              name='Paragraphe'
              hint='Paragraphe'
              onTap={(e) => {
                e.preventDefault();
                setBlockType(() => new ParagraphNode());
              }}
            />
          )}
          <div className='mn-toolbar-separator' />
        </>
      )}

      {/* Align */}
      {isGroupVisible(options, alignGroup) && (
        <>
          {options.alignLeft && (
            <Icon
              icon='toolkit-format-align-left'
              name='Aligner à gauche'
              hint='Aligner à gauche'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
              }}
            />
          )}
          {options.alignCenter && (
            <Icon
              icon='toolkit-format-align-center'
              name='Centrer'
              hint='Centrer'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
              }}
            />
          )}
          {options.alignRight && (
            <Icon
              icon='toolkit-format-align-right'
              name='Aligner à droite'
              hint='Aligner à droite'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
              }}
            />
          )}
          {options.alignJustify && (
            <Icon
              icon='toolkit-format-align-justify'
              name='Justifier'
              hint='Justifier'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
              }}
            />
          )}
          <div className='mn-toolbar-separator' />
        </>
      )}

      {/* Link */}
      {isGroupVisible(options, linkGroup) && (
        <>
          {options.link && !isLink && (
            <Icon
              icon='toolkit-format-link'
              name='Ajouter un lien'
              hint='Ajouter un lien'
              onTap={(e) => {
                e.preventDefault();
                const url = window.prompt("Quelle est l'URL de votre lien ?");
                if (url) {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
                }
              }}
            />
          )}
          {options.link && isLink && (
            <Icon
              icon='toolkit-format-unlink'
              name='Supprimer le lien'
              hint='Supprimer le lien'
              onTap={(e) => {
                e.preventDefault();
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
              }}
            />
          )}
          <div className='mn-toolbar-separator' />
        </>
      )}

      {/* ---------- Outils customs ---------- */}
      {customTools?.map((tool) => {
        const active = tool.isActive?.(editor) ?? false;
        return (
          <Icon
            key={tool.id}
            className={active ? 'active' : undefined}
            icon={tool.icon}
            name={tool.hint}
            hint={tool.hint}
            onTap={(e) => {
              e.preventDefault();
              tool.execute(editor);
            }}
          />
        );
      })}
    </HorizontalStack>
  );
};
