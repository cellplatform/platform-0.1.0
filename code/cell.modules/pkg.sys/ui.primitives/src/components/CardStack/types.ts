export type CardStackItem = { id: string; el?: JSX.Element | CardStackItemRender };
export type CardStackItemRender = (e: CardStackItemRenderArgs) => JSX.Element;
export type CardStackItemRenderArgs = {
  total: number;
  position: number;
  index: number;
  is: { bottom: boolean; top: boolean };
};
