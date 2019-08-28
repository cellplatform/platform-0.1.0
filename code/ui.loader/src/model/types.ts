export type DynamicRender = () => Promise<JSX.Element>;

export type IDynamicModule = {
  id: string;
  render: DynamicRender;
};

/**
 * [Events]
 */
export type LoaderEvent = IModuleAddedEvent;

export type IModuleAddedEvent = {
  type: 'LOADER/added';
  payload: IModuleAdded;
};
export type IModuleAdded = {
  id: string;
  module: IDynamicModule;
};
