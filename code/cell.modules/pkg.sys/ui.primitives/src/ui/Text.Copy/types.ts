type Pixels = number;
type Milliseconds = number;

/**
 * Fired when a mouse event occurs.
 */
export type TextCopyMouseAction = 'Over' | 'Leave' | 'Down' | 'Up';
export type TextCopyMouseEvent = { isOver: boolean; isDown: boolean; action: TextCopyMouseAction };
export type TextCopyMouseEventHandler = (e: TextCopyMouseEvent) => void;

/**
 * Fired when a value is to be copied to the clipboard.
 */
export type TextCopyEvent = {
  children: React.ReactNode;
  copy(value: string): void;
  message(value: string | JSX.Element, options?: TextCopyMessageOptions): void;
};
export type TextCopyMessageOptions = {
  delay?: Milliseconds;
  opacity?: number; // To set the content to while message is showing.
  blur?: Pixels;
};
export type TextCopyEventHandler = (e: TextCopyEvent) => void;

/**
 * Properties describing what edge icon to render when over.
 */
export type TextCopyIcon = {
  element: JSX.Element | (() => JSX.Element);
  edge?: 'N' | 'S' | 'W' | 'E';
  offset?: number;
};
