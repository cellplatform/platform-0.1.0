export type OptionItem<V = any> = { label: string; value: V };

export type OptionClickEventHandler = (e: OptionClickEvent) => void;
export type OptionClickEvent = {
  index: number;
  item: OptionItem;
  items: OptionItem[];
  action: { select: boolean; deselect: boolean };
};

export type OptionRenderFactory = {
  label?(props: {
    label: string;
    value: any;
    index: number;
    isSelected: boolean;
    isEnabled: boolean;
    isLast: boolean;
  }): JSX.Element | undefined;
};
