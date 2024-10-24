import { createRef } from 'react';
import { ToolkitComponent, IToolkitComponentProps, IToolkitComponentState } from '../containable';
import { ITableRow, TableRow } from './TableRow';
import { ITableHeaderCell } from './TableHeader';

export interface ITableHeadRow extends ITableRow<ITableHeaderCell> {
  opened?: never;
  subRows?: never;
}

export interface ITableHeadProps extends IToolkitComponentProps {
  headers: ITableHeadRow[];
}

interface ITableHeadState extends IToolkitComponentState {}

export class TableHead extends ToolkitComponent<ITableHeadProps, ITableHeadState> {
  public base = createRef<HTMLTableSectionElement>();

  public override render() {
    return (
      <thead ref={this.base}>
        {this.props.headers.map((row, rowIndex) => (
          <TableRow key={rowIndex} row={row} allHeaders={true} />
        ))}
      </thead>
    );
  }
}
