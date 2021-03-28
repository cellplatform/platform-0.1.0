import { React } from '@ungap/global-this';

export type PropListDefaults = {
  clipboard?: boolean;
  monospace?: boolean;
};

export type PropListItem = {
  label: React.ReactNode;
  value?: React.ReactNode | PropListValue;
  tooltip?: string;
  visible?: boolean;
};

export type PropListValue = {
  data?: React.ReactNode;
  monospace?: boolean;
  clipboard?: string | boolean;
  onClick?: (e: PropListValueEventArgs) => void;
};

export type PropListValueEventArgs = {
  item: PropListItem;
  value: PropListValue;
  message: (value: React.ReactNode, delay?: number) => void;
};
