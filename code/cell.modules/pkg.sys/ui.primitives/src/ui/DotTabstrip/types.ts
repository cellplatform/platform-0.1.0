export type DotTabstripItem = {
  label: string;
  value: any;
  isLoaded?: boolean;
  error?: string;
};

export type DotTabstripClickEvent = { item: DotTabstripItem; index: number };
export type DotTabstripClickEventHandler = (e: DotTabstripClickEvent) => void;
