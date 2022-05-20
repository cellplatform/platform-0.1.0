import * as t from '../../common/types';

/**
 * Component
 */
export type PropListTheme = 'Dark' | 'Light';
export type PropListProps = {
  title?: string | React.ReactNode | null;
  titleEllipsis?: boolean;
  items?: (PropListItem | undefined)[] | Record<string, unknown>;
  defaults?: t.PropListDefaults;
  padding?: t.CssEdgesInput;
  margin?: t.CssEdgesInput;
  width?: number | { fixed?: number; min?: number; max?: number };
  height?: number | { fixed?: number; min?: number; max?: number };
  theme?: t.PropListTheme;
  style?: t.CssValue;
};

/**
 * Factory
 */
export type PropListFieldBuilder<F extends string> = {
  field(name: F, item: PropListItemFactory | PropListItem): PropListFieldBuilder<F>;
  items(fields?: F[]): PropListItem[];
};
export type PropListItemFactory = () => PropListItem | PropListItem[] | undefined;

/**
 * Default values used when optional properties are ommitted.
 */
export type PropListDefaults = {
  clipboard?: boolean;
  monospace?: boolean;
};

/**
 * A single row within a [PropList].
 */
export type PropListItem = {
  label?: React.ReactNode;
  value?: React.ReactNode | PropListValue;
  tooltip?: string;
  visible?: boolean;
  indent?: number;
};

/**
 * The value portion of a [PropList] item.
 */
export type PropListValue = PropListValueGeneric | PropListValueKinds;
export type PropListValueGeneric = ValueBase & { data?: React.ReactNode };

export type PropListValueKinds = PropListValueSwitch;
export type PropListValueSwitch = ValueBase & { data?: boolean; kind: 'Switch' };

type ValueBase = {
  monospace?: boolean;
  clipboard?: string | boolean | (() => string);
  color?: string | number;
  fontSize?: number;
  bold?: boolean;
  onClick?: (e: PropListValueEventArgs) => void;
};

/**
 * CLICK event arguments.
 */
export type PropListValueEventArgs = {
  item: PropListItem;
  value: PropListValue;
  message: (value: React.ReactNode, delay?: number) => void;
};
