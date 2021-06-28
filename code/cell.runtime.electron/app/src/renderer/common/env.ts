import { ElectronEnv } from './types';
import { ENV_KEY } from '../../common/constants';

const isWindow = typeof window !== 'undefined';
export const env = isWindow ? ((window as any)[ENV_KEY] as ElectronEnv) : undefined;
