export type VirtualListAlign = 'auto' | 'smart' | 'center' | 'end' | 'start';

/**
 * Factory for producing list items when they come into view.
 */
export type VirtualListFactory = (args: VirtualListFactoryArgs) => VirtualListFactoryResponse;
export type VirtualListFactoryArgs = {
  index: number;
  style: React.CSSProperties;
  isScrolling?: boolean;
};
export type VirtualListFactoryResponse = JSX.Element;

/**
 * Calculates the size (height) of an item in pixels.
 */
export type VirtualListItemSize = (index: number) => number;
