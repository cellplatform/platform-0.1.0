import * as React from 'react';

export type IPropListItem = {
  label: React.ReactNode;
  value?: React.ReactNode;
  tooltip?: string;
  clipboard?: string;
  visible?: boolean
  onClick?: (e: IPropListItemEventArgs) => void;
};

export type IPropListItemEventArgs = {
  data: IPropListItem;
  message: (message: React.ReactNode, delay?: number) => void;
};
