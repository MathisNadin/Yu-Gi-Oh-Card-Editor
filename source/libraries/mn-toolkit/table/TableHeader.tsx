import { AllHTMLAttributes, createRef } from 'react';
import { classNames, isNumber, isString } from 'mn-tools';
import { JSXElementChild } from '../react';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from '../containable';
import { THorizontalAlignment, TVerticalAlignment, HorizontalStack } from '../container';
import { Icon } from '../icon';
import { Typography } from '../typography';

export type TTableHeaderSortOrder = 'asc' | 'desc';

export interface ITableHeaderCell {
  content: string | JSXElementChild;
  className?: string;
  colspan?: number;
  rowspan?: number;
  align?: THorizontalAlignment;
  verticalAlign?: TVerticalAlignment;
  sortOrder?: TTableHeaderSortOrder;
  onChangeOrder?: (newOrder: TTableHeaderSortOrder) => void | Promise<void>;
  onTap?: (event: React.MouseEvent) => void | Promise<void>;
}

export interface ITableHeaderProps extends IToolkitComponentProps {
  cell: ITableHeaderCell;
  onTapRow?: (event: React.MouseEvent) => void | Promise<void>;
}

interface ITableHeaderState extends IToolkitComponentState {}

export class TableHeader extends ToolkitComponent<ITableHeaderProps, ITableHeaderState> {
  public base = createRef<HTMLTableCellElement>();

  private async onTap(e: React.MouseEvent) {
    if (this.props.cell.onChangeOrder) {
      const newOrder = this.props.cell.sortOrder === 'asc' ? 'desc' : 'asc';
      this.props.cell.onChangeOrder(newOrder);
    }

    if (this.props.cell.onTap) {
      await this.props.cell.onTap(e);
    } else if (this.props.onTapRow) {
      await this.props.onTapRow(e);
    }
  }

  private get hasClick() {
    return !!this.props.cell.onChangeOrder || !!this.props.cell.onTap || !!this.props.onTapRow;
  }

  public renderClasses() {
    const classes: { [key: string]: boolean } = {};
    if (this.props.cell.className) classes[this.props.cell.className] = true;
    classes['has-click'] = this.hasClick;
    return classes;
  }

  public renderAttributes() {
    const attributes: AllHTMLAttributes<HTMLElement> = {
      className: classNames(this.renderClasses()),
      colSpan: this.props.cell.colspan || 1,
      rowSpan: this.props.cell.rowspan || 1,
    };
    if (this.hasClick) {
      attributes.onClick = (e: React.MouseEvent) => app.$errorManager.handlePromise(this.onTap(e));
    }
    return attributes;
  }

  public override render() {
    const { cell } = this.props;
    let content: JSXElementChild;
    if (isString(cell.content)) {
      content = <Typography bold variant='document' contentType='text' content={cell.content} />;
    } else if (isNumber(cell.content)) {
      content = <Typography bold variant='document' contentType='text' content={`${cell.content}`} />;
    } else {
      content = cell.content;
    }
    return (
      <th {...this.renderAttributes()} ref={this.base}>
        <HorizontalStack
          className='mn-cell-content'
          gutter
          itemAlignment={cell.align || 'center'}
          verticalItemAlignment={cell.verticalAlign || 'middle'}
        >
          {content}
          {(!!cell.sortOrder || !!cell.onChangeOrder) && (
            <Icon
              className={classNames({ hidden: !cell.sortOrder })}
              icon={cell.sortOrder === 'asc' ? 'toolkit-angle-up' : 'toolkit-angle-down'}
            />
          )}
        </HorizontalStack>
      </th>
    );
  }
}
