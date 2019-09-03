import { Shell } from './api';

export { SplashFactory, SplashFactoryArgs } from '@platform/ui.loader/lib/types';

export * from './types';
export { Loader } from './components/Loader';
export { Context } from './Context';

const shell = Shell.singleton;
export const initial = shell.initial;
export const register = shell.register;
export const main = shell.main;
