import { CSSProperties, FC, ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { classNames } from 'mn-tools';

interface OverlayToolbarProps {
  ref?: RefObject<HTMLDivElement | null>;
  /** The div containing the editor */
  anchor: HTMLElement | null;
  visible: boolean;
  children: ReactNode;
  /** margin above editor (px) */
  offset?: number;
}

export const OverlayToolbar: FC<OverlayToolbarProps> = ({ ref, anchor, visible, children, offset = 8 }) => {
  const [popoverContainer, setPopoverContainer] = useState<HTMLElement | null>(null);
  const [style, setStyle] = useState<CSSProperties>();
  const localRef = useRef<HTMLDivElement>(null);
  const toolbarRef = ref || localRef;

  useEffect(() => {
    setPopoverContainer(document.querySelector<HTMLDivElement>('.mn-popovers') || document.body);
  }, []);

  const updatePosition = () => {
    if (!anchor || !toolbarRef.current) return;
    const rect = anchor.getBoundingClientRect();
    setStyle({
      position: 'fixed',
      left: rect.left,
      top: rect.top - toolbarRef.current.offsetHeight - offset,
      width: rect.width,
      zIndex: 100,
    });
  };

  // Recalculate position on every anchor/window change
  useLayoutEffect(() => {
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, offset]);

  // Update when toolbar becomes visible
  useEffect(() => {
    if (!visible) return;
    // Use requestAnimationFrame to wait for the layout
    requestAnimationFrame(() => updatePosition());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, anchor, offset]);

  if (!popoverContainer) return null;

  return createPortal(
    <div
      ref={toolbarRef}
      style={style}
      className={classNames('mn-rich-text-editor-toolbar-ghost-mode-container', { visible })}
    >
      {children}
    </div>,
    popoverContainer
  );
};
