import { Component, createRef, CSSProperties, PropsWithChildren } from 'react';
import { classNames, isDefined } from 'mn-tools';
import { SplitPaneChild } from './SplitPaneChild';

// masterPane = leftPane
// slavePane = rightPane
interface ISplitPaneProps extends PropsWithChildren {
  unit: 'px' | '%';
  className: string;
  orientation: 'vertical' | 'horizontal';
  masterPaneMinimumSize: number;
  masterPaneMaximumSize: number;
  masterPaneDefaultSize: number;
  slavePaneMinimumSize: number;
  splitterSize: number;
  onResizeStart: () => void;
  onResizeEnd: (masterPaneSize: number) => void;
  onSizeChange: (masterPaneSize: number) => void;
}

interface ISplitPaneState {
  masterPaneSize: number;
  resizing: boolean;
}

export class SplitPane extends Component<ISplitPaneProps, ISplitPaneState> {
  private container = createRef<HTMLDivElement>();

  public static get defaultProps(): Partial<ISplitPaneProps> {
    return {
      orientation: 'horizontal',
      unit: 'px',
      masterPaneMinimumSize: 0,
      slavePaneMinimumSize: 0,
      splitterSize: 4,
    };
  }

  public constructor(props: ISplitPaneProps) {
    super(props);
    this.state = { ...this.state, resizing: false };
  }

  public override componentDidMount() {
    if (super.componentDidMount) super.componentDidMount();
    window.addEventListener('resize', this.windowResizeHandler);
    document.addEventListener('mouseup', this.documentMouseUpHandler);
    document.addEventListener('mousedown', this.documentMouseDownHandler);
    document.addEventListener('mousemove', this.documentMouseMoveHandler);
    if (isDefined(this.props.masterPaneDefaultSize)) {
      this.setState({ masterPaneSize: this.props.masterPaneDefaultSize });
    }
  }

  public override componentWillUnmount() {
    if (super.componentWillUnmount) super.componentWillUnmount();
    window.removeEventListener('resize', this.windowResizeHandler);
    document.removeEventListener('mouseup', this.documentMouseUpHandler);
    document.removeEventListener('mousemove', this.documentMouseMoveHandler);
    document.removeEventListener('mousedown', this.documentMouseDownHandler);
  }

  private windowResizeHandler = () => this.applyContraints();

  private documentMouseUpHandler = () => {
    if (!this.state.resizing) return;
    this.setState({ resizing: false }, () => {
      if (this.props.onResizeEnd) this.props.onResizeEnd(this.state.masterPaneSize);
    });
  };

  private documentMouseMoveHandler = (event: MouseEvent) => {
    if (!this.state.resizing || !this.container?.current) return;

    const containerRect = this.container.current.getBoundingClientRect();
    let masterPaneSize: number;
    if (this.props.orientation === 'horizontal') {
      masterPaneSize = event.clientX - containerRect.left;
    } else {
      masterPaneSize = event.clientY - containerRect.top;
    }

    if (this.props.unit === '%') {
      if (this.props.orientation === 'horizontal') {
        masterPaneSize = (100 * masterPaneSize) / containerRect.width;
      } else {
        masterPaneSize = (100 * masterPaneSize) / containerRect.height;
      }
    }

    this.setState({ masterPaneSize }, () => {
      this.applyContraints();
      if (this.props.onSizeChange) this.props.onSizeChange(this.state.masterPaneSize);
    });
  };

  private documentMouseDownHandler = (event: MouseEvent) => {
    // On vérifie que la cible est bien dans le container de cette instance de la classe
    const target = event.target as Node;
    if (!this.container.current || !this.container.current?.contains(target)) return;

    // On vérifie qu'on est dans la zone sensible
    const containerRect = this.container.current.getBoundingClientRect();

    let masterPaneSize = this.state.masterPaneSize;
    if (this.props.unit === '%') {
      if (this.props.orientation === 'horizontal') {
        masterPaneSize = (containerRect.width * masterPaneSize) / 100;
      } else {
        masterPaneSize = (containerRect.height * masterPaneSize) / 100;
      }
    }

    const jointPosition =
      this.props.orientation === 'vertical' ? containerRect.top + masterPaneSize : containerRect.left + masterPaneSize;

    const position = this.props.orientation === 'horizontal' ? event.clientX : event.clientY;

    const offset = Math.abs(position - jointPosition);
    if (offset <= this.props.splitterSize / 2) {
      this.setState({ resizing: true }, () => {
        if (this.props.onResizeStart) this.props.onResizeStart();
      });
    }
  };

  private applyContraints() {
    if (!this.container.current) return;

    let masterPaneSize = this.state.masterPaneSize;
    if (isDefined(this.props.masterPaneMaximumSize) && masterPaneSize > this.props.masterPaneMaximumSize) {
      masterPaneSize = this.props.masterPaneMaximumSize;
    }
    if (masterPaneSize < this.props.masterPaneMinimumSize) {
      masterPaneSize = this.props.masterPaneMinimumSize;
    }

    const containerRect = this.container.current.getBoundingClientRect();
    if (this.props.unit !== '%') {
      if (
        this.props.orientation === 'horizontal' &&
        containerRect.width - masterPaneSize < this.props.slavePaneMinimumSize
      ) {
        masterPaneSize = containerRect.width - this.props.slavePaneMinimumSize;
      } else if (containerRect.height - masterPaneSize < this.props.slavePaneMinimumSize) {
        masterPaneSize = containerRect.height - this.props.slavePaneMinimumSize;
      }
    } else if (100 - masterPaneSize < this.props.slavePaneMinimumSize) {
      masterPaneSize = 100 - this.props.slavePaneMinimumSize;
    }

    if (this.state.masterPaneSize !== masterPaneSize) {
      this.setState({ masterPaneSize });
    }
  }

  public override render() {
    let children = this.props.children as JSX.Element[];
    if (children.length !== 2) throw new Error('A SplitPane should have exactly two children panes');

    let style: CSSProperties = {
      cursor: this.props.orientation === 'horizontal' ? 'col-resize' : 'row-resize',
    };

    if (this.container.current) {
      let masterPaneSize = this.state.masterPaneSize;
      if (this.props.unit === '%') {
        let rect = this.container.current.getBoundingClientRect();
        if (this.props.orientation === 'horizontal') {
          masterPaneSize = (rect.width * masterPaneSize) / 100;
        } else {
          masterPaneSize = (rect.height * masterPaneSize) / 100;
        }
      }
      if (this.props.orientation === 'horizontal') {
        style.top = style.bottom = 0;
        style.width = this.props.splitterSize;
        style.left = masterPaneSize - this.props.splitterSize / 2;
      } else {
        style.left = style.right = 0;
        style.height = this.props.splitterSize;
        style.top = masterPaneSize - this.props.splitterSize / 2;
      }
    }

    return (
      <div
        ref={this.container}
        className={classNames('mn-split-pane', this.props.className, `mn-split-pane-${this.props.orientation}`, {
          'mn-split-pane-resizing': this.state.resizing,
        })}
      >
        <SplitPaneChild orientation={this.props.orientation} unit={this.props.unit} size={this.state.masterPaneSize}>
          {children[0]}
        </SplitPaneChild>

        <SplitPaneChild orientation={this.props.orientation} unit={this.props.unit}>
          {children[1]}
        </SplitPaneChild>

        <div className='mn-split-handler' style={style} />
      </div>
    );
  }
}
