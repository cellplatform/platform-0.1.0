export type OptionItem<V = any> = { label: string; value: V };

export type OptionClickEventHandler = (e: OptionClickEvent) => void;
export type OptionClickEvent = {
  index: number;
  item: OptionItem;
  items: OptionItem[];
  action: { select: boolean; deselect: boolean };
};
