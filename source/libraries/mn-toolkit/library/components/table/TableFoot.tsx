import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from '../containable';
import { ITableRow, TableRow } from './TableRow';
import { ITableDataCell } from './TableDataCell';

export interface ITableFootRow extends ITableRow<ITableDataCell> {
  opened?: never;
  subRows?: never;
}

export interface ITableFootProps extends IToolkitComponentProps {
  footers: ITableFootRow[];
}

interface ITableFootState extends IToolkitComponentState {}

export class TableFoot extends ToolkitComponent<ITableFootProps, ITableFootState, HTMLTableSectionElement> {
  public override render() {
    return (
      <tfoot ref={this.base}>
        {this.props.footers.map((row, rowIndex) => (
          <TableRow key={rowIndex} row={row} />
        ))}
      </tfoot>
    );
  }
}
