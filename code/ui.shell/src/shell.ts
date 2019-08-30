export { SplashFactory, SplashFactoryArgs } from '@platform/ui.loader/lib/types';

export * from './types';
export * from './model';
export * from './context';
export { Loader } from './components/Loader';
export { Shell } from './components/Shell';

import { singleton } from '@platform/ui.loader';
export const loader = singleton;
