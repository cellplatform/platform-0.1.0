export type PropListDefaults = {
  clipboard?: boolean;
};

export type PropListItem = {
  label: React.ReactNode;
  value?: React.ReactNode;
  tooltip?: string;
  clipboard?: string;
  visible?: boolean;
  onClick?: (e: PropListItemClickEventArgs) => void;
};

export type PropListItemClickEventArgs = {
  data: PropListItem;
  message: (message: React.ReactNode, delay?: number) => void;
};
