import { AllHTMLAttributes, createRef } from 'react';
import { classNames, isNumber, isString } from 'mn-tools';
import { JSXElementChild } from '../react';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from '../containable';
import { HorizontalStack, THorizontalAlignment, TVerticalAlignment } from '../container';
import { Typography } from '../typography';

export interface ITableDataCell {
  content: string | JSXElementChild;
  className?: string;
  header?: boolean;
  colspan?: number;
  rowspan?: number;
  align?: THorizontalAlignment;
  verticalAlign?: TVerticalAlignment;
  onTap?: (event: React.MouseEvent) => void | Promise<void>;
}

export interface ITableDataCellProps extends IToolkitComponentProps {
  cell: ITableDataCell;
  onTapRow?: (event: React.MouseEvent) => void | Promise<void>;
}

interface ITableDataCellState extends IToolkitComponentState {}

export class TableDataCell extends ToolkitComponent<ITableDataCellProps, ITableDataCellState> {
  public base = createRef<HTMLTableCellElement>();

  public renderClasses() {
    const classes: { [key: string]: boolean } = {};
    if (this.props.cell.className) classes[this.props.cell.className] = true;
    classes['has-click'] = !!this.props.cell.onTap || !!this.props.onTapRow;
    return classes;
  }

  public renderAttributes() {
    const attributes: AllHTMLAttributes<HTMLElement> = {
      className: classNames(this.renderClasses()),
      colSpan: this.props.cell.colspan || 1,
      rowSpan: this.props.cell.rowspan || 1,
    };
    if (this.props.cell.onTap) {
      attributes.onClick = (e: React.MouseEvent) => app.$errorManager.handlePromise(this.props.cell.onTap?.(e));
    } else if (this.props.onTapRow) {
      attributes.onClick = (e: React.MouseEvent) => app.$errorManager.handlePromise(this.props.onTapRow?.(e));
    }
    return attributes;
  }

  public override render() {
    const { cell } = this.props;
    let content: JSXElementChild;
    if (isString(cell.content)) {
      content = <Typography variant='document' contentType='text' content={cell.content} />;
    } else if (isNumber(cell.content)) {
      content = <Typography variant='document' contentType='text' content={`${cell.content}`} />;
    } else {
      content = cell.content;
    }
    return (
      <td {...this.renderAttributes()} ref={this.base}>
        <HorizontalStack
          className='mn-cell-content'
          itemAlignment={cell.align || 'center'}
          verticalItemAlignment={cell.verticalAlign || 'middle'}
        >
          {content}
        </HorizontalStack>
      </td>
    );
  }
}
