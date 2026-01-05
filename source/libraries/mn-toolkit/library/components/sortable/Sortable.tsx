import { JSX } from 'react';
import { classNames, isUndefined } from 'mn-tools';
import { TBackgroundColor } from '../../system';
import { IContainerProps, IContainerState, Container } from '../container';
import { Icon } from '../icon';

/**
 * Props for the Sortable component.
 * Extends IContainerProps to support all container features.
 */
export interface ISortableProps extends IContainerProps {
  /** Whether the sortable functionality is enabled */
  enabled: boolean;
  /** Whether to show a drag handler icon (if false, the entire item is draggable) */
  useHandler: boolean;
  /** Whether to alternate handler position (left/right) for odd/even items */
  alternateHandlerPosition: boolean;
  /** Color of the placeholder during drag operations */
  placeholderColor: TBackgroundColor;
  /** Minimum size (height for vertical, width for horizontal) of each sortable item */
  placeholderMinSize?: number;
  /** Callback fired when an item is sorted. Returns the source index, target index, and whether the item should be placed before the target */
  onSort: (fromIndex: number, toIndex: number, before: boolean) => void | Promise<void>;
}

/**
 * State for the Sortable component.
 * Manages drag and drop state during sorting operations.
 */
interface ISortableState extends IContainerState {
  /** Index of the item being dragged */
  dragSourceIndex?: number;
  /** Visual position where the placeholder should appear (calculated from target + before/after) */
  placeholderIndex?: number;
  /** Whether the drag handler is currently pressed (for handler mode) */
  handlerActive: boolean;
}

/**
 * Sortable component that allows reordering items via drag and drop.
 * Supports both vertical and horizontal layouts, touch devices, and nested sortables.
 *
 * Features:
 * - Desktop and mobile support (touch events)
 * - Optional drag handlers or full-item dragging
 * - Visual feedback during drag operations
 * - Support for nested Sortable components
 * - Horizontal and vertical layout support
 *
 * @example
 * <Sortable enabled={true} useHandler={true} onSort={(from, to, before) => reorderItems(from, to, before)}>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Sortable>
 */
export class Sortable extends Container<ISortableProps, ISortableState> {
  /** Unique identifier for this Sortable instance to handle nested sortables */
  private sortableId: string = `sortable-${Math.random().toString(36).substring(2, 11)}`;

  /** Reference to track if we're currently in a drag operation to prevent nested interference */
  private isDragging: boolean = false;

  public static override get defaultProps(): Omit<ISortableProps, 'onSort'> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      gutter: true,
      enabled: true,
      useHandler: true,
      alternateHandlerPosition: false,
      placeholderColor: 'primary',
    };
  }

  public constructor(props: ISortableProps) {
    super(props);
    this.state = { ...this.state, handlerActive: false };
  }

  /**
   * Add event listeners for global drag end events to ensure cleanup.
   * This handles cases where drag ends outside the component or is cancelled.
   */
  public override componentDidMount() {
    super.componentDidMount();
    document.addEventListener('dragend', this.handleGlobalDragEnd);
    document.addEventListener('mouseup', this.handleGlobalPointerUp);
    document.addEventListener('touchend', this.handleGlobalPointerUp);
    document.addEventListener('touchcancel', this.handleGlobalPointerUp);
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    document.removeEventListener('dragend', this.handleGlobalDragEnd);
    document.removeEventListener('mouseup', this.handleGlobalPointerUp);
    document.removeEventListener('touchend', this.handleGlobalPointerUp);
    document.removeEventListener('touchcancel', this.handleGlobalPointerUp);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-sortable'] = true;
    classes['enabled'] = this.props.enabled;
    classes['is-dragging'] = this.isDragging;
    classes[`mn-sortable-placeholder-${this.props.placeholderColor}`] = true;
    return classes;
  }

  /**
   * Override render to add drop handlers to the container.
   */
  public override render() {
    const element = super.render();

    // Add drop handlers to the main container to catch drops that might not hit individual items
    return (
      <div onDragOver={this.onContainerDragOver} onDrop={this.onContainerDrop} style={{ display: 'contents' }}>
        {element}
      </div>
    );
  }

  /**
   * Handler for drag over on the container itself.
   * This ensures we can drop even if not directly over an item.
   */
  private onContainerDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!this.isDragging || isUndefined(this.state.dragSourceIndex)) return;
    e.preventDefault();
  };

  /**
   * Handler for drop on the container itself.
   * This is a fallback in case drop doesn't reach individual items.
   */
  private onContainerDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!this.isDragging || isUndefined(this.state.dragSourceIndex)) return;

    e.preventDefault();
    e.stopPropagation();

    // Verify drop data matches this sortable
    if (e.dataTransfer.getData('text/plain') !== this.sortableId) return;

    const { dragSourceIndex, placeholderIndex } = this.state;

    this.cleanupDragState();

    // Don't sort if no valid placeholder
    if (isUndefined(placeholderIndex)) return;

    // Calculate the actual target index and whether to place before
    let targetIndex: number;
    let before: boolean;

    if (placeholderIndex <= dragSourceIndex) {
      targetIndex = placeholderIndex;
      before = true;
    } else {
      targetIndex = placeholderIndex - 1;
      before = false;
    }

    // Don't sort if item would stay in same position
    if (targetIndex === dragSourceIndex) return;

    // Execute the sort callback
    app.$errorManager.handlePromise(this.props.onSort(dragSourceIndex, targetIndex, before));
  };

  /**
   * Render all sortable items with their handlers and drag/drop event handlers.
   * Inserts a visual placeholder during drag operations to show where the item will land.
   */
  public get children() {
    const showHandler = this.props.enabled && this.props.useHandler;
    const children = (this.props.children as JSX.Element[]).filter((x) => !!x);
    const isHorizontal = this.props.layout === 'horizontal';
    const { dragSourceIndex, placeholderIndex } = this.state;

    const result: JSX.Element[] = [];

    children.forEach((child, index) => {
      const handlerPosition = this.props.alternateHandlerPosition && index % 2 ? 'right' : 'left';
      const isDragSource = dragSourceIndex === index;

      // Insert placeholder before this item if needed
      if (!isUndefined(placeholderIndex) && placeholderIndex === index && !isDragSource) {
        result.push(this.renderPlaceholder(isHorizontal));
      }

      // Render the actual item
      result.push(
        <div
          key={`sortable-item-${index}`}
          data-sortable-id={this.sortableId}
          data-sortable-index={index}
          draggable={this.props.enabled && (this.props.useHandler ? this.state.handlerActive : true)}
          onDragStart={(e) => this.onDragStart(e, index)}
          onDragEnd={this.onDragEnd}
          onDragEnter={(e) => this.onDragEnter(e, index)}
          onDragOver={(e) => this.onDragOver(e, index)}
          onDragLeave={(e) => this.onDragLeave(e, index)}
          onDrop={(e) => this.onDrop(e, index)}
          className={classNames('mn-sortable-item', {
            'drag-source': isDragSource,
            'layout-horizontal': isHorizontal,
            'layout-vertical': !isHorizontal,
          })}
        >
          {showHandler && handlerPosition === 'left' && this.renderHandler(index, handlerPosition)}
          <div className='sortable-item-content'>{child}</div>
          {showHandler && handlerPosition === 'right' && this.renderHandler(index, handlerPosition)}
        </div>
      );
    });

    // Insert placeholder at the end if needed
    if (!isUndefined(placeholderIndex) && placeholderIndex === children.length) {
      result.push(this.renderPlaceholder(isHorizontal));
    }

    return result;
  }

  /**
   * Render a visual placeholder that shows where the dragged item will be inserted.
   * The placeholder has the same dimensions as a sortable item to maintain layout.
   */
  private renderPlaceholder(isHorizontal: boolean) {
    return (
      <div
        key='sortable-placeholder'
        className={classNames('mn-sortable-placeholder', {
          [`color-${this.props.placeholderColor}`]: true,
          'layout-horizontal': isHorizontal,
          'layout-vertical': !isHorizontal,
        })}
        style={{
          minWidth: isHorizontal ? this.props.placeholderMinSize || 80 : undefined,
          minHeight:
            !isHorizontal || this.props.wrap ? (this.props.placeholderMinSize || this.props.wrap ? 80 : 40) : undefined,
        }}
      />
    );
  }

  /**
   * Render the drag handler icon for an item.
   * The handler allows users to initiate drag operations when useHandler is true.
   */
  private renderHandler(index: number, position: 'left' | 'right') {
    return (
      <div
        key={`handler-${index}`}
        className={classNames('handler', {
          'handler-left': position === 'left',
          'handler-right': position === 'right',
        })}
        onMouseDown={(e) => this.onHandlerPointerDown(e)}
        onTouchStart={(e) => this.onHandlerPointerDown(e)}
        onMouseUp={this.onHandlerPointerUp}
        onTouchEnd={this.onHandlerPointerUp}
      >
        <Icon icon='toolkit-drag-vertical' />
      </div>
    );
  }

  /**
   * Handler for when the drag handler is pressed (mouse or touch).
   * Activates the handler state to allow dragging.
   */
  private onHandlerPointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    this.setState({ handlerActive: true });
  };

  /**
   * Handler for when the drag handler is released.
   * Deactivates the handler state.
   */
  private onHandlerPointerUp = () => {
    this.setState({ handlerActive: false });
  };

  /**
   * Global handler for pointer up events (mouse/touch).
   * Ensures handler state is reset even if pointer is released outside the handler.
   */
  private handleGlobalPointerUp = () => {
    if (this.state.handlerActive) {
      this.setState({ handlerActive: false });
    }
  };

  /**
   * Handler for drag start event.
   * Sets the drag source index and initializes drag state.
   * Prevents interference from nested Sortables.
   */
  private onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // Check if this drag started from this specific Sortable instance
    const target = e.currentTarget;
    const sortableId = target.getAttribute('data-sortable-id');
    if (sortableId !== this.sortableId) return;

    // Prevent nested Sortables from interfering
    e.stopPropagation();

    this.isDragging = true;
    this.setState({ dragSourceIndex: index });

    // Set drag image for better visual feedback
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      // Store sortable ID to prevent cross-sortable interference
      e.dataTransfer.setData('text/plain', this.sortableId);
    }
  };

  /**
   * Handler for drag end event.
   * Cleans up drag state when the drag operation completes or is cancelled.
   */
  private onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    this.cleanupDragState();
  };

  /**
   * Global handler for drag end events.
   * Ensures cleanup even if dragend event doesn't fire on the element.
   */
  private handleGlobalDragEnd = () => {
    if (this.isDragging) {
      this.cleanupDragState();
    }
  };

  /**
   * Handler for drag enter event.
   * Updates the placeholder position when hovering over a new item.
   */
  private onDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // Only handle if this is our drag operation
    if (!this.isDragging || isUndefined(this.state.dragSourceIndex)) return;

    e.preventDefault();
    e.stopPropagation();

    // Check if this is the correct Sortable instance
    const sortableId = e.currentTarget.getAttribute('data-sortable-id');
    if (sortableId !== this.sortableId) return;

    // Calculate placeholder position based on cursor position
    this.updatePlaceholderPosition(e, index);
  };

  /**
   * Handler for drag over event.
   * Continuously updates the placeholder position based on cursor movement.
   * Supports both horizontal and vertical layouts.
   */
  private onDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    // Only handle if this is our drag operation
    if (!this.isDragging || isUndefined(this.state.dragSourceIndex)) return;

    e.preventDefault();
    e.stopPropagation();

    // Check if this is the correct Sortable instance
    const sortableId = e.currentTarget.getAttribute('data-sortable-id');
    if (sortableId !== this.sortableId) return;

    // Update placeholder position
    this.updatePlaceholderPosition(e, index);
  };

  /**
   * Calculate and update the placeholder position based on cursor position.
   * The placeholder represents where the dragged item will be inserted.
   */
  private updatePlaceholderPosition(e: React.DragEvent<HTMLDivElement>, hoverIndex: number) {
    const rect = e.currentTarget.getBoundingClientRect();
    const isHorizontal = this.props.layout === 'horizontal';
    const dragSourceIndex = this.state.dragSourceIndex!;

    let insertBefore: boolean;
    if (isHorizontal) {
      // For horizontal layout, check if cursor is in left or right half
      const middleX = rect.left + rect.width / 2;
      insertBefore = e.clientX < middleX;
    } else {
      // For vertical layout, check if cursor is in top or bottom half
      const middleY = rect.top + rect.height / 2;
      insertBefore = e.clientY < middleY;
    }

    // Calculate the visual placeholder index
    // If inserting before, placeholder goes at hoverIndex
    // If inserting after, placeholder goes at hoverIndex + 1
    let placeholderIndex = insertBefore ? hoverIndex : hoverIndex + 1;

    // Don't show placeholder if it would represent no actual change
    // This happens when:
    // 1. Placeholder would be at dragSourceIndex (same position)
    // 2. Placeholder would be at dragSourceIndex + 1 (right after source, which is the same as before)
    if (placeholderIndex === dragSourceIndex || placeholderIndex === dragSourceIndex + 1) {
      placeholderIndex = undefined!;
    }

    // Only update if position changed
    if (this.state.placeholderIndex !== placeholderIndex) {
      this.setState({ placeholderIndex });
    }
  }

  /**
   * Handler for drag leave event.
   * Could be used for additional feedback, but placeholder stays visible.
   */
  private onDragLeave = (e: React.DragEvent<HTMLDivElement>, _index: number) => {
    // Only handle if this is our drag operation
    if (!this.isDragging || isUndefined(this.state.dragSourceIndex)) return;

    e.preventDefault();
    e.stopPropagation();

    // Note: We intentionally don't clear the placeholder here
    // because it should remain visible until we enter another item or drop
  };

  /**
   * Handler for drop event.
   * Executes the sort operation by calling the onSort callback.
   * Calculates the final target index based on placeholder position.
   */
  private onDrop = (e: React.DragEvent<HTMLDivElement>, _index: number) => {
    const { dragSourceIndex, placeholderIndex } = this.state;

    // Only handle if this is our drag operation
    if (!this.isDragging || isUndefined(dragSourceIndex)) return;

    e.preventDefault();
    e.stopPropagation();

    // Check if this is the correct Sortable instance
    const sortableId = e.currentTarget.getAttribute('data-sortable-id');
    if (sortableId !== this.sortableId) return;

    // Verify drop data matches this sortable
    if (e.dataTransfer.getData('text/plain') !== this.sortableId) return;

    this.cleanupDragState();

    // Don't sort if no valid placeholder or if dropped on same position
    if (isUndefined(placeholderIndex)) return;

    // Calculate the actual target index and whether to place before
    // The placeholder index already represents the visual insertion point
    let targetIndex: number;
    let before: boolean;

    if (placeholderIndex <= dragSourceIndex) {
      // Moving item backwards - target is the item at placeholder position
      targetIndex = placeholderIndex;
      before = true;
    } else {
      // Moving item forwards - adjust for the source item removal
      // Target is the item that's now at placeholderIndex - 1
      targetIndex = placeholderIndex - 1;
      before = false;
    }

    // Don't sort if item would stay in same position
    if (targetIndex === dragSourceIndex) return;

    // Execute the sort callback
    app.$errorManager.handlePromise(this.props.onSort(dragSourceIndex, targetIndex, before));
  };

  /**
   * Cleans up all drag-related state.
   * Called when drag ends, is cancelled, or completes.
   */
  private cleanupDragState() {
    this.isDragging = false;
    this.setState({
      dragSourceIndex: undefined,
      placeholderIndex: undefined,
      handlerActive: false,
    });
  }
}
