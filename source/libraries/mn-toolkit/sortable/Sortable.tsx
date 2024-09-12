import { IContainerProps, IContainerState, Container } from '../container';
import { Icon } from '../icon';
import { classNames, isUndefined } from 'mn-tools';

interface ISortableProps extends IContainerProps {
  enabled: boolean;
  useHandler: boolean;
  alternateHandlerPosition?: boolean;
  onSort: (fromIndex: number, toIndex: number, before: boolean) => void | Promise<void>;
}

interface ISortableState extends IContainerState {
  dragSourceIndex: number;
  dragTargetIndex: number;
  dragTargetAbove: boolean;
  handlerDown: boolean;
}

export class Sortable extends Container<ISortableProps, ISortableState> {
  public static get defaultProps(): Partial<ISortableProps> {
    return {
      ...super.defaultProps,
      layout: 'vertical',
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
    return classes;
  }

  public get children() {
    const children = (this.props.children as unknown as JSX.Element[]).filter((x) => !!x);
    return children.map((x, index) => {
      const handlerPosition: 'left' | 'right' = this.props.alternateHandlerPosition && index % 2 ? 'right' : 'left';
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
          {this.props.enabled && this.props.useHandler && handlerPosition === 'left' && this.renderHandler()}
          {x}
          {this.props.enabled && this.props.useHandler && handlerPosition === 'right' && this.renderHandler()}
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

  private async onHandleDragStart(e: React.UIEvent) {
    await this.setStateAsync({ handlerDown: true });
    const target = (e.target as HTMLElement).parentElement!;
    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    await this.setStateAsync({ dragSourceIndex: index });
  }

  private onDragStart(e: React.UIEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    this.setState({ dragSourceIndex: index });
  }

  private onDragEnter(e: React.DragEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    this.setState({ dragTargetIndex: index });
  }

  private onDragOver(e: React.DragEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    const bounding = target.getBoundingClientRect();
    const offset = bounding.y + bounding.height / 2;
    this.setState({ dragTargetAbove: index === 0 && e.clientY - offset < 0 });
  }

  private onDragLeave(e: React.DragEvent) {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const index = Array.prototype.indexOf.call(target.parentNode?.children, target);
    if (this.state.dragTargetIndex === index) this.setState({ dragTargetIndex: undefined! });
  }

  private onDrop(e: React.DragEvent) {
    const { dragSourceIndex, dragTargetIndex } = this.state;

    // Cas où ce n'est pas cette instance de Sortable qui est concernée,
    // par exemple qu'on a un Sortable quelque part dans un Sortable-Item
    if (isUndefined(dragSourceIndex)) return;

    e.preventDefault();
    const target = e.currentTarget as HTMLElement;
    this.resetTargetDragStyle();

    if (dragSourceIndex === dragTargetIndex) return;

    const bounding = target.getBoundingClientRect();
    const visualIndex = Array.prototype.indexOf.call(target.parentNode?.children, target) as number;
    const offset = bounding.y + bounding.height / 2;
    const before = visualIndex === 0 && e.clientY - offset < 0;
    let toIndex = dragTargetIndex;

    if (this.props.onSort) app.$errorManager.handlePromise(this.props.onSort(dragSourceIndex, toIndex, before));
    this.setState({ dragSourceIndex: undefined!, dragTargetIndex: undefined! });
  }

  private resetTargetDragStyle() {
    this.setState({ dragTargetIndex: undefined!, dragSourceIndex: undefined!, handlerDown: false });
  }
}
