export type DynamicRender<P = {}> = (props: P) => Promise<JSX.Element>;

export type IDynamicModule = {
  id: string;
  render: DynamicRender;
  isLoaded: boolean;
};

/**
 * [Events]
 */
export type LoaderEvent = IModuleAddedEvent | IModuleLoadedEvent;

export type IModuleAddedEvent = {
  type: 'LOADER/added';
  payload: IModuleAdded;
};
export type IModuleAdded = {
  id: string;
  module: IDynamicModule;
};

export type IModuleLoadedEvent = {
  type: 'LOADER/loaded';
  payload: IModuleLoaded;
};
export type IModuleLoaded = {
  id: string;
  module: IDynamicModule;
  el: JSX.Element;
};
