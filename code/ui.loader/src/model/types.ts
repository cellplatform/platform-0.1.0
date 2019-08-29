import { Observable } from 'rxjs';

/**
 * Load exeution.
 */
export type LoadModule<T = any, P = {}> = (props?: P) => Promise<LoadModuleResponse<T>>;
export type LoadModuleResponse<T = any> = {
  ok: boolean;
  count: number;
  result?: T;
  error?: Error;
  timedOut: boolean;
};
export type RenderModuleResponse = {
  ok: boolean;
  count: number;
  element?: JSX.Element;
  error?: Error;
  timedOut: boolean;
};

export type IDynamicModule<T = any> = {
  id: string;
  load: LoadModule<T>;
  isLoaded: boolean;
  count: number; // Number of times invoked/loaded.
  timeout: number; // Milliseconds.
};

/**
 * Module loader.
 */
export type DynamicImport<T = any, P = {}> = (props?: P) => Promise<T>;
export type ILoader = {
  length: number;
  modules: IDynamicModule[];
  loading: string[];
  events$: Observable<LoaderEvent>;
  add(moduleId: string, load: DynamicImport, options?: { timeout?: number }): ILoader;
  context<P extends object = any>(fn: SetLoaderContext<P>): ILoader;
  get<T = any>(moduleId: string | number): IDynamicModule<T> | undefined;
  exists(moduleId: string | number): boolean;
  count(moduleId: string | number): number;
  isLoading(moduleId?: string | number): boolean;
  isLoaded(moduleId: string | number): boolean;
  load<T = any, P = {}>(moduleId: string | number, props?: P): Promise<LoadModuleResponse<T>>;
  render<P = {}>(moduleId: string | number, props?: P): Promise<RenderModuleResponse>;
  getContextProps<P extends object = any>(): P;
};

/**
 * The context object that is passed down through the React hierarchy.
 */
export type ILoaderContext = {
  loader: ILoader;
  splash: ISplash;
};
export type SetLoaderContext<P extends object> = (args: { loader: ILoader; props: P }) => void;

/**
 * Splash screen.
 */
export type ISplash = {
  isVisible: boolean;
  isSpinning?: boolean;
  el?: JSX.Element;
  fadeSpeed?: number;
};

/**
 * [Events]
 */
export type LoaderEvent = IModuleAddedEvent | IModuleLoadingEvent | IModuleLoadedEvent;

export type IModuleAddedEvent<T = any> = {
  type: 'LOADER/added';
  payload: IModuleAdded<T>;
};
export type IModuleAdded<T = any> = {
  module: IDynamicModule<T>;
};

export type IModuleLoadingEvent = {
  type: 'LOADER/loading';
  payload: IModuleLoading;
};
export type IModuleLoading = {
  id: string; // Unique ID of the load operation (use to marry up with "loaded" event)
  module: string;
  count: number;
};

export type IModuleLoadedEvent<T = any> = {
  type: 'LOADER/loaded';
  payload: IModuleLoaded<T>;
};
export type IModuleLoaded<T = any> = {
  id: string; // Unique ID of the load operation (use to marry up with "loading" event)
  module: string;
  result: T;
  count: number;
  error?: Error;
  timedOut: boolean;
};
