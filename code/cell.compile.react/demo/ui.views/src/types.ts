export type LoadedView = { default: (props: {}) => JSX.Element };

export type View = {
  name: string;
  load: () => Promise<LoadedView>;
};
