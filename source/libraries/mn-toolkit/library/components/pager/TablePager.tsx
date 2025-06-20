import { TJSXElementChild } from '../../system';
import { Container, IContainerProps, IContainerState, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { ISelectItem, Select } from '../select';
import { Typography } from '../typography';

interface ITablePagerProps extends IContainerProps<HTMLElement> {
  showFirstButton?: boolean;
  showLastButton?: boolean;
  pageSizeItems: ISelectItem<number>[];
  pageSize: number;
  total: number;
  position: number;
  onChange: (position: number, pageSize: number) => void | Promise<void>;
}

interface ITablePagerState extends IContainerState {}

export class TablePager extends Container<ITablePagerProps, ITablePagerState, HTMLElement> {
  public static override get defaultProps(): Omit<ITablePagerProps, 'position' | 'total' | 'pageSize' | 'onChange'> {
    return {
      ...super.defaultProps,
      layout: 'horizontal',
      gutter: true,
      verticalItemAlignment: 'middle',
      pageSizeItems: [
        { id: 5, label: '5' },
        { id: 10, label: '10' },
        { id: 25, label: '25' },
        { id: 50, label: '50' },
        { id: 100, label: '100' },
      ],
    };
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
      <Select<number>
        key='select'
        items={this.props.pageSizeItems}
        value={this.props.pageSize}
        onChange={(pageSize) => this.props.onChange(this.props.position, pageSize)}
      />,

      <Typography key='count' className='page-count' content={`Page ${this.props.position + 1} sur ${this.nbPages}`} />,

      <HorizontalStack key='icons'>
        {this.props.showFirstButton && (
          <Icon
            key='go-first-btn'
            hint='Aller à la première page'
            name='Aller à la première page'
            disabled={this.isFirstPage}
            icon='toolkit-double-angle-left'
            onTap={() => this.props.onChange(0, this.props.pageSize)}
          />
        )}

        <Icon
          key='go-previous-btn'
          hint='Aller à la page précédente'
          name='Aller à la page précédente'
          disabled={this.isFirstPage}
          icon='toolkit-angle-left'
          onTap={() => this.props.onChange(this.props.position - 1, this.props.pageSize)}
        />

        <Icon
          key='go-next-btn'
          hint='Aller à la prochaine page'
          name='Aller à la prochaine page'
          disabled={this.isLastPage}
          icon='toolkit-angle-right'
          onTap={() => this.props.onChange(this.props.position + 1, this.props.pageSize)}
        />

        {this.props.showLastButton && (
          <Icon
            key='go-last-btn'
            disabled={this.isLastPage}
            hint='Aller à la dernière page'
            name='Aller à la dernière page'
            icon='toolkit-double-angle-right'
            onTap={() => this.props.onChange(this.nbPages - 1, this.props.pageSize)}
          />
        )}
      </HorizontalStack>,
    ];
  }

  private get isFirstPage(): boolean {
    return this.firstRow === 0;
  }

  private get isLastPage(): boolean {
    return this.lastRow >= this.props.total - 1;
  }

  private get firstRow(): number {
    return this.props.position * this.props.pageSize;
  }

  private get lastRow(): number {
    let i = (this.props.position + 1) * this.props.pageSize - 1;
    if (i > this.props.total) i = this.props.total - 1;
    return i;
  }

  private get nbPages(): number {
    return Math.ceil(this.props.total / this.props.pageSize);
  }
}
