import { Fragment, JSX, useCallback, useEffect, useState } from 'react';
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
import { TToolbarPluginTool, TRichTextToolGroupId, TRichTextBaseToolId } from '.';

export interface IToolbarPluginProps<TOOL_IDS extends string = TRichTextBaseToolId> {
  options: Partial<{ [key in TOOL_IDS]: boolean }>;
  colors?: string[];
  customTools?: TToolbarPluginTool<TOOL_IDS>[];
}

// Define group order
const groupOrder: TRichTextToolGroupId[] = ['undoRedo', 'format', 'block', 'structure', 'align', 'link', 'custom'];

export const ToolbarPlugin = <TOOL_IDS extends string = TRichTextBaseToolId>({
  options,
  colors,
  customTools = [],
}: IToolbarPluginProps<TOOL_IDS>): JSX.Element => {
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

  // Define standard tools
  const standardTools: TToolbarPluginTool[] = [
    {
      id: 'undo',
      group: 'undoRedo',
      getIcon: (_editor) => 'toolkit-undo',
      getHint: (_editor) => 'Annuler',
      execute: (editor) => {
        editor.dispatchCommand(UNDO_COMMAND, undefined);
      },
      isDisabled: (_editor) => !canUndo,
    },
    {
      id: 'redo',
      group: 'undoRedo',
      getIcon: (_editor) => 'toolkit-redo',
      getHint: (_editor) => 'Rétablir',
      execute: (editor) => {
        editor.dispatchCommand(REDO_COMMAND, undefined);
      },
      isDisabled: (_editor) => !canRedo,
    },
    {
      id: 'bold',
      group: 'format',
      getIcon: (_editor) => 'toolkit-format-bold',
      getHint: (_editor) => 'Passer la sélection en gras',
      execute: (editor) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
      },
      isActive: (_editor) => isBold,
    },
    {
      id: 'italic',
      group: 'format',
      getIcon: (_editor) => 'toolkit-format-italic',
      getHint: (_editor) => 'Passer la sélection en italique',
      execute: (editor) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
      },
      isActive: (_editor) => isItalic,
    },
    {
      id: 'underline',
      group: 'format',
      getIcon: (_editor) => 'toolkit-format-underline',
      getHint: (_editor) => 'Souligner la sélection',
      execute: (editor) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
      },
      isActive: (_editor) => isUnderline,
    },
    {
      id: 'strikethrough',
      group: 'format',
      getIcon: (_editor) => 'toolkit-format-strikethrough',
      getHint: (_editor) => 'Texte barré',
      execute: (editor) => {
        editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
      },
      isActive: (_editor) => isStrikethrough,
    },
    {
      id: 'color',
      group: 'format',
      getIcon: (_editor) => 'toolkit-format-color',
      getHint: (_editor) => 'Changer la couleur du texte',
      getStyle: (_editor) => {
        if (!textColor) return undefined;
        return { '--current-rich-text-color': textColor };
      },
      popoverContent: (editor) => (
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
      isActive: (_editor) => !!textColor,
    },
    {
      id: 'backgroundColor',
      group: 'format',
      getIcon: (_editor) => 'toolkit-format-background-color',
      getHint: (_editor) => 'Changer la couleur de fond',
      getStyle: (_editor) => {
        if (!bgColor) return undefined;
        return { '--current-rich-text-background-color': bgColor };
      },
      popoverContent: (editor) => (
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
      isActive: (_editor) => !!bgColor,
    },
    {
      id: 'ul',
      group: 'block',
      getIcon: (_editor) => 'toolkit-format-ul',
      getHint: (_editor) => 'Transformer en liste à puces',
      execute: (editor) => {
        if (isUl) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        else editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      },
      isActive: (_editor) => isUl,
    },
    {
      id: 'ol',
      group: 'block',
      getIcon: (_editor) => 'toolkit-format-ol',
      getHint: (_editor) => 'Transformer en liste numérotée',
      execute: (editor) => {
        if (isOl) editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
        else editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      },
      isActive: (_editor) => isOl,
    },
    {
      id: 'indent',
      group: 'block',
      getIcon: (_editor) => 'toolkit-format-indent',
      getHint: (_editor) => 'Augmenter le retrait',
      execute: (editor) => {
        editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
      },
    },
    {
      id: 'outdent',
      group: 'block',
      getIcon: (_editor) => 'toolkit-format-outdent',
      getHint: (_editor) => 'Diminuer le retrait',
      execute: (editor) => {
        editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
      },
    },
    {
      id: 'blockquote',
      group: 'block',
      getIcon: (_editor) => 'toolkit-format-blockquote',
      getHint: (_editor) => 'Citation',
      execute: (_editor) => setBlockType(() => $createQuoteNode()),
    },
    {
      id: 'h1',
      group: 'structure',
      getIcon: (_editor) => 'toolkit-format-header-1',
      getHint: (_editor) => 'Titre 1',
      execute: (_editor) => setBlockType(() => $createHeadingNode('h1')),
    },
    {
      id: 'h2',
      group: 'structure',
      getIcon: (_editor) => 'toolkit-format-header-2',
      getHint: (_editor) => 'Titre 2',
      execute: (_editor) => setBlockType(() => $createHeadingNode('h2')),
    },
    {
      id: 'h3',
      group: 'structure',
      getIcon: (_editor) => 'toolkit-format-header-3',
      getHint: (_editor) => 'Titre 3',
      execute: (_editor) => setBlockType(() => $createHeadingNode('h3')),
    },
    {
      id: 'paragraph',
      group: 'structure',
      getIcon: (_editor) => 'toolkit-format-paragraph',
      getHint: (_editor) => 'Paragraphe',
      execute: (_editor) => setBlockType(() => new ParagraphNode()),
    },
    {
      id: 'alignLeft',
      group: 'align',
      getIcon: (_editor) => 'toolkit-format-align-left',
      getHint: (_editor) => 'Aligner à gauche',
      execute: (editor) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
      },
    },
    {
      id: 'alignCenter',
      group: 'align',
      getIcon: (_editor) => 'toolkit-format-align-center',
      getHint: (_editor) => 'Centrer',
      execute: (editor) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
      },
    },
    {
      id: 'alignRight',
      group: 'align',
      getIcon: (_editor) => 'toolkit-format-align-right',
      getHint: (_editor) => 'Aligner à droite',
      execute: (editor) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
      },
    },
    {
      id: 'alignJustify',
      group: 'align',
      getIcon: (_editor) => 'toolkit-format-align-justify',
      getHint: (_editor) => 'Justifier',
      execute: (editor) => {
        editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
      },
    },
    {
      id: 'link',
      group: 'link',
      getIcon: (_editor) => (isLink ? 'toolkit-format-unlink' : 'toolkit-format-link'),
      getHint: (_editor) => (isLink ? 'Supprimer le lien' : 'Ajouter un lien'),
      execute: useCallback(() => {
        if (isLink) {
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
        } else {
          const url = window.prompt("Quelle est l'URL de votre lien ?");
          if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
      }, [isLink, editor]),
      isActive: (_editor) => isLink,
    },
  ];

  // Combine standard and custom tools
  const allTools = [...(standardTools as TToolbarPluginTool<TOOL_IDS>[]), ...customTools];

  // Group tools by their group, respecting options for standard tools
  const toolsByGroup = groupOrder.map(
    (group) =>
      ({
        id: group,
        tools: allTools.filter((tool) => tool.group === group && tool.id in options && options[tool.id]),
      }) as const
  );

  return (
    <HorizontalStack className='mn-rich-text-editor-toolbar' gutter='small' wrap>
      {toolsByGroup.map((group, i) =>
        group.tools.length > 0 ? (
          <Fragment key={i}>
            {group.tools.map((tool) => {
              const hint = tool.getHint(editor);
              return (
                <Icon
                  key={tool.id}
                  disabled={tool.isDisabled?.(editor) || false}
                  className={tool.isActive?.(editor) ? 'active' : undefined}
                  style={tool.getStyle?.(editor)}
                  icon={tool.getIcon(editor)}
                  name={hint}
                  hint={hint}
                  onTap={async (e) => {
                    e.preventDefault();
                    if ('popoverContent' in tool && tool.popoverContent) {
                      app.$popover.bubble(e, {
                        onBlur: (e) => e.preventDefault(),
                        content: tool.popoverContent(editor),
                      });
                    } else if ('execute' in tool && tool.execute) {
                      await tool.execute?.(editor);
                    }
                  }}
                />
              );
            })}
            <div className='mn-toolbar-separator' />
          </Fragment>
        ) : null
      )}
    </HorizontalStack>
  );
};
