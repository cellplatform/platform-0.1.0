import { Shell } from './api';

export { SplashFactory, SplashFactoryArgs } from '@platform/ui.loader/lib/types';

export * from './types';

export { Loader } from './components/Loader';
export { Context } from './Context';

export const singleton = Shell.singleton;
export const initial = singleton.initial;
export const register = singleton.register;
export const main = singleton.main;
