import { Container, IContainerProps, IContainerState } from '../container';
import { ITableHeadRow, TableHead } from './TableHead';
import { ITableBodyRow, TableBody } from './TableBody';
import { ITableFootRow, TableFoot } from './TableFoot';

export interface ITableProps extends IContainerProps {
  headers: ITableHeadRow[];
  rows: ITableBodyRow[];
  footers?: ITableFootRow[];
}

interface ITableState extends IContainerState {}

export class Table extends Container<ITableProps, ITableState> {
  public static override get defaultProps(): Omit<ITableProps, 'headers' | 'rows'> {
    return {
      ...super.defaultProps,
      scrollX: true,
    };
  }

  public override renderClasses() {
    const classes = super.renderClasses();
    classes['mn-table'] = true;
    return classes;
  }

  public override get children() {
    return (
      <table>
        <TableHead headers={this.props.headers} />
        <TableBody rows={this.props.rows} />
        {this.props.footers?.length && <TableFoot footers={this.props.footers} />}
      </table>
    );
  }
}
