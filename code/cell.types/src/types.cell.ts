export type CellValue = string | boolean | number | object | null | undefined;

export type ICellProps = {
  value?: CellValue; // The calculated display value if different from the raw cell value.
};

export type ICellData<P extends ICellProps = ICellProps> = {
  value?: CellValue;
  props?: P;
  hash?: string;
};
