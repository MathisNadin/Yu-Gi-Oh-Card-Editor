import { CSSProperties } from 'react';
import { isArray, isDefined } from 'mn-tools';
import { IDeviceListener, IScreenSpec } from '../../system';
import { Containable, IContainableState } from '../containable';
import { IContainerProps } from '../container';
import { SplitPaneChild } from './SplitPaneChild';

// Master Pane = Left Pane / Top Pane
// Slave Pane = Right Pane / Bottom Pane
interface ISplitPaneProps extends IContainerProps {
  orientation: 'vertical' | 'horizontal';
  unit: 'px' | '%';
  masterPaneMinimumSize: number;
  masterPaneMaximumSize?: number;
  masterPaneDefaultSize?: number;
  slavePaneMinimumSize: number;
  splitterSize: number;
  onResizeStart?: () => void | Promise<void>;
  onResizeEnd?: (masterPaneSize: number) => void | Promise<void>;
  onSizeChange?: (masterPaneSize: number) => void | Promise<void>;
}

interface ISplitPaneState extends IContainableState {
  masterPaneSize: number;
  resizing: boolean;
}

export class SplitPane extends Containable<ISplitPaneProps, ISplitPaneState> implements Partial<IDeviceListener> {
  public static override get defaultProps(): ISplitPaneProps {
    return {
      orientation: 'horizontal',
      unit: 'px',
      masterPaneMinimumSize: 0,
      masterPaneMaximumSize: undefined!,
      masterPaneDefaultSize: undefined!,
      slavePaneMinimumSize: 0,
      splitterSize: 4,
    };
  }

  public constructor(props: ISplitPaneProps) {
    super(props);
    this.state = { ...this.state, resizing: false };
  }

  public override componentDidMount() {
    super.componentDidMount();
    app.$device.addListener(this);
    document.addEventListener('mouseup', this.documentMouseUpHandler);
    document.addEventListener('mousedown', this.documentMouseDownHandler);
    document.addEventListener('mousemove', this.documentMouseMoveHandler);
    if (isDefined(this.props.masterPaneDefaultSize)) {
      this.setState({ masterPaneSize: this.props.masterPaneDefaultSize });
    }
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    app.$device.removeListener(this);
    document.removeEventListener('mouseup', this.documentMouseUpHandler);
    document.removeEventListener('mousemove', this.documentMouseMoveHandler);
    document.removeEventListener('mousedown', this.documentMouseDownHandler);
  }

  private updateMasterPaneSize(masterPaneSize: number) {
    if (this.state.masterPaneSize === masterPaneSize) return;
    this.setState({ masterPaneSize }, () => {
      if (this.props.onSizeChange) app.$errorManager.handlePromise(this.props.onSizeChange(this.state.masterPaneSize));
    });
  }

  public deviceScreenSpecificationChanged(_newSpec: IScreenSpec) {
    const masterPaneSize = this.applyContraints(this.state.masterPaneSize);
    this.updateMasterPaneSize(masterPaneSize);
  }

  private documentMouseUpHandler = () => {
    if (!this.state.resizing) return;
    this.setState({ resizing: false }, () => {
      if (this.props.onResizeEnd) app.$errorManager.handlePromise(this.props.onResizeEnd(this.state.masterPaneSize));
    });
  };

  private documentMouseMoveHandler = (event: MouseEvent) => {
    if (!this.state.resizing || !this.base.current) return;

    const containerRect = this.base.current.getBoundingClientRect();
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

    masterPaneSize = this.applyContraints(masterPaneSize);
    this.updateMasterPaneSize(masterPaneSize);
  };

  private documentMouseDownHandler = (event: MouseEvent) => {
    // On vérifie que la cible est bien dans le container de cette instance de la classe
    const target = event.target as Node;
    if (!this.base.current || !this.base.current?.contains(target)) return;

    // On vérifie qu'on est dans la zone sensible
    const containerRect = this.base.current.getBoundingClientRect();

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
        if (this.props.onResizeStart) app.$errorManager.handlePromise(this.props.onResizeStart());
      });
    }
  };

  private applyContraints(masterPaneSize: number) {
    if (!this.base.current) return masterPaneSize;

    const { masterPaneMaximumSize, masterPaneMinimumSize, slavePaneMinimumSize, orientation, unit } = this.props;

    if (isDefined(masterPaneMaximumSize) && masterPaneSize > masterPaneMaximumSize) {
      masterPaneSize = masterPaneMaximumSize;
    }
    if (masterPaneSize < masterPaneMinimumSize) {
      masterPaneSize = masterPaneMinimumSize;
    }

    const containerRect = this.base.current.getBoundingClientRect();
    if (unit !== '%') {
      if (orientation === 'horizontal' && containerRect.width - masterPaneSize < slavePaneMinimumSize) {
        masterPaneSize = containerRect.width - slavePaneMinimumSize;
      } else if (orientation === 'vertical' && containerRect.height - masterPaneSize < slavePaneMinimumSize) {
        masterPaneSize = containerRect.height - slavePaneMinimumSize;
      }
    } else if (100 - masterPaneSize < slavePaneMinimumSize) {
      masterPaneSize = 100 - slavePaneMinimumSize;
    }

    return masterPaneSize;
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-split-pane'] = true;
    if (this.props.orientation) classes[`mn-split-pane-${this.props.orientation}`] = true;
    if (this.state.resizing) classes['mn-split-pane-resizing'] = true;
    return classes;
  }

  public override render() {
    if (!isArray(this.props.children) || this.props.children.length !== 2) {
      throw new Error('A SplitPane should have exactly two children panes');
    }
    return super.render();
  }

  public override get children() {
    const splitterStyle: CSSProperties = {
      cursor: this.props.orientation === 'horizontal' ? 'col-resize' : 'row-resize',
    };

    if (this.base.current) {
      let masterPaneSize = this.state.masterPaneSize;
      if (this.props.unit === '%') {
        let rect = this.base.current.getBoundingClientRect();
        if (this.props.orientation === 'horizontal') {
          masterPaneSize = (rect.width * masterPaneSize) / 100;
        } else {
          masterPaneSize = (rect.height * masterPaneSize) / 100;
        }
      }
      if (this.props.orientation === 'horizontal') {
        splitterStyle.top = splitterStyle.bottom = 0;
        splitterStyle.width = this.props.splitterSize;
        splitterStyle.left = masterPaneSize - this.props.splitterSize / 2;
      } else {
        splitterStyle.left = splitterStyle.right = 0;
        splitterStyle.height = this.props.splitterSize;
        splitterStyle.top = masterPaneSize - this.props.splitterSize / 2;
      }
    }

    const children = this.props.children as JSX.Element[];
    return [
      <SplitPaneChild
        key='split-pane-child-1'
        orientation={this.props.orientation}
        unit={this.props.unit}
        size={this.state.masterPaneSize}
      >
        {children[0]}
      </SplitPaneChild>,

      <SplitPaneChild key='split-pane-child-2' orientation={this.props.orientation} unit={this.props.unit}>
        {children[1]}
      </SplitPaneChild>,

      <div key='mn-split-handler' className='mn-split-handler' style={splitterStyle} />,
    ];
  }
}
