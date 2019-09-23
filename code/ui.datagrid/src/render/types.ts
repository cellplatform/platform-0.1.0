export type Renderer = (
  instance: any,
  td: HTMLElement,
  row: number,
  column: number,
  prop: any,
  value: any,
  cellProps: any,
) => void;

export type RegisterRenderer = (name: string, renderer: Renderer) => void;
