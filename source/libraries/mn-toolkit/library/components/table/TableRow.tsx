import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from '../containable';
import { ITableHeaderCell, TableHeader } from './TableHeader';
import { ITableDataCell, TableDataCell } from './TableDataCell';
import { classNames } from 'mn-tools';
import { AllHTMLAttributes } from 'react';

export interface ITableRow<C extends ITableHeaderCell | ITableDataCell> {
  cells: C[];
  className?: string;
  opened?: boolean;
  subRows?: C[];
  onTap?: (event: React.MouseEvent<HTMLTableCellElement>) => void | Promise<void>;
}

export interface ITableRowProps<C extends ITableHeaderCell | ITableDataCell> extends IToolkitComponentProps {
  row: ITableRow<C>;
  allHeaders?: boolean;
}

interface ITableRowState extends IToolkitComponentState {}

export class TableRow<C extends ITableHeaderCell | ITableDataCell> extends ToolkitComponent<
  ITableRowProps<C>,
  ITableRowState,
  HTMLTableRowElement
> {
  public renderClasses() {
    const classes: { [key: string]: boolean } = {};
    classes['has-click'] = !!this.props.row.onTap;
    return classes;
  }

  public renderAttributes() {
    const attributes: AllHTMLAttributes<HTMLTableRowElement> = {
      className: classNames(this.renderClasses()),
    };
    return attributes;
  }

  public override render() {
    const { row, allHeaders } = this.props;
    return (
      <tr ref={this.base} {...this.renderAttributes()}>
        {row.cells.map((cell, cellIndex) => {
          if (allHeaders || ('header' in cell && cell.header)) {
            return <TableHeader key={cellIndex} cell={cell} onTapRow={row.onTap} />;
          }
          return <TableDataCell key={cellIndex} cell={cell as ITableDataCell} onTapRow={row.onTap} />;
        })}
      </tr>
    );
  }
}
