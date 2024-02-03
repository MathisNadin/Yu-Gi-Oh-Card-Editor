/* eslint-disable react/no-danger */
import './styles.css';
import {
  IContainerProps,
  IContainerState,
  Container
} from '../container/Container';
import { isDefined, classNames, isNumber, isString } from 'libraries/mn-tools';
import { ITableCell, CellValue, ITableColumn } from './interfaces';
import { ReactNode } from 'react';
import { ButtonIcon } from '../button';

export interface ITableRow {
  /** Set the name of the class. */
  className?: string;
  /** Set the cell of the row. */
  cells: (ITableCell | CellValue)[];
  /** Set the sub row. */
  subRows?: ITableRow[];
  /** Set the status of the row. */
  open?: boolean;
  onTap?: (row: ITableRow) => void | Promise<void>;
  selected?: boolean;
  height?: number;
}

interface ITableRowProps extends IContainerProps {
  columns: ITableColumn[];
  columnStyle: { [attribute: string]: string }[];
  row: ITableRow;
  hasSubRows: boolean;
  onToggleSubRows?: (row: ITableRow) => void;
}

interface ITableRowState extends IContainerState {}

export class TableRow extends Container<ITableRowProps, ITableRowState> {
  public static get defaultProps(): Partial<ITableRowProps> {
    return {
      ...super.defaultProps
    };
  }

  public constructor(props: ITableRowProps) {
    super(props);
    this.state = {} as ITableRowState;
  }

  public render() {
    let style: { height?: string } = {};
    if (isDefined(this.props.row.height)) {
      style.height = isNumber(this.props.row.height)
        ? `${this.props.row.height}px`
        : this.props.row.height;
    }
    return (
      <div
        className={classNames(
          'mn-table-row',
          this.props.row.className
            ? `mn-table-row-${this.props.row.className}`
            : null,
          {
            'mn-table-row-with-sub-rows': !!this.props.row.subRows?.length,
            'mn-table-row-clickable': !!this.props.row.onTap,
            'mn-table-row-selected': !!this.props.row.selected
          }
        )}
        style={style}
        onClick={
          this.props.row.onTap
            ? () =>
                app.$errorManager.handlePromise(
                  this.props.row.onTap && this.props.row.onTap(this.props.row)
                )
            : undefined
        }
      >
        {this.props.columns
          .map((column, i) => {
            let cell = this.props.row.cells[i] as ITableCell;
            // FIXME MN : J'ai ajouté une key au mn-table-cell-wrapper
            // car sinon le contenu n'est pas mis à jour d'une vue avec une table à l'autre
            // Ex : la vue 1 a une table donc la 3ème cell du 1er row est vide
            // puis on passe sur la vue 2 où à ce même endroit ça doit contenir un string
            // => eh bien non, faut F5 pour voir apparaître la valeur sur la vue 2
            // Ca marche avec une key mais je sens venir les effets de bord
            return (
              <div
                style={this.props.columnStyle[i]}
                className={classNames(
                  'mn-table-cell',
                  { 'no-padding': column.noPadding },
                  column.className,
                  `mn-align-${!!column.align ? column.align : 'left'}`,
                  `mn-vertical-align-${
                    !!column.verticalAlign ? column.verticalAlign : 'center'
                  }`,
                  `mn-table-cell-${cell.className}`
                )}
              >
                {!i && this.props.hasSubRows && (
                  <div className="mn-table-toggle-sub-rows">
                    {!!this.props.row.subRows?.length && (
                      <ButtonIcon
                        icon={
                          this.props.row.open
                            ? 'toolkit-angle-down'
                            : 'toolkit-angle-right'
                        }
                        onTap={() => this.props.onToggleSubRows && this.props.onToggleSubRows(this.props.row)}
                      />
                    )}
                  </div>
                )}

                {isString(cell.value) ? (
                  <div
                    className="mn-table-cell-wrapper"
                    dangerouslySetInnerHTML={{ __html: cell.value }}
                  />
                ) : (
                  <div
                    key={`${cell.value}-${cell.className}`}
                    className="mn-table-cell-wrapper"
                  >
                    {cell.value as ReactNode}
                  </div>
                )}
              </div>
            );
          })
          .filter((x) => !!x)}
      </div>
    );
  }
}
