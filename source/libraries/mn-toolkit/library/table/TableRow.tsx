import { createRef } from 'react';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from '../containable';
import { ITableHeaderCell, TableHeader } from './TableHeader';
import { ITableDataCell, TableDataCell } from './TableDataCell';

export interface ITableRow<C extends ITableHeaderCell | ITableDataCell> {
  cells: C[];
  className?: string;
  opened?: boolean;
  subRows?: C[];
  onTap?: (event: React.MouseEvent) => void | Promise<void>;
}

export interface ITableRowProps<C extends ITableHeaderCell | ITableDataCell> extends IToolkitComponentProps {
  row: ITableRow<C>;
  allHeaders?: boolean;
}

interface ITableRowState extends IToolkitComponentState {}

export class TableRow<C extends ITableHeaderCell | ITableDataCell> extends ToolkitComponent<
  ITableRowProps<C>,
  ITableRowState
> {
  public base = createRef<HTMLTableRowElement>();

  public override render() {
    const { row, allHeaders } = this.props;
    return (
      <tr ref={this.base} className={row.className}>
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
