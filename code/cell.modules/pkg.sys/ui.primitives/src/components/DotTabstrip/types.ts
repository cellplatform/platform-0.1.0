export type DotTabstripItem = {
  label: string;
  value: any;
  isLoaded?: boolean;
  error?: string;
};
export type DotTabstripClickEventHandler = (e: DotTabstripItem) => void;
