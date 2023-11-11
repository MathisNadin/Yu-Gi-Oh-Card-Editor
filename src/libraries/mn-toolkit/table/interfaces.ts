export function themeSettings() {
  return {
    "themeDefaultSpacing": 16,
    "themeDefaultItemHeight": 32,
    "themeDefaultBorderRadius": 6,
    "themeDefaultFontSize": 16,
    "themeMaxContentWidth": 750,
    "themeMaxListWidth": 749,
    "fieldBorderSize": 1
  };
}

export type TableColumnSortOrder = undefined | 'asc' | 'desc';

export function cycleSortOrder(order: TableColumnSortOrder) {
  if (order === 'asc') {
    return 'desc';
  } else if (order === 'desc') {
    return undefined;
  } else {
    return 'asc';
  }
}

export interface ITableColumn {
  /** Set the name of the column. */
  label?: string | Node | Element;
  /** Set the width of the column. */
  width?: string;
  noPadding?: boolean;
  /** Set the align of the column. */
  align?: 'left' | 'right' | 'center';
  /** Set the header align of the column. syntax : 'left' | 'right' | 'center' */
  headerAlign?: 'left' | 'right' | 'center';
  /** Set the vertical aign of the column. syntax : 'top' | 'center' | 'bottom' */
  verticalAlign?: 'top' | 'center' | 'bottom';
  /** Set the rotation of the column. syntax : '0deg' | '90deg' */
  rotate?: '0deg' | '90deg';
  hidden?: boolean;
  className?: string;
  order?: TableColumnSortOrder;
  onChangeOrder?: () => void;
  outside?: boolean;
}

export type CellValue = string | number | Date | boolean | Node;

export interface ITableCell {
  /** Set the value of the cell. */
  value: CellValue;
  /** Set the name of the class. */
  className?: string;
}
