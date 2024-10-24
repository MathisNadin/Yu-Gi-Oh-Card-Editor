import { createRef } from 'react';
import { classNames } from 'mn-tools';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from '../containable';
import { HorizontalStack } from '../container';
import { ITableHeadRow, TableHead } from './TableHead';
import { ITableBodyRow, TableBody } from './TableBody';
import { ITableFootRow, TableFoot } from './TableFoot';

export interface ITableProps extends IToolkitComponentProps {
  className?: string;
  margin?: boolean;
  maxHeight?: number | string;
  headers: ITableHeadRow[];
  rows: ITableBodyRow[];
  footers?: ITableFootRow[];
}

interface ITableState extends IToolkitComponentState {}

export class Table extends ToolkitComponent<ITableProps, ITableState> {
  public base = createRef<HorizontalStack>();

  public override render() {
    return (
      <HorizontalStack
        ref={this.base}
        className={classNames('mn-table', this.props.className)}
        scrollX
        maxHeight={this.props.maxHeight}
        margin={this.props.margin}
      >
        <table>
          <TableHead headers={this.props.headers} />
          <TableBody rows={this.props.rows} />
          {this.props.footers && <TableFoot footers={this.props.footers} />}
        </table>
      </HorizontalStack>
    );
  }
}
