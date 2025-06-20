import { JSX } from 'react';
import { classNames, isUndefined } from 'mn-tools';
import { IContainerProps, IContainerState, Container } from '../container';
import { Icon } from '../icon';

interface ISortableProps extends IContainerProps {
  enabled: boolean;
  useHandler: boolean;
  alternateHandlerPosition?: boolean;
  onSort?: (fromIndex: number, toIndex: number, before: boolean) => void | Promise<void>;
}

interface ISortableState extends IContainerState {
  dragSourceIndex?: number;
  dragTargetIndex?: number;
  dragTargetAbove?: boolean;
  handlerDown: boolean;
}

export class Sortable extends Container<ISortableProps, ISortableState> {
  public static override get defaultProps(): ISortableProps {
    return {
      ...super.defaultProps,
      layout: 'vertical',
      gutter: true,
      enabled: true,
      useHandler: true,
      alternateHandlerPosition: false,
    };
  }

  public constructor(props: ISortableProps) {
    super(props);
    this.state = { ...this.state, handlerDown: false };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-sortable'] = true;
    classes['enabled'] = this.props.enabled;
    return classes;
  }

  public get children() {
    const showHandler = this.props.enabled && this.props.useHandler;
    const children = (this.props.children as JSX.Element[]).filter((x) => !!x);
    return children.map((x, index) => {
      const handlerPosition = this.props.alternateHandlerPosition && index % 2 ? 'right' : 'left';
      return (
        <div
          key={`sortable-item-${index}`}
          draggable={this.props.enabled && this.state.handlerDown}
          onDragStart={this.props.useHandler ? undefined : (e) => this.onDragStart(e)}
          onDragEnter={(e) => this.onDragEnter(e)}
          onDragOver={(e) => this.onDragOver(e)}
          onDragLeave={(e) => this.onDragLeave(e)}
          onDrop={(e) => this.onDrop(e)}
          className={classNames('mn-sortable-item', {
            'mn-drag-source': this.state.dragSourceIndex === index,
            'mn-drag-target': this.state.dragTargetIndex === index,
            'mn-drag-target-above': this.state.dragTargetIndex === index && this.state.dragTargetAbove,
          })}
        >
          {showHandler && handlerPosition === 'left' && this.renderHandler()}
          {x}
          {showHandler && handlerPosition === 'right' && this.renderHandler()}
        </div>
      );
    });
  }

  private renderHandler() {
    return (
      <div
        key='handler'
        className='handler'
        onMouseDown={(e) => app.$errorManager.handlePromise(this.onHandleDragStart(e))}
        onTouchStart={(e) => app.$errorManager.handlePromise(this.onHandleDragStart(e))}
        onMouseUp={() => this.setState({ handlerDown: false })}
        onTouchEnd={() => this.setState({ handlerDown: false })}
      >
        <Icon icon='toolkit-drag-vertical' />
      </div>
    );
  }

  private async onHandleDragStart(e: React.UIEvent<HTMLDivElement>) {
    await this.setStateAsync({ handlerDown: true });
    if (!(e.target instanceof HTMLElement)) return;

    const target = e.target.parentElement;
    if (!target) return;

    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    await this.setStateAsync({ dragSourceIndex: index });
  }

  private onDragStart(e: React.UIEvent<HTMLDivElement>) {
    e.preventDefault();
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    this.setState({ dragSourceIndex: index });
  }

  private onDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    this.setState({ dragTargetIndex: index });
  }

  private onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    const bounding = target.getBoundingClientRect();
    const offset = bounding.y + bounding.height / 2;
    this.setState({ dragTargetAbove: index === 0 && e.clientY - offset < 0 });
  }

  private onDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    this.setState((prevState) => {
      if (prevState.dragTargetIndex !== index) return null;
      return { dragTargetIndex: undefined };
    });
  }

  private onDrop(e: React.DragEvent<HTMLDivElement>) {
    const { dragSourceIndex, dragTargetIndex } = this.state;

    // Cas où ce n'est pas cette instance de Sortable qui est concernée,
    // par exemple qu'on a un Sortable quelque part dans un Sortable-Item
    if (isUndefined(dragSourceIndex)) return;

    e.preventDefault();
    const target = e.currentTarget;
    this.resetTargetDragStyle();

    if (dragSourceIndex === dragTargetIndex) return;

    const bounding = target.getBoundingClientRect();
    const visualIndex = Array.prototype.indexOf.call(target.parentNode?.children, target) as number;
    const offset = bounding.y + bounding.height / 2;
    const before = visualIndex === 0 && e.clientY - offset < 0;
    let toIndex = dragTargetIndex!;

    this.setState({ dragSourceIndex: undefined, dragTargetIndex: undefined });
    if (this.props.onSort) app.$errorManager.handlePromise(this.props.onSort(dragSourceIndex, toIndex, before));
  }

  private resetTargetDragStyle() {
    this.setState({ dragTargetIndex: undefined, dragSourceIndex: undefined, handlerDown: false });
  }
}
