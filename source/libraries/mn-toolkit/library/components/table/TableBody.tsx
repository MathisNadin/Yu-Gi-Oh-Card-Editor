import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from '../containable';
import { ITableRow, TableRow } from './TableRow';
import { ITableDataCell } from './TableDataCell';

export interface ITableBodyRow extends ITableRow<ITableDataCell> {}

export interface ITableBodyProps extends IToolkitComponentProps {
  rows: ITableBodyRow[];
  maxHeight?: number | string;
}

interface ITableBodyState extends IToolkitComponentState {}

export class TableBody extends ToolkitComponent<ITableBodyProps, ITableBodyState, HTMLTableSectionElement> {
  public override render() {
    return (
      <tbody ref={this.base}>
        {this.props.rows.map((row, rowIndex) => (
          <TableRow key={rowIndex} row={row} />
        ))}
      </tbody>
    );
  }
}
