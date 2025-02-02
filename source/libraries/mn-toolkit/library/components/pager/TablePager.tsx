import { TJSXElementChild } from '../../system';
import { TDidUpdateSnapshot } from '../containable';
import { Container, IContainerProps, IContainerState, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { Select } from '../select';
import { Typography } from '../typography';

interface ITablePagerProps extends IContainerProps<HTMLElement> {
  position: number;
  total: number;
  pageSize: number;
  showFirstButton?: boolean;
  showLastButton?: boolean;
  onChange?: (position: number, pageSize: number) => void | Promise<void>;
}

interface ITablePagerState extends IContainerState {
  total: number;
  position: number;
  pageSize: number;
}

export class TablePager extends Container<ITablePagerProps, ITablePagerState, HTMLElement> {
  public static override get defaultProps(): ITablePagerProps {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      verticalItemAlignment: 'middle',
      position: 0,
      total: 1,
      pageSize: 10,
    };
  }

  public constructor(props: ITablePagerProps) {
    super(props);
    this.state = {
      ...this.state,
      total: props.total,
      position: props.position,
      pageSize: props.pageSize,
    };
  }

  public override componentDidUpdate(
    prevProps: Readonly<ITablePagerProps>,
    prevState: Readonly<ITablePagerState>,
    snapshot?: TDidUpdateSnapshot
  ) {
    super.componentDidUpdate(prevProps, prevState, snapshot);
    if (prevProps === this.props) return;
    this.setState({
      total: this.props.total,
      position: this.props.position,
      pageSize: this.props.pageSize,
    });
  }

  private async onChangePageSize(pageSize: number) {
    await this.setStateAsync({ pageSize });
    if (this.props.onChange) await this.props.onChange(this.state.position, this.state.pageSize);
  }

  private async onChangePosition(position: number) {
    await this.setStateAsync({ position });
    if (this.props.onChange) await this.props.onChange(this.state.position, this.state.pageSize);
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-table-pager'] = true;
    return classes;
  }

  public override render(): TJSXElementChild {
    if (this.nbPages < 2) return null;
    return (
      <nav ref={this.base} {...this.renderAttributes()}>
        {this.inside}
      </nav>
    );
  }

  public override get children() {
    return [
      <Select
        key='select'
        items={[
          { id: 5, label: '5' },
          { id: 10, label: '10' },
          { id: 25, label: '25' },
          { id: 50, label: '50' },
          { id: 100, label: '100' },
        ]}
        defaultValue={this.state.pageSize}
        onChange={(value) => this.onChangePageSize(value)}
      />,

      <Typography key='count' className='page-count' content={`Page ${this.state.position + 1} sur ${this.nbPages}`} />,

      <HorizontalStack key='icons'>
        {this.props.showFirstButton && (
          <Icon
            key='go-first-btn'
            disabled={this.isFirstPage}
            icon='toolkit-double-angle-left'
            onTap={() => this.onChangePosition(0)}
          />
        )}

        <Icon
          key='go-previous-btn'
          disabled={this.isFirstPage}
          icon='toolkit-angle-left'
          onTap={() => this.onChangePosition(this.state.position - 1)}
        />

        <Icon
          key='go-next-btn'
          disabled={this.isLastPage}
          icon='toolkit-angle-right'
          onTap={() => this.onChangePosition(this.state.position + 1)}
        />

        {this.props.showLastButton && (
          <Icon
            key='go-last-btn'
            disabled={this.isLastPage}
            icon='toolkit-double-angle-right'
            onTap={() => this.onChangePosition(this.nbPages - 1)}
          />
        )}
      </HorizontalStack>,
    ];
  }

  private get isFirstPage(): boolean {
    return this.firstRow === 0;
  }

  private get isLastPage(): boolean {
    return this.lastRow >= this.state.total - 1;
  }

  private get firstRow(): number {
    return this.state.position * this.state.pageSize;
  }

  private get lastRow(): number {
    let i = (this.state.position + 1) * this.state.pageSize - 1;
    if (i > this.state.total) i = this.state.total - 1;
    return i;
  }

  private get nbPages(): number {
    return Math.ceil(this.state.total / this.state.pageSize);
  }
}
