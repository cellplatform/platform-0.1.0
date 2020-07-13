export type VirtualListFactory = (args: VirtualListFactoryArgs) => VirtualListFactoryResponse;
export type VirtualListFactoryArgs = {
  index: number;
  style: React.CSSProperties;
  isScrolling?: boolean;
};
export type VirtualListFactoryResponse = JSX.Element;

export type VirtualListItemSize = (index: number) => number;
