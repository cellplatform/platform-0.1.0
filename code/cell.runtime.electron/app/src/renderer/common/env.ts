import { RuntimeDesktopEnv } from './types';
import { ENV_KEY } from '../../common/constants';

export const Env = {
  get: () => (window as any)[ENV_KEY] as RuntimeDesktopEnv,
};
