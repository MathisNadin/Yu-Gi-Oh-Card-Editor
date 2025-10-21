import { useEffect, useState } from 'react';
import { LexicalEditor } from 'lexical/LexicalEditor';
import { EditorState } from 'lexical/LexicalEditorState';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from './ListPlugin';

export interface ILexicalRichTextEditorContentProps {
  inputId: string | undefined;
  inputName: string | undefined;
  spellCheck: boolean;
  placeholder: string;
  value: EditorState | undefined;
  onChange: (value: EditorState) => void | Promise<void>;
  onEditorInit: (editor: LexicalEditor) => void;
}

// Inner component to manage editor state and plugins
export function LexicalRichTextEditorContent({
  inputId,
  inputName,
  spellCheck,
  placeholder,
  value,
  onChange,
  onEditorInit,
}: ILexicalRichTextEditorContentProps) {
  const [editor] = useLexicalComposerContext();
  const [showPlaceholder, setShowPlaceholder] = useState(false);

  /* ------------------------------------------------------------
   * 1.   Notify the parent **after** the first paint so that any
   *      `setState` inside `onEditorInit` happens outside the render
   *      cycle, eliminating the React 19 error you observed.
   * ---------------------------------------------------------- */
  useEffect(() => {
    onEditorInit(editor);
    // run once – eslint-disable-next-line is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------
   * 2.   Keep Lexical in sync when `value` (an EditorState object)
   *      changes from the outside.
   * ---------------------------------------------------------- */
  useEffect(() => {
    if (value) {
      // To prevent a phantom placeholder from showing up when there wil be text initially
      if (!showPlaceholder) {
        setTimeout(() => setShowPlaceholder(true));
      }

      const current = editor.getEditorState();
      if (current === value) {
        return;
      }

      if (JSON.stringify(current.toJSON()) !== JSON.stringify(value.toJSON())) {
        editor.setEditorState(value);
      }
    }
  }, [value, editor, showPlaceholder]);

  const shownPlaceholder = showPlaceholder ? placeholder : '';

  return (
    <div className='lexical-editor-inner'>
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className='lexical-editor-input'
            id={inputId}
            name={inputName}
            spellCheck={spellCheck}
            aria-placeholder={shownPlaceholder}
            placeholder={<div className='lexical-editor-placeholder'>{shownPlaceholder}</div>}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <OnChangePlugin onChange={onChange} />
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
    </div>
  );
}
