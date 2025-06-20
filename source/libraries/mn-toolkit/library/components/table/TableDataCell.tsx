import { AllHTMLAttributes } from 'react';
import { classNames, isNumber, isString } from 'mn-tools';
import { IRouterHrefParams, TJSXElementChild, TRouterState } from '../../system';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from '../containable';
import { AnchorContainer, HorizontalStack, THorizontalAlignment, TVerticalAlignment } from '../container';
import { Typography } from '../typography';

export interface ITableDataCell<T extends TRouterState = TRouterState> {
  content: string | TJSXElementChild;
  href?: string | IRouterHrefParams<T>;
  className?: string;
  header?: boolean;
  colspan?: number;
  rowspan?: number;
  align?: THorizontalAlignment;
  verticalAlign?: TVerticalAlignment;
  onTap?: (event: React.MouseEvent<HTMLTableCellElement>) => void | Promise<void>;
}

export interface ITableDataCellProps<T extends TRouterState = TRouterState> extends IToolkitComponentProps {
  cell: ITableDataCell<T>;
  onTapRow?: (event: React.MouseEvent<HTMLTableCellElement>) => void | Promise<void>;
}

interface ITableDataCellState extends IToolkitComponentState {}

export class TableDataCell extends ToolkitComponent<ITableDataCellProps, ITableDataCellState, HTMLTableCellElement> {
  public renderClasses() {
    const classes: { [key: string]: boolean } = {};
    if (this.props.cell.className) classes[this.props.cell.className] = true;
    classes['has-click'] = !!this.props.cell.onTap || !!this.props.onTapRow;
    return classes;
  }

  public renderAttributes() {
    const attributes: AllHTMLAttributes<HTMLTableCellElement> = {
      className: classNames(this.renderClasses()),
      colSpan: this.props.cell.colspan || 1,
      rowSpan: this.props.cell.rowspan || 1,
    };
    if (this.props.cell.onTap) {
      attributes.onClick = (e) => {
        if (this.props.cell.onTap) app.$errorManager.handlePromise(this.props.cell.onTap(e));
      };
    } else if (this.props.onTapRow) {
      attributes.onClick = (e) => {
        if (this.props.onTapRow) app.$errorManager.handlePromise(this.props.onTapRow(e));
      };
    }
    return attributes;
  }

  public override render() {
    const { cell } = this.props;
    let content: TJSXElementChild;
    if (isString(cell.content)) {
      content = <Typography variant='document' contentType='text' content={cell.content} />;
    } else if (isNumber(cell.content)) {
      content = <Typography variant='document' contentType='text' content={`${cell.content}`} />;
    } else {
      content = cell.content;
    }
    return (
      <td {...this.renderAttributes()} ref={this.base}>
        {cell.href ? (
          <AnchorContainer
            className='mn-cell-content'
            layout='horizontal'
            href={cell.href}
            itemAlignment={cell.align || 'center'}
            verticalItemAlignment={cell.verticalAlign || 'middle'}
          >
            {content}
          </AnchorContainer>
        ) : (
          <HorizontalStack
            className='mn-cell-content'
            itemAlignment={cell.align || 'center'}
            verticalItemAlignment={cell.verticalAlign || 'middle'}
          >
            {content}
          </HorizontalStack>
        )}
      </td>
    );
  }
}
