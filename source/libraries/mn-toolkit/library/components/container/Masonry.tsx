import { isDefined } from 'mn-tools';
import { TDidUpdateSnapshot } from '../containable';
import { Container, IContainerProps, IContainerState } from './Container';

interface IMasonryProps extends IContainerProps {
  childSize: { width: number; height: number; space?: number };
}

interface IMasonryState extends IContainerState {
  nbColumns: number;
  computedChildSize: { width: number; height: number };
}

export class Masonry extends Container<IMasonryProps, IMasonryState> {
  private resizeObserver: ResizeObserver | null = null;

  public static override get defaultProps(): IMasonryProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      wrap: true,
      padding: false,
      childSize: { width: 200, height: 300 },
    };
  }

  public constructor(props: IMasonryProps) {
    super(props);
    this.state = {
      ...this.state,
      nbColumns: 1,
      computedChildSize: { width: 0, height: 0 },
    };
  }

  public override componentDidMount() {
    super.componentDidMount();
    if (this.base.current) {
      this.resizeObserver = new ResizeObserver(() => this.computeLayout());
      this.resizeObserver.observe(this.base.current);
    }
    this.computeLayout();
  }

  public override componentWillUnmount() {
    super.componentWillUnmount();
    if (!this.resizeObserver || !this.base.current) return;
    this.resizeObserver.unobserve(this.base.current);
    this.resizeObserver.disconnect();
  }

  public override componentDidUpdate(
    prevProps: Readonly<IMasonryProps>,
    prevState: Readonly<IMasonryState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (this.props === prevProps) return;
    this.computeLayout();
  }

  private computeLayout = () => {
    if (!this.base.current) return;

    const availableWidth = this.base.current.clientWidth;

    const { childSize } = this.props;
    const space = childSize.space ?? app.$theme.settings.commons?.['default-spacing']?.value ?? 0;

    const computedChildSize = {
      width: childSize.width,
      height: childSize.height,
    };

    let nbColumns = Math.floor((availableWidth + space) / (computedChildSize.width + space));
    if (nbColumns < 1) nbColumns = 1;

    computedChildSize.width = Math.floor((availableWidth - space * (nbColumns - 1)) / nbColumns);
    computedChildSize.height = Math.floor(childSize.height * (computedChildSize.width / childSize.width));

    this.setState({ nbColumns, computedChildSize });
  };

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-masonry'] = true;
    return classes;
  }

  public override get children() {
    const { computedChildSize, nbColumns } = this.state;
    let space: string;
    if (isDefined(this.props.childSize?.space)) {
      space = `${this.props.childSize.space}px`;
    } else {
      space = app.$theme.getUnitString(app.$theme.settings.commons?.['default-spacing']);
    }

    const children = Array.isArray(this.props.children) ? this.props.children : [this.props.children];
    return children.map((child, index) => {
      if (!child) return null;

      const isFirstInRow = index % nbColumns === 0;
      return (
        <div
          key={index}
          className='mn-masonry-item'
          style={{
            width: computedChildSize.width,
            height: computedChildSize.height,
            flexShrink: 0,
            marginLeft: isFirstInRow ? undefined : space,
            marginBottom: space,
          }}
        >
          {child}
        </div>
      );
    });
  }
}
