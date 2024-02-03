import './styles.css';
import { isEmpty, classNames, integer, clone } from 'libraries/mn-tools';
import {
  IContainerProps,
  IContainerState,
  Container
} from '../container/Container';
import { Spinner } from '../spinner/Spinner';
import {
  ITableColumn,
  CellValue,
  ITableCell,
  themeSettings
} from './interfaces';
import { ITableRow, TableRow } from './TableRow';
import { ReactNode } from 'react';
import { VerticalStack } from '../container/VerticalStack';
import { Icon } from '../icon';

interface ITableProps extends IContainerProps {
  /** Set a table of columns. */
  columns?: ITableColumn[];
  /** Set a footer. */
  footer?: ReactNode | ReactNode[];
  /** Set a table of rows. */
  rows?: CellValue[][] | ITableRow[];
  /** Set the number of visible rows? */
  visibleRows?: number;
  /** Set the number of visible rows? */
  maxVisibleRows?: number;
  /** Set loading. */
  loading?: boolean;
  /** Set the default width. */
  defaultWidth?: string;
  /** Set the theme. */
  theme?: 'normal' | 'compact' | 'narrow';
}

interface ITableState extends IContainerState {
  rows: ITableRow[];
  columns: ITableColumn[];
  columnStyle: { [attribute: string]: string }[];
  hasHeader: boolean;
  left: number;
  top: number;
}

/** Create a table
 *
 * Constructor need ITableProps
 * - ?columns
 * - ?footer
 * - ?rows
 * - ?visibleRows
 * - ?maxVisibleRows
 * - ?loading
 * - ?defaultWidth
 * - ?theme
 *
 */
export class Table extends Container<ITableProps, ITableState> {
  private left!: number;
  private top!: number;
  private hasSubRows!: boolean;

  public static get defaultProps(): Partial<ITableProps> {
    return {
      ...super.defaultProps,
      theme: 'normal',
      layout: 'vertical'
    };
  }

  public constructor(props: ITableProps) {
    super(props);
    this.state = { left: 0, top: 0 } as ITableState;
  }

  public componentDidMount() {
    this.processxProps(this.props);
  }

  public componentWillReceiveProps(props: ITableProps) {
    this.processxProps(props);
  }

  private loading(props: ITableProps) {
    return props.loading || !props.columns || !props.rows;
  }

  public processxProps(props: ITableProps) {
    if (this.loading(props)) return;
    let nbNoWidth = 0;
    let nbHeaderLabel = 0;
    let sum: string[] = [];
    let cols = props.columns
      ? props.columns.filter((x) => !x.outside && !x.hidden)
      : [];

    let first = cols.length > 0 ? cols[0] : undefined;
    let last = cols.length > 0 ? cols[cols.length - 1] : undefined;
    let hiddenIndexes = (props.columns || [])
      .map((x, i) => (!!x.hidden ? i : -1))
      .filter((x) => x !== -1);

    let columns = props.columns
      ? props.columns
          .filter((x) => !x.hidden)
          .map((column) => {
            if (column.label) nbHeaderLabel++;
            if (column.rotate === '90deg') {
              sum.push('2em');
            } else if (column.width) {
              sum.push(column.width + themeSettings().themeDefaultSpacing);
            } else {
              nbNoWidth++;
            }
            let newColumn = clone(column);
            newColumn.className = newColumn.className || '';
            if (column.outside) newColumn.className += ' outside-cell';
            if (first === column) newColumn.className += ' first-cell';
            if (last === column) newColumn.className += ' last-cell';
            return newColumn;
          })
      : [];

    let ssum = sum.length ? `100% - (${sum.join(' + ')})` : '100%';
    this.setState({
      columns,
      hasHeader: !!nbHeaderLabel,
      columnStyle: columns.map((x) => {
        let style: { [k: string]: string } = {};
        if (this.props.defaultWidth && !x.width)
          x.width = this.props.defaultWidth;
        if (x.width) {
          style.maxWidth = x.width;
          style.minWidth = x.width;
        } else if (ssum) {
          style.maxWidth = `calc((${ssum}) / ${nbNoWidth} - ${themeSettings().themeDefaultSpacing}px)`;
          style.minWidth = `calc((${ssum}) / ${nbNoWidth} - ${themeSettings().themeDefaultSpacing}px)`;
        }
        if (x.rotate === '90deg') {
          style['writing-mode'] = 'vertical-rl';
          style.maxWidth = '2em';
          style.minHeight = '56px';
          style.maxHeight = '56px';
          style.overflow = 'hidden';
          x.headerAlign = 'left';
        }
        return style;
      })
    });
    this.setState({
      rows: props.rows
        ? this.rebuildRows(props.rows, props.columns || [], hiddenIndexes)
        : []
    });
  }

  private rebuildRows(
    rows: ITableRow[] | CellValue[][],
    columns: ITableColumn[],
    hiddenIndexes: number[] = []
  ) {
    let resultRows: ITableRow[] = [];
    for (let row of rows) {
      let resultRow: ITableRow = {} as unknown as ITableRow;
      if (!!(row as ITableRow).cells) {
        resultRow = row as ITableRow;
      } else {
        resultRow.cells = [];
        (row as unknown as ITableCell[]).forEach((cell) => {
          if (
            cell &&
            typeof cell.className !== 'undefined' &&
            typeof cell.value === 'undefined'
          ) {
            if (!isEmpty(cell.className)) resultRow.className = cell.className;
          } else {
            resultRow.cells.push(cell);
          }
        });
      }
      if (resultRow.cells.length !== columns.length) {
        // eslint-disable-next-line no-console
        console.error(
          'On doit avoir autant de cellule sur une ligne que de colonnes définies.'
        );
        return [];
      }

      resultRow.cells = resultRow.cells
        .filter((_x, i) => hiddenIndexes.indexOf(i) === -1)
        .map((cell, i) => {
          let resultCell: ITableCell;
          if (
            !!cell &&
            typeof (cell as unknown as HTMLElement).children === 'undefined' &&
            typeof cell === 'object'
          ) {
            resultCell = cell as ITableCell;
          } else {
            resultCell = { value: cell as CellValue };
          }
          resultCell.className = resultCell.className || `${i}`;
          return resultCell;
        });

      resultRow.subRows = this.rebuildRows(
        (row as ITableRow).subRows || [],
        columns
      );
      this.hasSubRows = this.hasSubRows || !!resultRow.subRows.length;

      resultRows.push(resultRow);
    }
    return resultRows;
  }

  private updateScroll() {
    let table = document.querySelector('.mn-table');
    if (!table) return;
    this.left = table.scrollLeft || 0;
    this.top = table.scrollTop || 0;
    requestAnimationFrame(() => {
      let head = document.querySelector<HTMLElement>('.mn-table-head');
      if (head) head.style.top = `${this.top}px`;
      let cells = Array.from(
        document.querySelectorAll<HTMLElement>('.mn-table-cell-0')
      );
      cells.forEach((elt) => (elt.style.left = `${this.left}px`));
      let footer = document.querySelector<HTMLElement>('.mn-table-footer');
      if (footer) footer.style.bottom = `-${this.top}px`;
    });
  }

  public render() {
    let tableBodyStyle: { [k: string]: string | number } = {};

    let minBodyHeight!: number;
    let maxBodyHeight!: number;
    if (this.props.visibleRows) {
      minBodyHeight =
        themeSettings().themeDefaultItemHeight * this.props.visibleRows;
    }
    if (this.props.maxVisibleRows) {
      maxBodyHeight =
        themeSettings().themeDefaultItemHeight * this.props.maxVisibleRows;
    }

    if (minBodyHeight || maxBodyHeight) {
      tableBodyStyle = {
        minHeight: minBodyHeight,
        maxHeight: maxBodyHeight
      };
    }

    return this.renderAttributes(
      <div
        onScroll={() => this.updateScroll()}
        className={classNames(`mn-table-theme-${this.props.theme}`, {
          'mn-table-scroll': !!this.props.visibleRows
        })}
      >
        {this.loading(this.props) && <Spinner overlay />}
        {this.state.hasHeader && (
          <div className="mn-table-head" style={{ top: this.top }}>
            <div className="mn-table-row">
              {this.state.columns
                .map((column, i) => {
                  return (
                    <div
                      style={this.state.columnStyle[i]}
                      className={classNames(
                        column.className,
                        'mn-table-cell',
                        `mn-table-cell-${i}`,
                        `mn-align-${
                          !!column.headerAlign
                            ? column.headerAlign
                            : !!column.align
                            ? column.align
                            : 'center'
                        }`
                      )}
                    >
                      <span
                        className="mn-table-header-label"
                        onClick={() => {
                          if (column.onChangeOrder)
                            app.$errorManager.handlePromise(
                              column.onChangeOrder()
                            );
                        }}
                      >
                        <span className="mn-table-header-text">
                          {column.label as ReactNode}
                        </span>
                        {column.order && (
                          <Icon
                            iconId={
                              column.order === 'asc'
                                ? 'toolkit-angle-up'
                                : 'toolkit-angle-down'
                            }
                          />
                        )}
                      </span>
                    </div>
                  );
                })
                .filter((x) => !!x)}
            </div>
          </div>
        )}
        <VerticalStack className="mn-table-body" style={tableBodyStyle}>
          {this.state.rows &&
            this.state.rows.map((row) =>
              [
                <TableRow
                  row={row}
                  columnStyle={this.state.columnStyle}
                  columns={this.state.columns}
                  hasSubRows={this.hasSubRows}
                  onToggleSubRows={(row) => {
                    row.open = !row.open;
                    this.forceUpdate();
                  }}
                />
              ].concat(
                row.open && row.subRows
                  ? row.subRows.map((row) => (
                      <TableRow
                        row={row}
                        columnStyle={this.state.columnStyle}
                        columns={this.state.columns}
                        hasSubRows={this.hasSubRows}
                      />
                    ))
                  : []
              )
            )}
        </VerticalStack>
        {this.props.footer ? (
          <div className="mn-table-footer">{this.props.footer}</div>
        ) : null}
      </div>,
      'mn-table'
    );
  }

  /*   private adaptColumnStyle(): { [attribute: string]: string; } {
        return { 'max-width': `${integer(this.state.columnStyle[0]['max-width']) + 4}%`, 'min-width': `${integer(this.state.columnStyle[0]['min-width']) + 4}%` };
      } */
}
