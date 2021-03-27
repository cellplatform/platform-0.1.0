import { React } from '@ungap/global-this';

export type PropListDefaults = {
  clipboard?: boolean;
};

export type PropListItem = {
  label: React.ReactNode;
  value?: React.ReactNode | PropListValue;
  tooltip?: string;
  visible?: boolean;
  onClick?: (e: PropListItemClickEventArgs) => void;
};

export type PropListValue = {
  data?: React.ReactNode;
  monospace?: boolean;
  clipboard?: string | boolean;
};

export type PropListItemClickEventArgs = {
  data: PropListItem;
  message: (message: React.ReactNode, delay?: number) => void;
};
