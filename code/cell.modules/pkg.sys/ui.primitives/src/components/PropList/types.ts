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
  label: React.ReactNode;
  value?: React.ReactNode | PropListValue;
  tooltip?: string;
  visible?: boolean;
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
